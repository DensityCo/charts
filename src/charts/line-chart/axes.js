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

// A "simple" example axis. This demonstrates how to build an axis that works with the line chart.
// Usage as a react prop: xAxis={exampleAxis({color: 'red'})}
//
export function exampleAxis({color}) {
  color = color || 'royalblue';
  return ({scale}, element) => {
    // Add an axis:
    element.call(d3.axisBottom(scale));

    // Do some custom drawing:
    const selection = element.selectAll('rect').data([10, 20, 30]);
    selection.enter()
      .append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color)
    .merge(selection)
      .attr('x', d => d)
      .attr('y', d => d)
    selection.exit().remove()
  };
}

export function xAxisDailyTick({
  formatter,
  tickValues,
  tickResolutionInMs,
  bottomOffset, /* distance between the bottom edge of the svg and the axis labels */
}) {
  bottomOffset = bottomOffset || 15;

  return ({timeZone, scale, bottomMargin, dataPoints}, element) => {
    const axisFontSize = 14;

    // If manual tick values weren't specified, then generate our own using the `tickResolutionInMs`
    // property.
    tickValues = tickValues || d3.range(
      dataPoints.startXValue,
      dataPoints.endXValue,
      (tickResolutionInMs || (1 * ONE_HOUR_IN_MS))
    );

    let axis = d3.axisBottom(scale)
      .tickValues(tickValues)

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

    // Render the axis
    element.call(axis);

    // Remove some parts of the axis that aren't needed
    element.select('.domain').remove();
    element.selectAll('.tick line').remove();

    // Adjust the vertical spacing of each tick on the axis
    element.selectAll('.tick text')
      .attr('transform', `translate(0,${-10 + bottomOffset})`)
      .attr('font-size', axisFontSize)
  };
}

export function yAxisMinMax({
  formatter,
  leftOffset, /* distance between the left edge of the svg and the axis labels */
  showMinimumPoint,
  showMaximumPoint,

  points,

  axisRuleLineDashWidth,
  axisRuleLineDashSpacing,
}) {
  leftOffset = typeof leftOffset === 'undefined' ? 20 : leftOffset;
  axisRuleLineDashWidth = typeof axisRuleLineDashWidth === 'undefined' ? 4 : axisRuleLineDashWidth;
  axisRuleLineDashSpacing = typeof axisRuleLineDashSpacing === 'undefined' ? 10 : axisRuleLineDashSpacing;

  points = points || [];

  /* both showMinimumPoint and showMaximumPoint default to true if unspecified */
  showMinimumPoint = typeof showMinimumPoint === 'undefined' ? true : showMinimumPoint;
  showMaximumPoint = typeof showMaximumPoint === 'undefined' ? true : showMaximumPoint;

  return ({graphWidth, leftMargin, firstEventYValue, lastEventYValue, scale}, element) => {
    const axisFontSize = 14;
    const axisPoints = [
      ...(showMinimumPoint ? [{value: firstEventYValue, hasRule: false}] : []),
      ...(points || []),
      ...(showMaximumPoint ? [{value: lastEventYValue, hasRule: false}] : []),
    ];

    const selection = element.selectAll('.axis-y-point').data(axisPoints, d => JSON.stringify(d));

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

