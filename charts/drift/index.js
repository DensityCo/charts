import './styles.scss';
import * as d3 from 'd3';

const labels = {
  0: 'SUN', 
  1: 'MON', 
  2: 'TUE', 
  3: 'WED', 
  4: 'THU', 
  5: 'FRI', 
  6: 'SAT',
};
const grayDark = '#8E9299';

const mobileMaxWidth = 768;
const leftMargin = 16;
const topMargin = 16;
const bottomMargin = 16;
const rightMargin = 16;

// The distance between the bar labels and the bars. Depending on whether the bar is positive or
// negative, this number is either added or subtracted to the center line to determine the label
// position.
const textLabelOffsetFromBar = 20;
const generateDriftLabel = (width, d) => {
  return d.eventCount + 
    (width > mobileMaxWidth ? ' events / ' : ' / ') +
    (d.eventCount ? Math.floor(d.drift / d.eventCount * 100) : 0) +
    (width > mobileMaxWidth ? '% drift' : '%');
};

export default function drift(elem) {
  const svg = d3.select(elem).append('svg')
    .attr('class', 'graph graph-drift')
    .attr('width', '100%')

  // Create a group for everything to live in
  const g = svg.append("g")
    .attr('transform', `translate(${leftMargin},${topMargin})`)

  // Create groups for each chart part
  const axisGroup = g.append("g");

  const midLine = g.append('line')
    .attr('class', 'mid-line')
    .attr('transform', 'translate(0,-20)');

  const barGroup = g.append('g')
    .attr('transform', 'translate(0,20)');

  // When the chart updates...
  return (props={}) => {
    const width = props.width || 1000;
    const height = props.height || 350;

    const graphWidth = width - leftMargin - rightMargin;
    const graphHeight = height - topMargin - bottomMargin;

    // Adjust svg attributes depending on props
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    if (props.data && props.data.length) {
      // Given an array of drifts, map them to data with a day name and count
      const data = props.data.map(item => {
        return {
          ...item,
          day: labels[typeof item.date === 'number' ? item.date : item.date.day()],
        };
      });

      const x = d3.scaleLinear().rangeRound([graphWidth, 0]);
      const y = d3.scaleBand().rangeRound([0, graphHeight]).padding(0.3);

      // Set the duration of the scales.
      // The x axis: values. Scales to have the largest value at the extremes, left and right.
      const maxData = d3.max(data, d => d.drift), minData = d3.min(data, d => d.drift);
      const maxExtreme = Math.max(Math.abs(maxData), Math.abs(minData), 2) * 1.4;
      x.domain([maxExtreme, -1 * maxExtreme]);
      // The y axis: labels for each day.
      y.domain(data.map(d => d.day));

      // Draw a line through the center
      midLine
        .attr('x1', x(0))
        .attr('y1', 0)
        .attr('x2', x(0))
        .attr('y2', graphHeight)
        .attr('stroke-width', 1)
        .attr('stroke', grayDark);

      // Create a data join
      const selection = barGroup.selectAll(".bar").data(data);

      // Enter selection creates a group with a bar path in it, and a text element with a label for
      // the hover state.
      const enterSelection = selection.enter().append("g")
        .attr("class", "bar")

      enterSelection.append("path")
        .attr('class', 'bar-path')
      enterSelection.append("text")
        .attr('class', 'bar-label')

      // This rectangle is used for hover detection, and therefore is purposefully last in the group.
      // When the user hovers over a bar, set the `active` class on the hovered over bar while the
      // rest get that class cleared.
      enterSelection.append("rect")
        .attr('class', 'hover-detector')
        .on('mouseover', function() {
          d3.select(this.parentNode).attr('class', 'bar active') // update active bar
        })
        .on('mouseout', function() {
          barGroup.selectAll(".bar").attr('class', 'bar') // reset class on all bars
        })

      // Merge selection
      const mergeSelection = enterSelection.merge(selection);

      mergeSelection // Position each bar at the correct y position
        .attr('transform', d => `translate(0, ${y(d.day)})`)

      mergeSelection.select('.hover-detector')
        .attr('x', 0)
        .attr('y', -1 * y.bandwidth())
        .attr('width', graphWidth)
        .attr('height', y.bandwidth())

      // Update each bar in the graph:
      mergeSelection.select(".bar-path")
        .attr('d', d => {
          if (d.drift === 0) {
            const radius = y.bandwidth() / 2;
            // Render a circle for each zero drift
            return [
              `M ${x(0)} -${radius}`,
              `m -${radius}, 0`,
              `a ${radius},${radius} 0 1,0 ${radius * 2},0`,
              `a ${radius},${radius} 0 1,0 -${radius * 2},0`,
            ].join(' ');
          } else {
            // Make all rectangular bars avoid the center line
            let barOffset = 0;
            if (d.drift > 0) {
              barOffset = 0.5;
            } else if (d.drift < 0) {
              barOffset = -0.5;
            }

            // Render a rectangular bar for each nonzero drift
            return [
              `M ${x(0) + barOffset} 0`,
              `H ${x(d.drift) + barOffset}`,
              `V ${-1 * y.bandwidth()}`,
              `H ${x(0) + barOffset}`,
            ].join(' ');
          }
        }).attr('title', d => d.drift);

      // Draw the text vertically centered along each bar, and on the let if the bar goes to the
      // right (and vice versa if the bar goes to the left)
      mergeSelection.select("text")
        .attr('transform', d => [
          `translate(`,
          d.drift < 0 ? x(0) + textLabelOffsetFromBar : x(0) - textLabelOffsetFromBar, // x pos
          `, `,
          -0.5 * y.bandwidth(), // y pos
          `)`
        ].join(''))
        .attr('class', d => d.drift < 0 ? 'label-right' : 'label-left')
        .text(generateDriftLabel.bind(null, width))

      selection.exit().remove(); // remove items when they are no longer in the data.

      
      // Draw axes:
      // 1. Remove existing axes.
      axisGroup.selectAll("g").remove();

      // 2. Draw X axis / Y axis
      axisGroup.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", "translate(-0.5,-20)")
        .call(d3.axisBottom(x).ticks(10).tickSizeOuter(0).tickSize(graphHeight))
      axisGroup.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(${width > mobileMaxWidth ? 40 : 30}, 0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0));
    }
  }
}
