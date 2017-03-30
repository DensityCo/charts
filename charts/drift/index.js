import * as d3 from 'd3';
import './styles.scss';

const labels = {
  0: 'SUN', 
  1: 'MON', 
  2: 'TUE', 
  3: 'WED', 
  4: 'THU', 
  5: 'FRI', 
  6: 'SAT',
};
const brandPrimary = '#4198ff';
const grayDark = '#8E9299';
const positiveColor = brandPrimary;
const negativeColor = '#fbbf58';

const leftMargin = 48;
const topMargin = 32;

export default function drift(elem) {

  const svg = d3.select(elem).append('svg')
    .attr('class', 'graph graph-drift')
    .attr('width', '100%')

  // Create a group for everything to live in
  const g = svg.append("g")
    .attr('transform', `translate(${leftMargin},${topMargin})`)

  // Create groups for each chart part
  const axisGroup = g.append("g");

  const barGroup = g.append('g')
    .attr('transform', `translate(0,20)`);

  const midLine = g.append('line')
    .attr('class', 'mid-line');

  // When the chart updates...
  return (props={}) => {
    const width = props.width || 1000;
    const height = props.height || 350;

    const graphWidth = width - (2 * leftMargin);
    const graphHeight = height - (2 * topMargin);

    // Adjust svg attributes depending on props
    svg
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    if (props.data && props.data.length) {
      // Given an array of drifts, map them to data with a day name and count
      const data = props.data.map(drift => {
        return {
          day: labels[typeof drift.date === 'number' ? drift.date : drift.date.day()],
          value: drift.count
        };
      });

      const x = d3.scaleLinear().rangeRound([graphWidth, 0]);
      const y = d3.scaleBand().rangeRound([0, graphHeight]).padding(0.3);

      // Set the duration of the scales.
      // The x axis: values. Scales to have the largest value at the extremes, left and right.
      const maxData = d3.max(data, d => d.value), minData = d3.min(data, d => d.value);
      const maxExtreme = Math.max(Math.abs(maxData), Math.abs(minData), 2) * 1.4;
      x.domain([maxExtreme, -1 * maxExtreme]);
      // The y axis: labels for each day.
      y.domain(data.map(d => d.day));

      // Draw axes:
      // 1. Remove existing axes.
      axisGroup.selectAll("g").remove();

      // 2. Draw X axis / Y axis
      axisGroup.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisBottom(x).ticks(10).tickSizeOuter(0).tickSize(graphHeight))
      axisGroup.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(30,0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0));

      // Draw a line through the center
      midLine
        .attr('x1', x(0))
        .attr('y1', 0)
        .attr('x2', x(0))
        .attr('y2', graphHeight)
        .attr('stroke-width', 2)
        .attr('stroke', grayDark);

      // Create a data join
      let selection = barGroup.selectAll(".bar").data(data);
      selection.enter()
        .append("path")
          .attr("class", "bar")
        .merge(selection)
          .attr('d', d => {
            // Render a rectangular bar for each drift
            return [
              `M ${x(0)} ${y(d.day)}`, // move to the point
              `H ${x(d.value)}`,
              `V ${y(d.day) - y.bandwidth()}`,
              `H ${x(0)}`,
            ].join(' ');
          }).attr('fill', d => {
            return d.value > 0 ? positiveColor : negativeColor;
          }).attr('title', d => d.value);

      selection.exit().remove(); // remove items when they are no longer in the data.
    }
  }
}
