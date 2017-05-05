import * as d3 from 'd3';
import moment from 'moment';

import './styles.scss';

// ------------------------------------------------------------------------------
// Constants required for rendering the graph
// ------------------------------------------------------------------------------
const eventMarkerWidthInPx = 5; // The event marker width
const eventMarkerHeightInPx = 10; // The event marker height
const paddingBetweenStackedEventsInPx = 2; // how much spacing in the y direction to put between stacked events
const cardHeightInPx = 162;

// Given a number of events shaped like `{countChange, timestamp}`, return a number of markers to
// draw on the graph. Markers have a position and elevation - the former being an X pixel position that
// the marker should be drawn at, and the later being the height (in markers) the marker should be
// offset from the center line.
function calculateMarkerPositions(events, timeScale, nowInMs=moment().utc().valueOf()) {
  let lastIngressPosition = null;
  let lastIngressElevation = null;
  let lastEgressPosition = null;
  let lastEgressElevation = null;

  // Loop through events and add markers
  return events.map(event => { // Loop through each marker, and accumulate into `markersToDraw`.
    let position = timeScale(moment(event.timestamp).valueOf()) - eventMarkerWidthInPx;
    let elevation = event.countChange;
    
    if (event.countChange === 1) {
      if (position && position < lastIngressPosition + eventMarkerWidthInPx + paddingBetweenStackedEventsInPx) {
        position = lastIngressPosition;
        elevation = lastIngressElevation + 1;
      }
      lastIngressPosition = position;
      lastIngressElevation = elevation;
      return { position, elevation };
    } else if (event.countChange === -1) {
      if (position && position < lastEgressPosition + eventMarkerWidthInPx + paddingBetweenStackedEventsInPx) {
        position = lastEgressPosition;
        elevation = lastEgressElevation - 1;
      }
      lastEgressPosition = position;
      lastEgressElevation = elevation;
      return { position, elevation };
    }
  });
}
export default function ingressEgress(elem) {
  const card = d3.select(elem).append('div')
    .attr('class', 'card card-dark ingress-egress-card')


  // add legend to card to explain what stuff means
  const legend = card.append('span')
    .attr('class', 'ingress-egress-card-legend')

  legend.append('div')
    .attr('class', 'rect rect-in')
    .attr('style', `width: ${eventMarkerWidthInPx}px; height: ${eventMarkerHeightInPx}px`)
  legend.append('span').text('In')

  legend.append('div')
    .attr('class', 'rect rect-out')
    .attr('style', `width: ${eventMarkerWidthInPx}px; height: ${eventMarkerHeightInPx}px`)
  legend.append('span').text('Out')



  // Svg to put all the data in
  const svg = card.append('svg')
    .attr('class', 'ingress-egress-data')
    .attr('width', '100%')
    .attr('height', '100%')

  // Render the line down the middle
  svg.append('line')
    .attr('class', 'mid-line')
    .attr('x1', '0')
    .attr('y1', '50%')
    .attr('x2', '100%')
    .attr('y2', '50%')

  const dataGroup = svg.append('g')
    .attr('class', 'ingress-egress-data')



  // Labels at the bottom of the card
  const labels = card.append('ul')
    .attr('class', 'ingress-egress-card-labels')

  return props => {
    // Get the graph's length in minutes for drawing the scale below.
    const graphDurationInMin = props.graphDurationInMin || 10;

    // Get the graph's width from the bounding box of the svg.
    const graphWidth = svg.node().getBBox().width;

    // Draw labels on the bottom of the graph
    const labelSelection = labels.selectAll('li').data([
      `${graphDurationInMin}m ago`,
      `${graphDurationInMin * 0.75}m ago`,
      `${graphDurationInMin * 0.50}m ago`,
      `${graphDurationInMin * 0.25}m ago`,
      `Now`,
    ]);
    const labelEnterSelection = labelSelection.enter().append('li');
    labelSelection.merge(labelEnterSelection).text(d => d);
    labelSelection.exit().remove();

    // Construct a scale for drawing the time series
    const now = moment.utc();
    const timeScale = d3.scaleLinear()
      .rangeRound([graphWidth, 0])
      .domain([
        now.valueOf(), // Get the time in unix time (milliseconds)
        now.subtract(graphDurationInMin, 'minutes').valueOf(),
      ]);


    // Render data in the chart.
    const dataSelection = dataGroup.selectAll('rect').data(
      calculateMarkerPositions(props.events, timeScale, now.valueOf())
        .filter(i => i.position <= graphWidth) // Only draw points that fit into the graph.
    );

    const dataEnterSelection = dataSelection.enter().append('rect')
      .attr('class', 'count-marker')
      .attr('width', eventMarkerWidthInPx)
      .attr('height', eventMarkerHeightInPx)
    dataSelection.merge(dataEnterSelection)
      .attr('x', d => d.position)
      .attr('y', d => {
        if (d.elevation > 0) {
          return (cardHeightInPx / 2) - // Center the marker
          (d.elevation * (eventMarkerHeightInPx + paddingBetweenStackedEventsInPx));
        } else {
          return (cardHeightInPx / 2) - // Center the marker
          eventMarkerHeightInPx - // position by the top of marker, not bottom
          (d.elevation * (eventMarkerHeightInPx + paddingBetweenStackedEventsInPx)); //
        }
      })
      .attr('class', d => `count-marker ${d.elevation > 0 ? 'count-marker-in' : 'count-marker-out'}`);

    dataSelection.exit().remove()
  };
}
