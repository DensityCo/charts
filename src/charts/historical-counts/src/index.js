// import './styles.scss';
import moment from 'moment';
import * as d3 from 'd3';

const NOOP = (n => n);

export default function historicalCounts(elem) {
  const svg = d3.select(elem)
    .append('svg')
    .attr('class', 'historical-counts');

  // Create layers for rendering elements within.
  const waterlineGroups = svgGroup.append('g').attr('class', 'waterline-group');
  const graphGroup = svgGroup.append('g').attr('class', 'graph-group');
        graphGroup.append('path').attr('class', 'historical-counts-path');
        graphGroup.append('path').attr('class', 'historical-counts-path-outline');
  const axisGroup = svgGroup.append('g').attr('class', 'axis-group');
  const overlayGroup = svgGroup.append('g').attr('class', 'overlay-group');
  const overlayRect = svgGroup.append('g').attr('class', 'overlay-rect');

  // Add filter for use in making shadows behind the overlay top and bottom cells.
  const filter = svg.append('filter')
    .attr('id', 'shadow-blur')
  filter.append('feGaussianBlur')
    .attr('stdDeviation', 4)
  filter.append('feOffset')
    .attr('dx', 0)
    .attr('dy', 2)

  return ({
    data,
    initialCount,

    start, end, timezone,
    width, height,

    waterlines,

    xAxisFormat,
    yAxisFormat,
    bottomOverlayLabelFormat,
    topOverlayLabelFormat,
  }) => {
    initialCount = initialCount || 0;

    width = width || 800;
    height = height || 400;

    waterlines = [];

    xAxisFormat = xAxisFormat || (n => {
      // "5a" or "8p"
      const timeFormat = moment.utc(n).tz(timezone).format(`hA`);
      return timeFormat.slice(
        0, 
        timeFormat.startsWith('12') ? -1 : -2
      ).toLowerCase();
    });
    yAxisFormat = yAxisFormat || NOOP;
    bottomOverlayLabelFormat = bottomOverlayLabelFormat || (n => {
      return moment.utc(n).tz(space.timeZone).format(
        `hh:mm A[${space.timeZone ? ` (${getTimeZoneGeneralizedShortName(space.timeZone)}) ` : ' '}]ddd MMM DD`
      );
    });
    topOverlayLabelFormat = topOverlayLabelFormat || NOOP;


    // Get everything you'd ever want to know about the first and last events
    const firstEvent = data.length > 0 ? data[0] : null;
    const dataStart = firstEvent ? firstEvent.timestamp : moment.utc().valueOf();
    const domainStart = start || dataStart;

    const lastEvent = data.length > 0 ? data[data.length - 1] : null;
    const lastCount = lastEvent ? lastEvent.count : 0;
    const dataEnd = lastEvent ? lastEvent.timestamp : moment.utc().valueOf();
    const domainEnd = end || dataEnd;

    // Construct scales
    const xScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([domainEnd, domainStart]);
    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight - 10, 0])
      .domain([smallestCount, capacity > largestCount ? capacity : largestCount]);

    const lastX = xScale(dataEnd);
    const lastY = yScale(lastCount);

    const largestCount = data.length > 0 ? Math.max.apply(Math, data.map(i => Math.max(i.count, initialCount))) : 0;
    const smallestCount = data.length > 0 ? Math.min.apply(Math, data.map(i => Math.min(i.count, initialCount))) : 0;

    // Render each waterline in the waterline group
    waterlines.forEach(({label, value}) => {
      const capacityHeightInPx = yScale(value);
      const capacitySelection = waterlineGroups
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
    });

    // Generate the svg path for the graph line
    const pathPrefix = `M1,${graphHeight}` +
      `L1,${yScale(initialCount)}` +
      `H${xScale(dataStart)}`;
    const pathSuffix = `H${lastX}V${graphHeight}H1`;
    const linePath = data.reduce((total, i) => {
      // Extract flags so we can draw them on top
      if (i.flag) { flags.push(i); }

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

    // And render the svg path into the dom
    graphGroup.select('.historical-counts-path')
      .attr('d', pathPrefix + linePath + pathSuffix);
    graphGroup.select('.historical-counts-path-outline')
      .attr('d', `M0,${yScale(initialCount)}` + linePath + `H${lastX}`);

    // Remove all axes that are already drawn
    axisGroup.selectAll("g").remove();






  }
}
