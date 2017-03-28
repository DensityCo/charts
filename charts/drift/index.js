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

export default function drift(elem, props={}) {
  const drifts = props.drifts;

  const width = props.width || 1000;
  const height = props.height || 350;

  const graphWidth = width - (2 * leftMargin);
  const graphHeight = height - (2 * topMargin);

  if (drifts && drifts.length) {
    // Given an array of drifts, map them to data with a day name and count
    const data = drifts.map(drift => {
      return {
        day: labels[typeof drift.date === 'number' ? drift.date : drift.date.day()],
        value: drift.count
      };
    });

    const svg = d3.select(elem)
      .selectAll('svg').data([data])
      .enter()
        .append('svg')
        .attr('class', 'graph graph-drift')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    const x = d3.scaleLinear().rangeRound([graphWidth, 0]);
    const y = d3.scaleBand().rangeRound([0, graphHeight]).padding(0.3);

    // Create a group for everything to live in
    var g = svg.append("g").attr('transform', `translate(${leftMargin},${topMargin})`);

    // Set the duration of the scales.
    // The x axis: values. Scales to have the largest value at the extremes, left and right.
    let maxData = d3.max(data, d => d.value), minData = d3.min(data, d => d.value);
    let maxExtreme = Math.max(Math.abs(maxData), Math.abs(minData), 2) * 1.4;
    x.domain([maxExtreme, -1 * maxExtreme]);
    // The y axis: labels for each day.
    y.domain(data.map(d => d.day));

    // Draw the x axis (values)
    let xAxis = d3.axisBottom(x).ticks(10).tickSizeOuter(0).tickSize(graphHeight);
    g.append("g")
      .attr("class", "axis axis-x")
      .call(xAxis)
      .attr("transform", `translate(0,0)`);

    // Draw the y axis (labels)
    g.append("g")
      .attr("class", "axis axis-y")
      .attr("transform", `translate(30,0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));

    // Next, draw the bars. Make a group so that the bars can be drawn in it at the end of the
    // render cycle though.
    let barGroup = g.append('g').attr('transform', `translate(0,20)`);

    // Draw a line through the center
    g.append('line')
      .attr('class', 'mid-line')
      .attr('x1', x(0))
      .attr('y1', 0)
      .attr('x2', x(0))
      .attr('y2', graphHeight)
      .attr('stroke-width', 2)
      .attr('stroke', grayDark);

    // Create a data join
    let selection = barGroup.selectAll(".bar").data(data);
    let enterSelection = selection.enter().append("path").attr("class", "bar"); // add new items
    let exitSelection = selection.exit().remove(); // remove items when they are no longer in the data.
    
    let mergeSelection = enterSelection.merge(selection);

    // Render a rectangular bar for each drift
    mergeSelection.attr('d', d => {
      return [
        `M ${x(0)} ${y(d.day)}`, // move to the point
        `H ${x(d.value)}`,
        `V ${y(d.day) - y.bandwidth()}`,
        `H ${x(0)}`,
      ].join(' ');
    }).attr('fill', d => {
      return d.value > 0 ? positiveColor : negativeColor;
    }).attr('title', d => d.value).attr('class', 'bar');
  }
}
