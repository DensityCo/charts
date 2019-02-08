import moment from 'moment';
import * as d3 from 'd3';
import './styles.scss';

const margin = {top: 50, right: 20, bottom: 30, left: 20};

export default function dailyMetrics(elem, props={}) {
  const svg = d3.select(elem).append('svg')
    .attr('class', 'historical-counts');

  const g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xAxisGroup = g.append("g")
    .attr("class", "daily-metrics-axis daily-metrics-axis-x");

  return ({data, width, height}) => {
    svg
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', `0 0 ${width} ${height}`)

    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    //
    // Scales
    //

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .rangeRound([0, graphWidth])
      .padding(0.1);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .rangeRound([graphHeight, 0]);

    //
    // Axes
    //

    xAxisGroup
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(xScale));

    const dataSelection = g.selectAll(".daily-metrics-bar-group").data(data);

    //
    // Enter
    //

    const dataSelectionEnterGroup = dataSelection.enter().append('g')
      .attr('class', 'daily-metrics-bar-group')
      .attr('transform', d => `translate(${xScale(d.label)},${yScale(d.value)})`);
    dataSelectionEnterGroup.append('rect')
      .attr('class', 'daily-metrics-bar')
      .attr('x', 0)
      .attr('y', 0)
    dataSelectionEnterGroup.append('path')
      .attr('class', 'daily-metrics-bar-outline')
    dataSelectionEnterGroup.append('text')
      .attr('class', 'daily-metrics-bar-label')
      .attr('text-anchor', 'middle')

    //
    // Merge
    //
    dataSelectionEnterGroup.merge(dataSelection)
      .attr('transform', d => `translate(${xScale(d.label)},${yScale(d.value)})`);
    dataSelectionEnterGroup.merge(dataSelection)
      .selectAll('.daily-metrics-bar')
      .attr('width', xScale.bandwidth())
      .attr('height', d => graphHeight - yScale(d.value));
    dataSelectionEnterGroup.merge(dataSelection)
      .selectAll('.daily-metrics-bar-outline')
      .attr('d', d => `M0,${graphHeight - yScale(d.value)} V0 H${xScale.bandwidth()} V${graphHeight - yScale(d.value)}`);
    dataSelectionEnterGroup.merge(dataSelection)
      .selectAll('.daily-metrics-bar-label')
      .attr('transform', d => `translate(${xScale.bandwidth() / 2},-10)`)
      .text(d => d.value);
  }
}
