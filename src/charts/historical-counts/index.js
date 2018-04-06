import './styles.scss';

import moment from 'moment';
import 'moment-timezone';

import * as d3 from 'd3';

import updateOverlayLine from './overlay-line';

const DAYS_PER_WEEK = 7,
      HOURS_PER_DAY = 24,
      MINUTES_PER_HOUR = 60,
      SECONDS_PER_MINUTE = 60,
      MILLISECONDS_PER_SECOND = 1000;


const NOOP = (a => a);

const overlayDialogTopHeight = 43;
const overlayDialogBottomHeight = 43;
const overlayDialogTextSize = 16; // Size of the text
const overlayDialogTextMargin = 12; // Y spacing between text and its container
const overlayDialogBorderRadius = 4;
const overlayDialogTopIconCenterOffset = 21;
const overlayDialogTopTextCenterOffset = 12;

const overlayDialogTopBottomMargin = 10;
const overlayDialogBottomTopMargin = 48;

const leftMargin = 60;
const rightMargin = 5;
const bottomMargin = overlayDialogBottomTopMargin + overlayDialogTopBottomMargin + 42;
const topMargin = 16 + overlayDialogTopHeight + overlayDialogTopBottomMargin;

// Distance between the overlay dialog and the line on the graph
const overlayDialogDistanceToLine = 10;

// Distance the overlay dialog has to get to the right side of the graph before the dialog breaks to
// the other side of the line.
const overlayDialogBreakToLeftPadding = 20;

// The count graph component
export default function historicalCounts(elem) {
  const svg = d3.select(elem).append('svg').attr('class', 'historical-counts');

  // Used so that the font size can be programatically calculated.
  const fontSizeTester = svg.append('text')
    .attr('class', 'historical-counts-font-size-tester');
    .attr('transform', 'translate(0,-100)'); /* make sure it's off screen */

  // Add filter for use in making shadows behind things.
  const filter = svg.append('filter')
    .attr('id', 'shadow-blur')
  filter.append('feGaussianBlur')
    .attr('stdDeviation', 4)
  filter.append('feOffset')
    .attr('dx', 0)
    .attr('dy', 2)

  const svgGroup = svg.append('g')
    .attr('transform', `translate(${leftMargin},${topMargin})`);

  // The capacity background overlay is drawn at the bottom of the stack in here.
  const capacityGroup = svgGroup.append('g')
    .attr('class', 'capacity-group');

  // The graph path that shows the data goes in here.
  const graphGroup = svgGroup.append('g')
    .attr('class', 'graph-group');

  graphGroup.append('path')
    .attr('class', 'historical-counts-path');
  graphGroup.append('path')
    .attr('class', 'historical-counts-path-outline');

  // The axes go in here.
  const axisGroup = svgGroup.append('g')
    .attr('class', 'axis-group');

  // Put all the overlay stuff in here (the line and dialog)
  const overlayGroup = svgGroup.append('g')
    .attr('class', 'overlay-group');

  // The hidden rectangle to use to detect mouse position
  const overlayRect = svgGroup.append('g')
    .attr('class', 'overlay-rect');

  function getTextWidth(text) {
    fontSizeTester.text(text);
    return fontSizeTester.node().getComputedTextLength();
  }

  return ({
    // Explicit start and end timestamps for data. If unspecified, defaults to the upper and lower
    // bounds of the data.
    start,
    end,

    width,
    height,

    data,
    capacity,
    initialCount,

    timeZone,
    timeZoneFormat,

    xAxisResolution,
    xAxisLabelFormat,
    yAxisLabelFormat,
    bottomOverlayLabelFormat,
    topOverlayLabelFormat,

    renderPersonIcon,
  }) => {
    width = width || 800;
    height = height || 400;
    capacity = capacity || null;
    initialCount = initialCount || 0;
    timeZone = timeZone || 'UTC';
    renderPersonIcon = typeof renderPersonIcon === 'undefined' ? true : renderPersonIcon;

    topOverlayLabelFormat = topOverlayLabelFormat || NOOP;
    timeZoneFormat = timeZoneFormat || NOOP;

    xAxisLabelFormat = xAxisLabelFormat || (n => {
      // "5a" or "8p"
      const timeFormat = moment.utc(n).tz(timeZone).format(`hA`);
      return timeFormat.slice(
        0, 
        timeFormat.startsWith('12') ? -1 : -2
      ).toLowerCase();
    });
    yAxisLabelFormat = yAxisLabelFormat || NOOP;
    bottomOverlayLabelFormat = bottomOverlayLabelFormat || (n => {
      // Decide how to format the time shown in the lower panel on the hover overlay.
      let timeFormat = `hh:mm A[${timeZone ? ` (${timeZoneFormat(timeZone)}) ` : ' '}]ddd MMM DD`;
      if (xAxisResolution === 'day' || xAxisResolution === 'week') {
        timeFormat = `ddd MMM DD YYYY`;
      }
      return moment.utc(n).tz(timeZone).format(timeFormat);
    });

    // Convert the timestamp in each item into epoch milliseconds, then sort the data to be
    // oldest-timestamp first.
    data = (data || []).map(i => {
      if (i.timestamp instanceof moment) {
        return Object.assign({}, i, {timestamp: i.timestamp.valueOf()});
      } else {
        return Object.assign({}, i, {timestamp: moment.utc(i.timestamp).valueOf()});
      }
    }).slice().sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    // Adjust the svg size and viewbox to match the passed in values.
    svg
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', `0 0 ${width} ${height}`)

    // Get the drawn graph size, minus the borders.
    const graphWidth = width - leftMargin - rightMargin;
    const graphHeight = height - topMargin - bottomMargin;

    // Get everything you'd ever want to know about the first and last events
    const firstEvent = data.length > 0 ? data[0] : null;
    const dataStart = firstEvent ? firstEvent.timestamp : moment.utc().valueOf();
    const domainStart = start || dataStart;

    const lastEvent = data.length > 0 ? data[data.length - 1] : null;
    const lastCount = lastEvent ? lastEvent.count : 0;
    const dataEnd = lastEvent ? lastEvent.timestamp : moment.utc().valueOf();
    const domainEnd = end || dataEnd;

    const largestCount = data.length > 0 ? Math.max.apply(Math, data.map(i => Math.max(i.count, initialCount))) : 0;
    const smallestCount = data.length > 0 ? Math.min.apply(Math, data.map(i => Math.min(i.count, initialCount))) : 0;

    // Construct scales, which are used to map a raw value in the x and y directions into pixel
    // values.
    const xScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([domainEnd, domainStart]);
    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight - 10, 0])
      .domain([smallestCount, capacity > largestCount ? capacity : largestCount]);

    const lastX = xScale(dataEnd);
    const lastY = yScale(lastCount);


    // Render capacity overlay behind the graph path, if a capacity was passed.
    if (capacity) {
      const capacityHeightInPx = yScale(capacity);
      const capacitySelection = capacityGroup
        .selectAll('.historical-counts-capacity-region')
        .data([capacityHeightInPx]);

      capacitySelection.enter()
        .append('rect')
        .attr('class', 'historical-counts-capacity-region')
      .merge(capacitySelection)
        .attr('x', 0)
        .attr('y', d => d)
        .attr('width', graphWidth)
        .attr('height', d => graphHeight - d)

      capacitySelection.exit();
    }


    // Generate the svg path for the graph line.
    const pathPrefix = `M1,${graphHeight}` +
      `L1,${yScale(initialCount)}` +
      `H${xScale(dataStart)}`;
    const pathSuffix = `H${lastX}V${graphHeight}H1`;

    // Build the path by looping through the data
    const linePath = data.reduce((total, i) => {
      // Step to the new point
      const xPosition = xScale(i.timestamp);
      const yPosition = yScale(i.count);
      if (xPosition == 0) {
        // For the first plotted point, don't draw an outline on the left edge.
        return `${total}M0,${yPosition}`;
      } else if (xPosition > 0) {
        // Plot each point my moving horizontally then vertically.
        return `${total}H${xPosition}V${yPosition}`;
      } else {
        return total;
      }
    }, '');

    graphGroup.select('.historical-counts-path')
      .attr('d', pathPrefix + linePath + pathSuffix);
    graphGroup.select('.historical-counts-path-outline')
      .attr('d', `M0,${yScale(initialCount)}` + linePath + `H${lastX}`);



    // Draw the axes in the svg

    // Remove all axes that are already drawn
    axisGroup.selectAll("g").remove();

    // Render the y axis.
    axisGroup.call(
      require('./axis-y').default,
      yScale, graphWidth,
      smallestCount, largestCount, capacity,
      yAxisLabelFormat
    );


    // Get the first tick mark's lovation on the chart's x axis.
    const firstHourMark = moment.utc(domainStart).startOf('hour').valueOf();

    // Figure out how much time to put between ticks. Defaults to an hour.
    xAxisResolution = xAxisResolution || 'hour';
    let xAxisTimeBetweenTicks = MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
    if (xAxisResolution === 'day') {
      xAxisTimeBetweenTicks *= HOURS_PER_DAY;
    }
    if (xAxisResolution === 'week') {
      xAxisTimeBetweenTicks *= (DAYS_PER_WEEK * HOURS_PER_DAY);
    }

    let xAxis = d3.axisBottom(xScale)
      // Position a tick at the first whole hour on the axis, then another tick for each hour
      // thereafter.
      .tickValues(d3.range(firstHourMark, domainEnd, xAxisTimeBetweenTicks))
      .tickSizeOuter(0)
      .tickFormat(xAxisLabelFormat);

    axisGroup.append("g")
      .attr("class", 'historical-counts-axis-x')
      .attr("transform", `translate(0,${graphHeight})`)
      .call(xAxis);


    function showOverlay() {
      const mouseX = d3.mouse(overlayRect.node())[0];
      overlayGroup.call(updateOverlayLine,
        xScale, yScale, domainStart, domainEnd, graphWidth, graphHeight, initialCount,
        lastEvent, getTextWidth,
        overlayDialogTopBottomMargin, overlayDialogBottomTopMargin, overlayDialogBorderRadius,
        overlayDialogTopHeight, overlayDialogBottomHeight,
        overlayDialogTopIconCenterOffset, overlayDialogTopTextCenterOffset,
        data, mouseX, xAxisResolution,
        bottomOverlayLabelFormat, topOverlayLabelFormat,
        renderPersonIcon,
      );
    }

    if (overlayRect.selectAll('rect').size() === 0) {
      overlayRect.append('rect').attr('fill', 'transparent');
    }

    overlayRect.select('rect')
      .attr('x', -1 * leftMargin)
      .attr('y', -1 * topMargin)
      .attr('width', leftMargin + graphWidth + rightMargin)
      .attr('height', topMargin + graphHeight + bottomMargin)
      .on('touchstart', showOverlay)
      .on('touchmove', showOverlay)
      .on('mousemove', showOverlay)
      .on('mouseout', () => {
        overlayGroup.call(updateOverlayLine,
          xScale, yScale, domainStart, domainEnd, graphWidth, graphHeight, initialCount,
          lastEvent, getTextWidth,
          overlayDialogTopBottomMargin, overlayDialogBottomTopMargin, overlayDialogBorderRadius,
          overlayDialogTopHeight, overlayDialogBottomHeight,
          overlayDialogTopIconCenterOffset, overlayDialogTopTextCenterOffset,
          data, null, xAxisResolution,
          bottomOverlayLabelFormat, topOverlayLabelFormat,
          renderPersonIcon
        );
      });
  }
}
