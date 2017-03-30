import './styles.scss';
import moment from 'moment';
import * as d3 from 'd3';

let brandPrimary = '#4198ff';

const leftMargin = 32;
const bottomMargin = 32;
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

function momentToNumber(date) {
  if (date instanceof moment) {
    return date.valueOf()
  } else {
    return moment(date).valueOf();
  }
}

export default function countGraph(elem) {
  const svg = d3.select(elem).append('svg')
    .attr('class', 'graph-countgraph')
    .attr('width', '100%')

  const svgGroup = svg.append('g')
    .attr('transform', `translate(${leftMargin},${topMargin})`);

  // The graph path that shows the data goes in here.
  const graphGroup = svgGroup.append('g')
    .attr('class', 'graph-group');

  // The axes go in here.
  const axisGroup = svgGroup.append('g')
    .attr('class', 'axis-group');

  // Resets are all stuck in this group, must be above the axes, otehrwise the horizontal axis rules
  // cross over the reset line and make it look like a dotted line.
  const resetGroup = svgGroup.append('g')
    .attr('class', 'reset-group');

  // Put all the overlay stuff in here (the line and dialog)
  const overlayGroup = svgGroup.append('g')
    .attr('class', 'overlay-group');

  // The hidden rectangle to use to detect mouse position
  const overlayRect = svgGroup.append('g')
    .attr('class', 'overlay-rect');

  return function update(props={}) {
    const width = props.width || 1000;
    const height = props.height || 400;
    const data = props.data || [];
    const resets = props.resets || [];

    // Adjust the svg size and viewbox to match the passed in values.
    svg
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)

    if (!Array.isArray(data)) {
      throw new Error(`A 'data' prop is required.`);
    }

    // When no data is specified, don't render anything.
    if (data.length === 0) {
      return
    }

    // Get the drawn graph size, minus the borders.
    const graphWidth = width - leftMargin;
    const graphHeight = height - topMargin - bottomMargin;

    // Get first values for using in computations
    const firstEvent = data[0];
    const firstCount = firstEvent ? firstEvent.count : 0;
    const firstTimestamp = firstEvent ? moment(firstEvent.timestamp) : moment();

    // Get last values for using in computations
    const lastEvent = data[data.length - 1];
    const lastCount = lastEvent ? lastEvent.count : 0;
    const lastTimestamp = lastEvent ? moment.min(
      moment(lastEvent.timestamp),
      moment(props.end)
    ) : moment();

    const start = props.start || firstTimestamp;
    const end = props.end || lastTimestamp;

    // Construct scales
    const xScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([
        momentToNumber(end),
        momentToNumber(start),
      ]);
    const largestCount = Math.max.apply(Math, data.map(i => i.count));
    const smallestCount = Math.min.apply(Math, data.map(i => i.count));
    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight, 0])
      .domain([smallestCount, largestCount]);

    const lastX = xScale(lastTimestamp);
    const lastY = yScale(lastCount);
    const bottomY = graphHeight - 1;




    // Generate the svg path for the graph line.
    const pathPrefix = [
      `M1,${yScale(0)}`, // Move to the lower left
      `L${xScale(momentToNumber(firstTimestamp))},${yScale(0)}`, // Move to the first datapoint.
    ].join('');
    const pathSuffix = [
      `L${lastX},${lastY}`, // Line to the last coordinate, if not already there.
      `L${lastX},${bottomY}`, // Line down to the y axis.
      `L1,${bottomY}`, // Line across the bottom to the start.
    ];
    const linePath = data.reduce((total, i) => {
      const magnitude = momentToNumber(i.timestamp);
      const xPosition = xScale(magnitude);
      const yPosition = yScale(i.count);

      // For "jagged" but more correct look
      // return `${total}L${xPosition},${yPosition}`;
      // For squared off look
      return `${total}H${xPosition}V${yPosition}`;
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
    const xAxis = d3.axisBottom(xScale)
      // format the time scale display for different domain sizes
      // started by trying to remove the zero padding from the hours
      // and it got out of hand, this is complicated logic
      .tickFormat(d => d3.timeFormat('%-I%p')(d).toLowerCase())
      .tickSizeOuter(0)
      .ticks(10);

    const yAxis = d3.axisLeft(yScale)
      .tickSizeOuter(0)
      .ticks(10)
      .tickSize(graphWidth);

    // Remove all axes that are already drawn
    axisGroup.selectAll("g").remove();

    // Draw axes in the axisGroup.
    axisGroup.append("g")
      .attr("class", "axis axis-y")
      .attr("transform", `translate(${graphWidth - 5},0)`)
      .call(yAxis);
    axisGroup.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${graphHeight + 5})`)
      .call(xAxis);



    // Generate reset lines
    const resetSelection = resetGroup.selectAll('.reset-line').data(resets);

    resetSelection.enter()
      .append('path')
      .attr('class', 'reset-line')
    .merge(resetSelection)
      .attr('d', d => {
        const resetPosition = xScale(momentToNumber(d.timestamp));
        return `M${resetPosition},0V${graphHeight}`;
      });

    resetSelection.exit().remove('.reset-line');



    // Draw the overlay line
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
      const bisect = d3.bisector(d => momentToNumber(d.timestamp)).right;
      let timeAtPosition, itemIndexAtOverlayPosition, countAtPosition, dataToJoin;
      timeAtPosition = xScale.invert(mouseX); // The time the user is hovering over, as a number.
      itemIndexAtOverlayPosition = bisect(data, timeAtPosition) - 1; // Where on the line is that time?

      // FIXME: another bug: data.length must be > 0
      // If the user is hovering over where the data is in the chart...
      if (firstTimestamp <= timeAtPosition && timeAtPosition <= lastTimestamp) {
        // ... get the count where the user is hovering.
        countAtPosition = data[itemIndexAtOverlayPosition].count;

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
        .attr('cy', d => yScale(countAtPosition))

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
