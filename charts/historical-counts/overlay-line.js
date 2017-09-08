import { bisector } from 'd3';
import moment from 'moment';

// Bisect abstraction for finding timestamps
const bisect = bisector(d => d.timestamp);

export default function overlayLine(selection,
  timeScale, countScale, domainStart, domainEnd, graphWidth, graphHeight, initialCount,
  overlayDialogTopBottomMargin, overlayDialogBottomTopMargin, overlayDialogBorderRadius,
  overlayDialogTopWidth, overlayDialogTopHeight, overlayDialogBottomWidth, overlayDialogBottomHeight,
  data, mouseX
) {
  const now = moment.utc();

  // Calculate, given a mouse X coordinate, the count and time at that x coordinate.
  let timeAtPosition, itemIndexAtOverlayPosition, countAtPosition, dataToJoin;
  timeAtPosition = timeScale.invert(mouseX); // The time the user is hovering over, as a number.
  itemIndexAtOverlayPosition = bisect.right(data, timeAtPosition) - 1; // Where on the line is that time?

  // FIXME: another bug: data.length must be > 0
  // If the user is hovering over where the data is in the chart...
  if (domainStart <= timeAtPosition && Math.min(domainEnd, now.valueOf()) > timeAtPosition) {
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

  const overlaySelection = selection.selectAll('.historical-counts-overlay-line').data(dataToJoin);

  //
  // Enter
  //

  const enteringGroup = overlaySelection.enter()
    .append('g')
      .attr('class', 'historical-counts-overlay-line')

  // Overlay line
  enteringGroup.append('path')
    .attr('class', 'historical-counts-overlay-line-path')
    .attr('d', [
      `M0,${-1 * (overlayDialogTopBottomMargin + overlayDialogBorderRadius)}`,
      `V${graphHeight + overlayDialogTopBottomMargin + overlayDialogBottomTopMargin + (overlayDialogBorderRadius * 2)}`
    ].join(''))

  enteringGroup.append('circle')
    .attr('class', 'historical-counts-overlay-circle')
    .attr('cx', 0)
    .attr('cy', 0) // NOTE: overridden in merge below
    .attr('r', 4)

  // Draw overlay top box
  const overlayDialogTopGroup = enteringGroup.append('g')
    .attr('class', 'historical-counts-overlay-top')

  overlayDialogTopGroup.append('rect')
    .attr('class', 'historical-counts-overlay-top-bg')
    .attr('x', -1 * (overlayDialogTopWidth / 2))
    .attr('y', -1 * (overlayDialogTopHeight + overlayDialogTopBottomMargin))
    .attr('width', overlayDialogTopWidth)
    .attr('height', overlayDialogTopHeight)
    .attr('rx', overlayDialogBorderRadius)
    .attr('ry', overlayDialogBorderRadius)

  overlayDialogTopGroup.append("text")
    .attr('class', 'historical-counts-overlay-top-text')
    .attr('x', 0)
    .attr('y', -1 * ((overlayDialogTopHeight + overlayDialogTopBottomMargin) / 2))
    .attr('text-anchor', 'middle')

  // Draw overlay bottom box
  const overlayDialogBottomGroup = enteringGroup.append('g')
    .attr('class', 'historical-counts-overlay-bottom')

  overlayDialogBottomGroup.append('rect')
    .attr('class', 'historical-counts-overlay-bottom-bg')
    .attr('x', -1 * (overlayDialogBottomWidth / 2))
    .attr('y', graphHeight + overlayDialogBottomTopMargin)
    .attr('width', overlayDialogBottomWidth)
    .attr('height', overlayDialogBottomHeight)
    .attr('rx', overlayDialogBorderRadius)
    .attr('ry', overlayDialogBorderRadius)

  overlayDialogBottomGroup.append("text")
    .attr('class', 'historical-counts-overlay-bottom-text')
    .attr('x', -1 * (overlayDialogBottomWidth / 2) + (overlayDialogBottomWidth / 2))
    .attr('y', graphHeight + overlayDialogBottomTopMargin + ((overlayDialogBottomHeight + 10) / 2))
    .attr('text-anchor', 'middle')


  //
  // Merge
  //

  const mergingGroup = enteringGroup
    .merge(overlaySelection)
      .attr('transform', d => `translate(${d},0)`)

  mergingGroup.select('circle')
    .attr('cy', countScale(countAtPosition))

  // If the label would go over the edge of the graph, provide a transformation such that
  // the label is pinned the edge of the graph
  mergingGroup.select('.historical-counts-overlay-bottom')
    .attr('transform', function(d) {
      let phaseShift = 0;

      // The start of the graph.
      if (mouseX < (overlayDialogBottomWidth / 2)) {
        phaseShift -= mouseX - (overlayDialogBottomWidth / 2)
      }

      // The end of the graph.
      if (mouseX > graphWidth - (overlayDialogBottomWidth / 2)) {
        phaseShift += graphWidth - mouseX - (overlayDialogBottomWidth / 2)
      }

      return `translate(${phaseShift},0)`;
    })

  mergingGroup.select('.historical-counts-overlay-top')
    .attr('transform', function(d) {
      let phaseShift = 0;

      // The start of the graph.
      if (mouseX < (overlayDialogTopWidth / 2)) {
        phaseShift -= mouseX - (overlayDialogTopWidth / 2)
      }

      // The end of the graph.
      if (mouseX > graphWidth - (overlayDialogTopWidth / 2)) {
        phaseShift += graphWidth - mouseX - (overlayDialogTopWidth / 2)
      }

      return `translate(${phaseShift},0)`;
    })

  mergingGroup.select('.historical-counts-overlay-bottom-text')
    .text(moment(timeAtPosition).format('hh:mm A ddd MMM YY'))

  mergingGroup.select('.historical-counts-overlay-top-text')
    .text(countAtPosition)

  //
  // Exit
  //

  overlaySelection.exit()
    .remove('.overlay-line');
}
