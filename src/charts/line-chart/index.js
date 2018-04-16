import * as d3 from 'd3';

import moment from 'moment';
import 'moment-timezone';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;


export default function lineChart(elem, props={}) {
  const svg = d3.select(elem).append('svg');

  const layers = {
    background: svg.append('g').attr('class', 'layer layer-bg'),

    xAxis: svg.append('g').attr('class', 'layer layer-x-axis'),
    yAxis: svg.append('g').attr('class', 'layer layer-y-axis'),
  };

  return ({
    timeZone,
    data,

    start,
    end,
  }) => {
    // ------------------------------------------------------------------------
    // ADJUST GRAPH SIZE
    // ------------------------------------------------------------------------
    const svgWidth = 500;
    const svgHeight = 300;

    const topMargin = 20;
    const leftMargin = 56;
    const rightMargin = 20;
    const bottomMargin = 20;

    const graphWidth = svgWidth - leftMargin - rightMargin;
    const graphHeight = svgHeight - topMargin - bottomMargin;

    svg.attr('width', svgWidth);
    svg.attr('height', svgHeight);

    layers.xAxis.attr('transform', `translate(${leftMargin},${topMargin+graphHeight})`)
    layers.yAxis.attr('transform', `translate(${leftMargin},${topMargin})`)

    // ------------------------------------------------------------------------
    // GATHERING DATA POINTS
    // ------------------------------------------------------------------------
    const dataPoints = {};

    dataPoints.firstEvent = data[0];
    dataPoints.lastEvent = data.slice(-1)[0];

    dataPoints.firstEventXValue = moment.utc(dataPoints.firstEvent.timestamp).valueOf(); /* epoch ms */
    dataPoints.firstEventYValue = dataPoints.firstEvent.value;
    dataPoints.lastEventXValue = moment.utc(dataPoints.lastEvent.timestamp).valueOf(); /* epoch ms */
    dataPoints.lastEventYValue = dataPoints.lastEvent.value;

    dataPoints.startXValue = start || dataPoints.firstEventXValue;
    dataPoints.endXValue = end || dataPoints.lastEventXValue;

    dataPoints.startYValue = start || dataPoints.firstEventYValue;
    dataPoints.endYValue = end || dataPoints.lastEventYValue;

    const xScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([dataPoints.startXValue, dataPoints.endXValue]);

    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight, 0])
      .domain([dataPoints.startYValue, dataPoints.endYValue]);

    // ------------------------------------------------------------------------
    // X AXIS
    // ------------------------------------------------------------------------
    const xAxis = xAxisDailyTick({
      timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
    });

    xAxis({
      scale: xScale,
      timeZone,
    }, layers.xAxis);

    // ------------------------------------------------------------------------
    // Y AXIS
    // ------------------------------------------------------------------------
    const yAxis = yAxisMinMax({
      leftOffset: 20,
      axisRuleLineDashWidth: 4,
      axisRuleLineDashSpacing: 10,
    });

    yAxis({
      scale: yScale,
      firstEventYValue: dataPoints.firstEventYValue,
      lastEventYValue: dataPoints.lastEventYValue,
      graphWidth,
      leftMargin,
    }, layers.yAxis);

    // ------------------------------------------------------------------------
    // BACKGROUND
    // ------------------------------------------------------------------------
    const backgroundSelection = layers.background.selectAll('.background').data([dataPoints]);
    backgroundSelection.enter()
      .append('rect')
    .merge(backgroundSelection)
      .attr('x', d => leftMargin)
      .attr('y', d => topMargin)
      .attr('width', graphWidth)
      .attr('height', graphHeight)
      .attr('fill', 'red')
    backgroundSelection.exit().remove()
  }
}

export function xAxisDailyTick({formatter, timeBetweenTicksInMs}) {
  return ({timeZone, scale}, element) => {
    element.call(
      d3.axisBottom(scale)
        // Position a tick at the first whole hour on the axis, then another tick for each hour
        // thereafter.
        .tickSizeOuter(0)
        .tickFormat(formatter || (n => {
          // "5a" or "8p"
          const timeFormat = moment.utc(n).tz(timeZone).format(`hA`);
          return timeFormat.slice(
            0, 
            timeFormat.startsWith('12') ? -1 : -2
          ).toLowerCase();
        }))
    );
  };
}

export function yAxisMinMax({
  formatter,
  leftOffset, /* distance between the left edge of the svg and the axis labels */

  axisRuleLineDashWidth,
  axisRuleLineDashSpacing,
}) {
  return ({graphWidth, leftMargin, firstEventYValue, lastEventYValue, scale}, element) => {
    const axisFontSize = 14;
    const points = [
      firstEventYValue,
      6,
      lastEventYValue,
    ];

    const selection = element.selectAll('.axis-y-point').data(points);

    // On enter selection, create a group with a text element and line inside. These will be used to
    // render each datapoint on the y axis.
    const enterSelection = selection.enter();
    const enterSelectionGroup = enterSelection.append('g')
      .attr('class', 'axis-y-point')
      .attr('font-size', axisFontSize)
      .attr('transform', d => {
        let x = -1 * (leftMargin - leftOffset);
        let y = scale(d);

        // For all datapoints except for the first one, draw them a bit higher so the label is
        // centered about the datapoint (instead, the datapoint would be at the bottom of the point)
        if (d !== firstEventYValue) {
          y += axisFontSize / 2
        }
        return `translate(${x},${y})`;
      });
    enterSelectionGroup.append('text')
      .attr('class', 'axis-y-point-label')
      .text(formatter || (d => {
        return `${d}`;
      }));
    enterSelectionGroup.append('path')
      .attr('class', 'axis-y-point-rule')
      .attr('transform', `translate(${leftMargin - leftOffset},${-1 * (axisFontSize * 0.4)})`)
      .attr('stroke', 'green')
      .attr('stroke-width', '1')
      .attr('d', d => {
        // Don't add horizontal lines for the labels at the extremes
        if (d === firstEventYValue || d === lastEventYValue) {
          return '';
        }

        return `M0,0 ${(function(graphWidth) {
          let linePath = '';
          for (let i = 0; i < graphWidth; i += axisRuleLineDashWidth + axisRuleLineDashSpacing) {
            linePath += `H${i+axisRuleLineDashWidth} M${i+axisRuleLineDashWidth+axisRuleLineDashSpacing},0`;
          }
          return linePath;
        })(graphWidth)}`;
      });

    // On merge, add the text to each datapoint on the axis.
    const mergeSelection = selection.merge(enterSelection);
    // mergeSelection

    // On exit, remove any axis points that are no longer required
    selection.exit().remove();

    return element;
  };
}
