import * as d3 from 'd3';
import moment from 'moment';
import classnames from 'classnames';

import './styles.scss';

const SECONDS_PER_MINUTE = 60,
      MILLISECONDS_PER_SECOND = 1000;

// ------------------------------------------------------------------------------
// Constants required for rendering the graph
// ------------------------------------------------------------------------------
const eventMarkerRadius = 3; // The event marker radius in px
const eventMarkerSpacingFromMidLine = 5; // Spacing between the event marker and the middle line
const eventMarkerInfoPopupHeight = 20; // Height of the info popup, not including the pointer.
const eventMarkerInfoPopupWidth = 20; // Width of the info popup that shows if more than one event happened.
const eventMarkerInfoPopupSpacingFromMarker = 10; // Spacing between the info popup and the event marker.
const eventMarkerInfoPopupCaretWidth = 5;
const cardHeightInPx = 162;
const graphDurationInMin = 1;

// Generate the proper time label for each fraction of the total time
function getTimeLabel(graphDurationInMin, fraction) {
  return graphDurationInMin * fraction >= 1 ?
    `${graphDurationInMin * fraction}m` :
    `${Math.floor(graphDurationInMin * fraction * 60)}s`
};

export function getIndicatorLocations(data, minimumStackDistance=1500) {
  let lastTimestamp = {};
  lastTimestamp[1] = 0;
  lastTimestamp[-1] = 0;

  return data.reduce((acc, i) => {
    // Ensure the timestamp is an epoch.
    let timestamp = i.timestamp;
    if (typeof timestamp !== 'number') {
      if (timestamp instanceof moment) {
          timestamp = timestamp.valueOf();
        } else {
          timestamp = moment.utc(timestamp).valueOf();
        }
    }

    if (lastTimestamp[i.countChange] === 0 || timestamp - lastTimestamp[i.countChange] > minimumStackDistance) {
      // No previous event marker was found to stack the current count into. Create a new event marker.
      lastTimestamp[i.countChange] = timestamp;
      return [...acc, {timestamp, count: i.countChange}]
    } else {
      // In this case, a previous marker was found within the minimum stack distance.  Add this
      // event's count change to the count of the previous event, effectively squashing them.

      // Loop through all markers in reverse order, looking for the most recent marker that is on
      // the same side of the axis as this marker.
      let lastIndexOfIndicatorDirection = -1;
      for (let ct = acc.length - 1; ct >= 0; ct--) {
        if (
          (i.countChange > 0 && acc[ct].count > 0) ||
          (i.countChange < 0 && acc[ct].count < 0)
        ) {
          lastIndexOfIndicatorDirection = ct;
          break;
        }
      }

      // Update the marker that was found with an updated count from the current marker.
      acc.splice(lastIndexOfIndicatorDirection, 1, {
        ...acc[lastIndexOfIndicatorDirection],
        count: acc[lastIndexOfIndicatorDirection].count + i.countChange,
      });

      lastTimestamp[i.countChange] = timestamp;
      return acc;
    }
  }, []);
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

  return ({events}) => {
    const now = moment.utc();

    // Get the graph's width from the bounding box of the svg.
    const graphWidth = svg.node().getBBox().width;

    // Construct a scale for drawing the time series, which converts from
    // [0, 1 minute ago] to [width, 0]. Ie, if the timedelta is 
    const timeScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([0, graphDurationInMin * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND]);

    // Calculate the locations of each marker to plot. Then:
    // 1. Calculate a timedelta between the current time and the time in the marker. This is used
    // instead of the timestamp as the time value because it changes as time marches forward, while
    // a tiemstamp wouldremain constant. Calulated by subtracting (current time) - (timestamp).
    // 2. Filter out all marks that render off the graph. This is jsut to be more efficient (why do
    // we need to render things that are off-screen?)
    const indicatorLocations = getIndicatorLocations(events).map(i => Object.assign({}, i, {
      timedelta: now.valueOf() - i.timestamp.valueOf(),
    })).filter(i => {
      return timeScale(i.timedelta) > 0;
    })

    // Render data in the chart.
    const dataSelection = dataGroup.selectAll('.real-time-capacity-point')
      .data(indicatorLocations, d => d.timedelta);


    // When new circles are created, plot them at their proper x and y coordinates.
    const dataEnterSelection = dataSelection.enter().append('g')
      .attr('class', 'real-time-capacity-point')
    dataEnterSelection.append('circle');

    const dataEnterSelectionIndicator = dataEnterSelection.append('g')
      .attr('class', 'real-time-capacity-info');
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


    // When circles are created or updated, plot ther position
    const dataMergeSelection = dataSelection.merge(dataEnterSelection);

    // Update the position of each circle.
    dataMergeSelection.select('circle')
      .attr('r', eventMarkerRadius)
      // Subtract the radius to center the dot on the right edge of the chart.
      .attr('cx', d => timeScale(d.timedelta) - eventMarkerRadius)
      .attr('cy', d => {
        if (d.count > 0) {
          // Render the dot above the midline.
          return (cardHeightInPx / 2) - (eventMarkerRadius + eventMarkerSpacingFromMidLine);
        } else {
          // Render the dot below the midline.
          return (cardHeightInPx / 2) + (eventMarkerRadius + eventMarkerSpacingFromMidLine);
        }
      })
      .attr('class', d => classnames('real-time-capacity-count-marker', d.count > 0 ? 'in' : 'out'));

    // Add info popups when the count is over 1 for a given column.
    dataMergeSelection.select('.real-time-capacity-info')
      .attr('transform', d => {
        // Draw the info popup at the x coordinate that relates to the timestamp. Ensure the centers
        // of the event marker and the info popup are aligned by subtracting half the width of each
        // item from the x position.
        const xPos = timeScale(d.timedelta)
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
      .attr('class', d => classnames('real-time-capacity-info', {hidden: Math.abs(d.count) === 1}))

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
            `L ${caretXPosition + (eventMarkerInfoPopupCaretWidth / 2)} ${eventMarkerInfoPopupHeight + eventMarkerInfoPopupCaretWidth / 2}`,
            // Move to the upper right of the caret.
            `L ${caretXPosition + eventMarkerInfoPopupCaretWidth} ${eventMarkerInfoPopupHeight}`,
          ].join(' ')
        } else {
          // Upward-facing caret.
          return [
            // Move to the lower left corner of the caret.
            `M ${caretXPosition} 0`,
            // Move to the top point of the caret.
            `L ${caretXPosition + (eventMarkerInfoPopupCaretWidth / 2)} ${-1 * eventMarkerInfoPopupCaretWidth / 2}`,
            // Move to the upper right of the caret.
            `L ${caretXPosition + eventMarkerInfoPopupCaretWidth} 0`,
          ].join(' ')
        }
      });
        
        
    dataSelection.exit().remove()
  };
}
