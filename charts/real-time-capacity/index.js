import * as d3 from 'd3';
import moment from 'moment';
import classnames from 'classnames';

import './styles.scss';

// ------------------------------------------------------------------------------
// Constants required for rendering the graph
// ------------------------------------------------------------------------------
const eventMarkerRadius = 3; // The event marker radius in px
const eventMarkerSpacingFromMidLine = 5; // Spacing between the event marker and the middle line
const eventMarkerInfoPopupHeight = 20; // Height of the info popup, not including the pointer.
const eventMarkerInfoPopupWidth = 20; // Width of the info popup that shows if more than one event happened.
const eventMarkerInfoPopupSpacingFromMarker = 10; // Spacing between the info popup and the event marker.
const eventMarkerInfoPopupCaretWidth = 4;
const cardHeightInPx = 162;
const graphDurationInMin = 1;

// Generate the proper time label for each fraction of the total time
function getTimeLabel(graphDurationInMin, fraction) {
  return graphDurationInMin * fraction >= 1 ?
    `${graphDurationInMin * fraction}m` :
    `${Math.floor(graphDurationInMin * fraction * 60)}s`
};

export function getIndicatorLocations(data) {
  console.log(data)
  return [
    {
      timestamp: (new Date()).getTime(),
      count: 4
    },
    {
      timestamp: (new Date()).getTime() - 6000,
      count: -2
    },
    {
      timestamp: (new Date()).getTime() - 10000,
      count: 2
    }
  ];
}

// Generate the proper time label for each fraction of the total time
export default function ingressEgress(elem) {
  const card = d3.select(elem).append('div')
    .attr('class', 'card card-dark ingress-egress-card')


  // add legend to card to explain what stuff means
  const legend = card.append('span')
    .attr('class', 'real-time-capacity-legend')

  legend.append('div')
    .attr('class', 'real-time-capacity-count-marker in')
    .attr('style', `width: ${eventMarkerRadius * 2}px; height: ${eventMarkerRadius * 2}px`)
  legend.append('span').text('In')

  legend.append('div')
    .attr('class', 'real-time-capacity-count-marker out')
    .attr('style', `width: ${eventMarkerRadius * 2}px; height: ${eventMarkerRadius * 2}px`)
  legend.append('span').text('Out')



  // Svg to put all the data in
  const svg = card.append('svg')
    .attr('class', 'ingress-egress-data')
    .attr('width', '100%')
    .attr('height', '100%')

  // Render the line down the middle
  svg.append('line')
    .attr('class', 'real-time-capacity-mid-line')
    .attr('x1', '0')
    .attr('y1', '50%')
    .attr('x2', '100%')
    .attr('y2', '50%')

  const dataGroup = svg.append('g')
    .attr('class', 'ingress-egress-data')


  // Labels at the bottom of the card
  const labels = card.append('ul')
    .attr('class', 'real-time-capacity-labels')
  labels.append('li')
    .attr('class', 'real-time-capacity-labels-item')
    .text(`${getTimeLabel(graphDurationInMin, 1)} ago`);
  labels.append('li')
    .attr('class', 'real-time-capacity-labels-item')
    .text(`Now`);

  return props => {
    // Get the graph's width from the bounding box of the svg.
    const graphWidth = svg.node().getBBox().width;

    // Construct a scale for drawing the time series
    const now = moment.utc();
    const timeScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([
        now.valueOf(), // Get the time in unix time (milliseconds)
        now.subtract(graphDurationInMin, 'minutes').valueOf(),
      ]);


    // Render data in the chart.
    const dataSelection = dataGroup.selectAll('circle').data(getIndicatorLocations(props.events));

    const dataEnterSelection = dataSelection.enter().append('g')
    dataEnterSelection.append('circle');

    const dataEnterSelectionIndicator = dataEnterSelection.append('g').attr('class', 'real-time-capacity-info');
    dataEnterSelectionIndicator.append('rect')
      .attr('class', 'real-time-capacity-info-content')
      .attr('width', eventMarkerInfoPopupHeight)
      .attr('height', eventMarkerInfoPopupHeight)
      .attr('rx', 2)
      .attr('ry', 2);
    dataEnterSelectionIndicator.append('text')
      .attr('class', 'real-time-capacity-info-content-label');
    dataEnterSelectionIndicator.append('path')
      .attr('class', 'real-time-capacity-info-pointer');


    const dataMergeSelection = dataSelection.merge(dataEnterSelection);

    // Update the position of each circle.
    dataMergeSelection.select('circle')
      .attr('r', eventMarkerRadius)
      // Subtract the radius to center the dot on the right edge of the chart.
      .attr('cx', d => timeScale(d.timestamp) - eventMarkerRadius)
      .attr('cy', d => {
        if (d.count > 0) {
          // Render the dot above the midline.
          return (cardHeightInPx / 2) - (eventMarkerRadius + eventMarkerSpacingFromMidLine);
        } else {
          // Render the dot below the midline.
          return (cardHeightInPx / 2) + (eventMarkerRadius + eventMarkerSpacingFromMidLine);
        }
      })
      .attr('class', d => `count-marker ${d.count > 0 ? 'count-marker-in' : 'count-marker-out'}`);

    // Add info popups when the count is over 1 for a given column.
    dataMergeSelection.select('.real-time-capacity-info')
      .attr('transform', d => {
        // Draw the info popup at the x coordinate that relates to the timestamp. Ensure the centers
        // of the event marker and the info popup are aligned by subtracting half the width of each
        // item from the x position.
        const xPos = timeScale(d.timestamp)
          - (eventMarkerInfoPopupWidth / 2)
          - eventMarkerRadius;

        // Draw the info popup at the y coordinate that relates to if the event was an ingress or
        // egress.
        let yPos;
        if (d.count > 0) {
          // Render the popover above the midline.
          yPos = (cardHeightInPx / 2)
            - (
              (eventMarkerRadius * 2)
              + eventMarkerSpacingFromMidLine
              + eventMarkerInfoPopupSpacingFromMarker
            )
            - eventMarkerInfoPopupHeight;
        } else {
          // Render the popover below the midline.
          yPos = (cardHeightInPx / 2)
            + (
              (eventMarkerRadius * 2)
              + eventMarkerSpacingFromMidLine
              + eventMarkerInfoPopupSpacingFromMarker
            );
        }

        return `translate(${xPos},${yPos})`;
      })
      .attr('class', d => classnames('real-time-capacity-info', {hidden: d.count === 1}))

    dataMergeSelection.select('text')
      .text(d => Math.abs(d.count))
      .attr('transform', function(d) {
        // Center the text horizontally and vertically within the info popup
        const bbox = this.getBoundingClientRect();
        const textWidth = bbox.right - bbox.left;
        const textHeight = bbox.bottom - bbox.top + 14;
        const centeredXPosition = (eventMarkerInfoPopupWidth - textWidth) / 2;
        const centeredYPosition = (eventMarkerInfoPopupHeight - textHeight) / 2;

        // add `eventMarkerInfoPopupHeight` to the y position to make the text be positioned from
        // the top of the container, not the bottom.
        return `translate(${centeredXPosition}, ${centeredYPosition + eventMarkerInfoPopupHeight})`
      });

    const caretXPosition = (eventMarkerInfoPopupWidth - eventMarkerInfoPopupCaretWidth) / 2;
    dataMergeSelection.select('.real-time-capacity-info-pointer')
      .attr('d', d => {
        if (d.count > 0) {
          // Downward-facing caret.
          return [
            // Move to the upper left corner of the caret.
            `M ${caretXPosition} ${eventMarkerInfoPopupHeight}`,
            // Move to the bottom point of the caret.
            `L ${caretXPosition + (eventMarkerInfoPopupCaretWidth / 2)} ${eventMarkerInfoPopupHeight + eventMarkerInfoPopupCaretWidth}`,
            // Move to the upper right of the caret.
            `L ${caretXPosition + eventMarkerInfoPopupCaretWidth} ${eventMarkerInfoPopupHeight}`,
          ].join(' ')
        } else {
          // Upward-facing caret.
          return [
            // Move to the lower left corner of the caret.
            `M ${caretXPosition} 0`,
            // Move to the top point of the caret.
            `L ${caretXPosition + (eventMarkerInfoPopupCaretWidth / 2)} ${-1 * eventMarkerInfoPopupCaretWidth}`,
            // Move to the upper right of the caret.
            `L ${caretXPosition + eventMarkerInfoPopupCaretWidth} 0`,
          ].join(' ')
        }
      })
        
        
    dataSelection.exit().remove()
  };
}
