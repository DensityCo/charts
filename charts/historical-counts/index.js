import './styles.scss';
import moment from 'moment';
import * as d3 from 'd3';

import updateOverlayLine from './overlay-line';

const DAYS_PER_WEEK = 7,
      MINUTES_PER_HOUR = 60,
      SECONDS_PER_MINUTE = 60,
      MILLISECONDS_PER_SECOND = 1000;

const overlayDialogTopHeight = 43;
const overlayDialogTopWidth = 72;
const overlayDialogBottomHeight = 43;
const overlayDialogBottomWidth = 232;
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

  // Add filter for use in making shadows behind things.
  svg.append('filter')
    .attr('id', 'shadow-blur')
    .append('feGaussianBlur')
      .attr('stdDeviation', 5)

  const svgGroup = svg.append('g')
    .attr('transform', `translate(${leftMargin},${topMargin})`);

  // The capacity background overlay is drawn at the bottom of the stack in here.
  const capacityGroup = svgGroup.append('g')
    .attr('class', 'capacity-group');

  // The graph path that shows the data goes in here.
  const graphGroup = svgGroup.append('g')
    .attr('class', 'graph-group');

  // The axes go in here.
  const axisGroup = svgGroup.append('g')
    .attr('class', 'axis-group');

  // Flags are all stuck in this group, must be above the axes, otehrwise the horizontal axis rules
  // cross over the flag line and make it look like a dotted line.
  const flagGroup = svgGroup.append('g')
    .attr('class', 'flag-group');

  // Put all the overlay stuff in here (the line and dialog)
  const overlayGroup = svgGroup.append('g')
    .attr('class', 'overlay-group');

  // The hidden rectangle to use to detect mouse position
  const overlayRect = svgGroup.append('g')
    .attr('class', 'overlay-rect');

  return ({start, end, width, height, data, capacity, initialCount, timeZoneLabel, timeZoneOffset}) => {
    width = width || 800;
    height = height || 400;
    capacity = capacity || null;
    initialCount = initialCount || 0;

    // Convert the timestamp in each item into epoch milliseconds.
    data = (data || []).map(i => {
      if (i.timestamp instanceof moment) {
        return Object.assign({}, i, {timestamp: i.timestamp.valueOf()});
      } else {
        return Object.assign({}, i, {timestamp: moment.utc(i.timestamp).valueOf()});
      }
    });

    const flags = [];

    // Adjust the svg size and viewbox to match the passed in values.
    svg
      .attr('height', height)
      .attr('width', width)
      .attr('viewBox', `0 0 ${width} ${height}`)

    if (!Array.isArray(data)) {
      throw new Error(`A 'data' prop is required.`);
    }

    // Get the drawn graph size, minus the borders.
    const graphWidth = width - leftMargin - rightMargin;
    const graphHeight = height - topMargin - bottomMargin;

    // Get first and last timestamps
    const firstEvent = data.length && data[0];
    const dataStart = firstEvent ? firstEvent.timestamp : moment.utc();
    const domainStart = start || dataStart;

    const lastEvent = data.length && data[data.length - 1];
    const lastCount = lastEvent ? lastEvent.count : 0;
    const dataEnd = lastEvent ? lastEvent.timestamp : moment.utc();
    const domainEnd = end || dataEnd;

    // Construct scales
    const xScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([domainEnd, domainStart]);
    const largestCount = data.length > 0 ? Math.max.apply(Math, data.map(i => Math.max(i.count, initialCount))) : 0;
    const smallestCount = data.length > 0 ? Math.min.apply(Math, data.map(i => Math.min(i.count, initialCount))) : 0;
    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight - 10, 0])
      .domain([smallestCount, largestCount]);

    const lastX = xScale(moment.min(domainEnd, moment.utc()));
      const lastY = yScale(lastEvent.count);


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
      // Extract flags so we can draw them on top
      if (i.flag) { flags.push(i); }

      // Step to the new point
      const xPosition = xScale(i.timestamp);
      const yPosition = yScale(i.count);
      if (xPosition >= 0) {
        return `${total}H${xPosition}V${yPosition}`;
      } else {
        return total;
      }
    }, '');

    const graphSelection = graphGroup
      .selectAll('.historical-counts-path')
      .data([data]);

    const graphEnterSelection = graphSelection.enter();
    graphEnterSelection
      .append('path')
      .attr('class', 'historical-counts-path');
    graphEnterSelection
      .append('path')
      .attr('class', 'historical-counts-path-outline');

    const graphMergeSelection = graphEnterSelection.merge(graphSelection);
      graphMergeSelection.select('.historical-counts-path')
        .attr('d', d => pathPrefix + linePath + pathSuffix);
      graphMergeSelection.select('.historical-counts-path-outline')
        .attr('d', d => pathPrefix + linePath);

    graphSelection.exit();



    // Draw the axes in the svg

    // Remove all axes that are already drawn
    axisGroup.selectAll("g").remove();

    // Render the y axis.
    axisGroup.call(
      require('./axis-y').default,
      yScale, graphWidth,
      smallestCount, largestCount, capacity
    );


    const totalDuration = domainEnd - domainStart;
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.floor(totalDuration / (MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND)))
      .tickSizeOuter(0)
      .tickFormat((d, i) => {
        const timeFormat = moment(d).add(timeZoneOffset, 'hours').format(`hA`);
        return timeFormat.slice(
          0, 
          timeFormat.startsWith('12') ? -1 : -2
        ).toLowerCase();
      });
    axisGroup.append("g")
      .attr("class", 'historical-counts-axis-x')
      .attr("transform", `translate(0,${graphHeight})`)
      .call(xAxis);



    // Generate flag lines
    // Each consists of a `g.flag` wrapper, with a `path.flag-line` and `text.flag-line-label`
    // inside.
    const flagSelection = flagGroup.selectAll('.flag').data(flags);

    const flagEnterSelection = flagSelection.enter().append('g')
      .attr('class', 'flag')
    flagEnterSelection.append('line')
      .attr('class', 'flag-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', graphHeight)
    flagEnterSelection.append('rect')
      .attr('class', 'flag-line-label-background')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 40)
      .attr('height', 28)
    flagEnterSelection.append('text')
      .attr('class', 'flag-line-label')

    const flagMergeSelection = flagEnterSelection.merge(flagSelection)
    // Move the group / line / text to the flag's position
    flagMergeSelection
      .attr('transform', d => `translate(${xScale(d.timestamp)},0)`)

    // Adjust if the graph height changed
    flagMergeSelection.select('.flag-line')
      .attr('y2', graphHeight)

    // Adjust the flag label
    flagMergeSelection.select('.flag-line-label')
      .text(d => d.count);

    flagSelection.exit().remove('.flag');


    // Draw the overlay line if there is any data
    if (data.length) {
      function showOverlay() {
        const mouseX = d3.mouse(overlayRect.node())[0];
        overlayGroup.call(updateOverlayLine,
          xScale, yScale, domainStart, domainEnd, graphWidth, graphHeight, initialCount, timeZoneLabel, timeZoneOffset,
          overlayDialogTopBottomMargin, overlayDialogBottomTopMargin, overlayDialogBorderRadius,
          overlayDialogTopWidth, overlayDialogTopHeight, overlayDialogBottomWidth, overlayDialogBottomHeight,
          overlayDialogTopIconCenterOffset, overlayDialogTopTextCenterOffset,
          data, mouseX
        );
      }
      overlayRect.append('rect')
        .attr('x', -1 * leftMargin)
        .attr('y', -1 * topMargin)
        .attr('width', leftMargin + graphWidth + rightMargin)
        .attr('height', topMargin + graphHeight + bottomMargin)
        .attr('fill', 'transparent')
        .on('touchstart', showOverlay)
        .on('touchmove', showOverlay)
        .on('mousemove', showOverlay)
        .on('mouseout', () => {
          overlayGroup.call(updateOverlayLine,
            xScale, yScale, domainStart, domainEnd, graphWidth, graphHeight, initialCount, timeZoneLabel, timeZoneOffset,
            overlayDialogTopBottomMargin, overlayDialogBottomTopMargin, overlayDialogBorderRadius,
            overlayDialogTopWidth, overlayDialogTopHeight, overlayDialogBottomWidth, overlayDialogBottomHeight,
            overlayDialogTopIconCenterOffset, overlayDialogTopTextCenterOffset,
            data, null
          );
        });
    }
  }
}
