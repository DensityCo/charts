import * as d3 from 'd3';

import moment from 'moment';
import 'moment-timezone';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

const colorVariables = {
  "grayCinder": "#222A2E",

  "grayDarkest": "#4E5457",
  "grayDarker": "#8E9299",
  "grayDark": "#B4B8BF",
  "gray": "#CBCFD6",
  "grayLight": "#E8E8ED",
  "grayLighter": "#F0F0F2",
  "grayLightest": "#FAFAFA",

  "brandPrimary": "#4198FF",
  "brandSuccess": "#80CD80",
  "brandDanger": "#FF5454",
  "brandWarning": "#FFBA08",
};


export default function lineChart(elem, props={}) {
  const svg = d3.select(elem).append('svg');

  const layers = {
    background: svg.append('g').attr('class', 'layer layer-bg'),
    data: svg.append('g').attr('class', 'layer layer-data'),

    xAxis: svg.append('g').attr('class', 'layer layer-x-axis'),
    yAxis: svg.append('g').attr('class', 'layer layer-y-axis'),
  };

  return ({
    timeZone,
    data,

    xAxis,
    yAxis,

    xAxisStart,
    xAxisEnd,
    yAxisStart,
    yAxisEnd,
  }) => {

    // ------------------------------------------------------------------------
    // ADJUST GRAPH SIZE
    // ------------------------------------------------------------------------
    const svgWidth = 500;
    const svgHeight = 300;

    const topMargin = 20;
    const leftMargin = 56;
    const rightMargin = 20;
    const bottomMargin = 56;

    const graphWidth = svgWidth - leftMargin - rightMargin;
    const graphHeight = svgHeight - topMargin - bottomMargin;

    svg.attr('width', svgWidth);
    svg.attr('height', svgHeight);

    layers.xAxis.attr('transform', `translate(${leftMargin},${topMargin+graphHeight})`)
    layers.yAxis.attr('transform', `translate(${leftMargin},${topMargin})`)
    layers.data.attr('transform', `translate(${leftMargin},${topMargin})`)

    // ------------------------------------------------------------------------
    // GATHERING DATA POINTS
    // ------------------------------------------------------------------------
    const dataPoints = {};

    const defaultDataset = data.find(i => i.name === 'default');

    dataPoints.firstEvent = defaultDataset.data[0];
    dataPoints.lastEvent = defaultDataset.data.slice(-1)[0];

    dataPoints.firstEventXValue = moment.utc(dataPoints.firstEvent.timestamp).valueOf(); /* epoch ms */
    dataPoints.firstEventYValue = dataPoints.firstEvent.value;
    dataPoints.lastEventXValue = moment.utc(dataPoints.lastEvent.timestamp).valueOf(); /* epoch ms */
    dataPoints.lastEventYValue = dataPoints.lastEvent.value;

    dataPoints.eventWithSmallestValue = defaultDataset.data.reduce((a, b) => a.value < b.value ? a : b, {value: Infinity});
    dataPoints.eventWithLargestValue = defaultDataset.data.reduce((a, b) => a.value > b.value ? a : b, {value: -1});

    dataPoints.startXValue = xAxisStart ? moment.utc(xAxisStart).valueOf() : dataPoints.firstEventXValue;
    dataPoints.endXValue = xAxisEnd ? moment.utc(xAxisEnd).valueOf() : dataPoints.lastEventXValue;

    dataPoints.startYValue = typeof yAxisStart !== 'undefined' ? yAxisStart : dataPoints.eventWithSmallestValue.value;
    dataPoints.endYValue = typeof yAxisEnd !== 'undefined' ? yAxisEnd : dataPoints.eventWithLargestValue.value;

    const xScale = d3.scaleLinear()
      .rangeRound([0, graphWidth])
      .domain([dataPoints.startXValue, dataPoints.endXValue]);

    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight, 0])
      .domain([dataPoints.startYValue, dataPoints.endYValue]);

    // ------------------------------------------------------------------------
    // X AXIS
    // ------------------------------------------------------------------------
    xAxis({
      scale: xScale,
      timeZone,
      bottomMargin,
    }, layers.xAxis);

    // ------------------------------------------------------------------------
    // Y AXIS
    // ------------------------------------------------------------------------
    yAxis({
      scale: yScale,
      firstEventYValue: dataPoints.startYValue,
      lastEventYValue: dataPoints.endYValue,
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
      .attr('fill', '#fff')
    backgroundSelection.exit().remove()

    // ------------------------------------------------------------------------
    // WATERLINES
    // ------------------------------------------------------------------------
    const dataSelection = layers.data.selectAll('.data').data(data);
    dataSelection.enter()
      .append('g')
        .attr('class', 'data')
    .merge(dataSelection)
      .each(function(d) {
        return d.type(d)({
          xScale,
          yScale,
          graphHeight,
          graphWidth,
          dataPoints,
        }, this); /* this = reference to the g.data created above */
      });
  }
}

export function xAxisDailyTick({
  formatter,
  tickValues,
  bottomOffset, /* distance between the bottom edge of the svg and the axis labels */
}) {
  return ({timeZone, scale, bottomMargin}, element) => {
    const axisFontSize = 14;

    // Use the proper font size for the axis
    element.attr('font-size', axisFontSize)

    let axis = d3.axisBottom(scale)
      // Position a tick at the first whole hour on the axis, then another tick for each hour
      // thereafter.
      .tickFormat(formatter || (n => {
        // "5a" or "8p"
        const timeFormat = moment.utc(n).tz(timeZone).format(`hA`);
        return timeFormat.slice(
          0, 
          timeFormat.startsWith('12') ? -1 : -2
        ).toLowerCase();
      }));

    // If tick values were passed, then use those values on the axis
    if (tickValues) {
      axis = axis.tickValues(tickValues);
    }

    // Render the axis
    element.call(axis);

    // Remove some parts of the axis that aren't needed
    element.select('.domain').remove();
    element.selectAll('.tick line').remove();

    // Adjust the vertical spacing of each tick on the axis
    element.selectAll('.tick text')
      .attr('transform', `translate(0,${-10 + bottomMargin - bottomOffset})`)
  };
}

export function yAxisMinMax({
  formatter,
  leftOffset, /* distance between the left edge of the svg and the axis labels */

  points,

  axisRuleLineDashWidth,
  axisRuleLineDashSpacing,
}) {
  return ({graphWidth, leftMargin, firstEventYValue, lastEventYValue, scale}, element) => {
    const axisFontSize = 14;
    const axisPoints = [
      {value: firstEventYValue, hasRule: false},
      ...(points || []),
      {value: lastEventYValue, hasRule: false},
    ];

    const selection = element.selectAll('.axis-y-point').data(axisPoints);

    // On enter selection, create a group with a text element and line inside. These will be used to
    // render each datapoint on the y axis.
    const enterSelection = selection.enter();
    const enterSelectionGroup = enterSelection.append('g')
      .attr('class', 'axis-y-point')
      .attr('font-size', axisFontSize)
    enterSelectionGroup.append('text')
      .attr('class', 'axis-y-point-label')
    enterSelectionGroup.append('path')
      .attr('class', 'axis-y-point-rule')

    // On merge, add the text to each datapoint on the axis.
    const mergeSelection = enterSelectionGroup.merge(enterSelection)
      .attr('transform', d => {
        let x = -1 * (leftMargin - leftOffset);
        let y = scale(d.value);

        // For all datapoints except for the first one, draw them a bit higher so the label is
        // centered about the datapoint (instead, the datapoint would be at the bottom of the point)
        if (d !== firstEventYValue) {
          y += axisFontSize / 2
        }
        return `translate(${x},${y})`;
      });
    mergeSelection.select('.axis-y-point-label')
      .text(formatter || (d => {
        return `${d.value}`;
      }));
    mergeSelection.select('.axis-y-point-rule')
      .attr('transform', `translate(${leftMargin - leftOffset},${-1 * (axisFontSize * 0.4)})`)
      .attr('stroke', colorVariables.gray)
      .attr('stroke-width', '1')
      .attr('shape-rendering', 'crispEdges')
      .attr('d', d => {
        // Don't add horizontal lines for points that don't specify a rule is required.
        if (!d.hasRule) {
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

    // On exit, remove any axis points that are no longer required
    selection.exit().remove();

    return element;
  };
}

export function dataWaterline({
  data,
  color,
  borderColor,
}) {
  return ({xScale, yScale, graphHeight, dataPoints}, element) => {
    const waterlinePrefix = `M0,${graphHeight}` + /* move to the lower left of the graph */
      `L0,${yScale(dataPoints.startYValue)}`; /* move to the first datapoint in the waterline */
    const waterlinePostfix = `H${xScale(dataPoints.lastEventXValue)}V${graphHeight}H1`;

    const waterlineSelection = d3.select(element).selectAll('.waterline').data([data]);
    const waterlineSelectionGroup = waterlineSelection.enter()
      .append('g')
        .attr('class', 'waterline');
    waterlineSelectionGroup.append('path')
      .attr('class', 'waterline-fill')
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', color);
    waterlineSelectionGroup.append('path')
      .attr('class', 'waterline-stroke')
      .attr('stroke', borderColor)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', 'transparent');

    waterlineSelectionGroup.merge(waterlineSelection)
      .select('.waterline-fill')
      .attr('d', d => {
        return waterlinePrefix + d.reduce((acc, i) => {
          const xPosition = xScale(moment.utc(i.timestamp).valueOf());
          const yPosition = yScale(i.value);
          return `${acc} H${xPosition} V${yPosition}`;
        }, '') + waterlinePostfix;
      });
    waterlineSelectionGroup.merge(waterlineSelection)
      .select('.waterline-stroke')
      .attr('d', d => {
        return `M0,${graphHeight} M0,${yScale(dataPoints.firstEventYValue)}` + d.reduce((acc, i) => {
          const xPosition = xScale(moment.utc(i.timestamp).valueOf());
          const yPosition = yScale(i.value);
          return `${acc} H${xPosition} V${yPosition}`;
        }, '');
      });
    waterlineSelection.exit().remove();
  };
}
