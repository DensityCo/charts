import './styles.scss';
import moment from 'moment';
import * as d3 from 'd3';

const leftMargin = 60;
const rightMargin = 16;
const bottomMargin = 36;
const topMargin = 16;

const overlayDialogHeight = 72;
const overlayDialogWidth = 108;
const overlayDialogTextSize = 16; // Size of the text
const overlayDialogTextMargin = 12; // Y spacing between text and its container
const overlayDialogBorderRadius = 4;

// Distance between the overlay dialog and the line on the graph
const overlayDialogDistanceToLine = 10;

// Distance the overlay dialog has to get to the right side of the graph before the dialog breaks to
// the other side of the line.
const overlayDialogBreakToLeftPadding = 20;

// Bisect abstraction for finding timestamps
const bisect = d3.bisector(d => normalize(d.timestamp));

// Crush the moments to make them comply
function normalize(date) {
  if (date instanceof moment) {
    return date.valueOf()
  } else {
    return moment(date).valueOf();
  }
}

// The count graph component
export default function countGraph(elem) {
  const svg = d3.select(elem).append('svg').attr('class', 'graph-countgraph')

  const svgGroup = svg.append('g')
    .attr('transform', `translate(${leftMargin},${topMargin})`);

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

  return function update(props={}) {
    const width = props.width || 940;
    const height = props.height || 400;
    const data = props.data || [];
    const initialCount = props.initialCount || 0;
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
    const dataStart = firstEvent ? normalize(firstEvent.timestamp) : normalize(moment());
    const domainStart = props.start || dataStart;

    const lastEvent = data.length && data[data.length - 1];
    const lastCount = lastEvent ? lastEvent.count : 0;
    const dataEnd = lastEvent ? normalize(lastEvent.timestamp) : normalize(moment());
    const domainEnd = props.end || dataEnd;

    // Construct scales
    const xScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([
        normalize(domainEnd),
        normalize(domainStart),
      ]);
    const largestCount = Math.max.apply(Math, data.map(i => Math.max(i.count, initialCount)));
    const smallestCount = Math.min.apply(Math, data.map(i => Math.min(i.count, initialCount)));
    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight - 10, 0])
      .domain([smallestCount, largestCount]);

    const lastX = xScale(normalize(moment.min(domainEnd, moment())));
    const lastY = yScale(lastEvent.count);



    // Generate the svg path for the graph line.
    const pathPrefix = `M1,${graphHeight}` +
      `L1,${yScale(initialCount)}` +
      `H${xScale(normalize(dataStart))}`;
    const pathSuffix = `H${lastX}V${graphHeight}H1`;

    // Build the path by looping through the data
    const linePath = data.reduce((total, i) => {

      // Extract flags so we can draw them on top
      if (i.flag) { flags.push(i); }

      // Step to the new point
      const xPosition = xScale(normalize(i.timestamp));
      const yPosition = yScale(i.count);
      if (xPosition >= 0) {
        return `${total}H${xPosition}V${yPosition}`;
      } else {
        return total;
      }
    }, '');

    const graphSelection = graphGroup
      .selectAll('.graph-path')
      .data([data]);

    graphSelection.enter()
      .append('path')
      .attr('class', 'graph-path')
    .merge(graphSelection)
      .attr('d', d => pathPrefix + linePath + pathSuffix);

    graphSelection.exit();



    // Draw the axes in the svg
    const totalDuration = normalize(domainEnd) - normalize(domainStart);
    const xAxis = d3.axisBottom(xScale)
      // format the time scale display for different domain sizes
      // only show hours
      .ticks(Math.min(Math.floor(totalDuration / 3600000), 7))      
      .tickSizeOuter(0)
      .tickFormat((d, i) => {
        const timeFormat = d3.timeFormat('%-I%p')(d);
        return timeFormat.slice(
          0, 
          timeFormat.startsWith('12') ? -1 : -2
        ).toLowerCase();
      });

    const yAxis = d3.axisLeft(yScale)
      .ticks(largestCount - smallestCount < 5 ? 1 : 3)
      .tickSizeOuter(0)
      .tickFormat(d3.format('.0f'))
      .tickSize(graphWidth);

    // Remove all axes that are already drawn
    axisGroup.selectAll("g").remove();

    // Draw axes in the axisGroup.
    axisGroup.append("g")
      .attr("class", "axis axis-y")
      .attr("transform", `translate(${graphWidth},0)`)
      .call(yAxis);
    axisGroup.append("g")
      .attr("class", "axis axis-x")
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
      .attr('transform', d => `translate(${xScale(normalize(d.timestamp))},0)`)

    // Adjust if the graph height changed
    flagMergeSelection.select('.flag-line')
      .attr('y2', graphHeight)

    // Adjust the flag label
    flagMergeSelection.select('.flag-line-label')
      .text(d => d.count);

    flagSelection.exit().remove('.flag');


    // Draw the overlay line if there is any data
    if (data.length) {

      overlayRect.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('fill', 'transparent')
        .on('mousemove', () => {
          const mouseX = d3.mouse(overlayRect.node())[0];
          updateOverlayLine(mouseX);
        })
        .on('mouseout', () => {
          updateOverlayLine(null);
        });

      function updateOverlayLine(mouseX) {
        // Calculate, given a mouse X coordinate, the count and time at that x coordinate.
        let timeAtPosition, itemIndexAtOverlayPosition, countAtPosition, dataToJoin;
        timeAtPosition = xScale.invert(mouseX); // The time the user is hovering over, as a number.
        itemIndexAtOverlayPosition = bisect.right(data, timeAtPosition) - 1; // Where on the line is that time?

        // FIXME: another bug: data.length must be > 0
        // If the user is hovering over where the data is in the chart...
        if (domainStart <= timeAtPosition && Math.min(domainEnd, normalize(moment())) > timeAtPosition) {
          // ... get the count where the user is hovering.
          const eventAtPosition = data[itemIndexAtOverlayPosition];
          countAtPosition = eventAtPosition ? eventAtPosition.count : initialCount;

          // If a mouse position was passed that is null, (ie, the mouse isn't in the chart any longer)
          // then disregard it so the overlay line will be deleted.
          dataToJoin = mouseX === null ? [] : [mouseX];
        } else {
          // The user isn't hovering over any data, so remove the overlay line.
          dataToJoin = [];
        }

        const overlaySelection = overlayGroup.selectAll('.overlay-line').data(dataToJoin);

        //
        // Enter
        //

        const enteringGroup = overlaySelection.enter()
          .append('g')
            .attr('class', 'overlay-line')

        // Overlay line
        enteringGroup.append('path')
          .attr('d', `M0,0V${graphHeight}`)

        enteringGroup.append('circle')
          .attr('cx', 0)
          .attr('cy', 0) // NOTE: overridden in merge below
          .attr('r', 4)

        // Overlay dialog box
        const overlayDialogGroup = enteringGroup.append('g')
          .attr('class', 'overlay-dialog')

        // Draw the overlay dialog box shadow
        overlayDialogGroup.append('rect')
          .attr('class', 'overlay-dialog-shadow')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', overlayDialogWidth + 1)
          .attr('height', overlayDialogHeight + 1)
          .attr('rx', overlayDialogBorderRadius)
          .attr('ry', overlayDialogBorderRadius)

        // Draw the overlay dialog box background
        overlayDialogGroup.append('rect')
          .attr('class', 'overlay-dialog-bg')
          .attr('x', 0)
          .attr('y', overlayDialogHeight / 4)
          .attr('width', overlayDialogWidth)
          .attr('height', 0.75 * overlayDialogHeight)
          .attr('rx', overlayDialogBorderRadius)
          .attr('ry', overlayDialogBorderRadius)

        overlayDialogGroup.append('rect')
          .attr('class', props.adjusted ? `overlay-dialog-bg-adjusted` : `overlay-dialog-bg-primary`)
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', overlayDialogWidth)
          .attr('height', overlayDialogHeight / 2)
          .attr('rx', overlayDialogBorderRadius)
          .attr('ry', overlayDialogBorderRadius)

        overlayDialogGroup.append('rect')
          .attr('class', props.adjusted ? `overlay-dialog-bg-adjusted` : `overlay-dialog-bg-primary`)
          .attr('x', 0)
          .attr('y', overlayDialogHeight / 4)
          .attr('width', overlayDialogWidth)
          .attr('height', overlayDialogHeight / 4)

        // Add text to overlay dialog box

        // The time for a given datapoint
        overlayDialogGroup.append("text")
          .attr("class", "overlay-dialog-time")
          .attr("x", overlayDialogWidth / 2)
          .attr("y", overlayDialogTextMargin + overlayDialogTextSize - 4)
          .attr("text-anchor", "middle")

        // The count at a given datapoint
        overlayDialogGroup.append("text")
          .attr("class", "overlay-dialog-count")
          .attr("x", overlayDialogWidth / 2)
          .attr("y", overlayDialogHeight - overlayDialogTextMargin)
          .attr("text-anchor", "middle")

        //
        // Merge
        //

        const mergingGroup = enteringGroup
          .merge(overlaySelection)
            .attr('transform', d => `translate(${d},0)`)

        mergingGroup.select('circle')
          .attr('cy', yScale(countAtPosition))

        mergingGroup.select('.overlay-dialog')
          .attr('transform', d => {
            // Determine which side of the line to drap the popup dialog on.
            let popupYCoord = yScale(countAtPosition) + overlayDialogDistanceToLine, popupXCoord;
            if (d + overlayDialogWidth + overlayDialogBreakToLeftPadding > graphWidth) {
              // Put popup on left if when on the right it would be off the svg.
              popupXCoord = -overlayDialogWidth - overlayDialogDistanceToLine;
            } else {
              // Put popup on right by default.
              popupXCoord = overlayDialogDistanceToLine;
            }

            // If the popup is being drawn outside of the svg when the user is looking at low counts,
            // then raise up the popup to put it above the cursor.
            if (popupYCoord + overlayDialogHeight + overlayDialogBreakToLeftPadding > graphHeight) {
              popupYCoord -= overlayDialogHeight + overlayDialogDistanceToLine;
            }

            return `translate(${popupXCoord},${popupYCoord})`;
          })

        mergingGroup.select('.overlay-dialog-time')
          .text(moment(timeAtPosition).format('h:mm A'))

        mergingGroup.select('.overlay-dialog-count')
          .text(props.adjusted ? `Adj: ${countAtPosition}` : countAtPosition)

        //
        // Exit
        //

        overlaySelection.exit()
          .remove('.overlay-line');
      }
    }
  }
}
