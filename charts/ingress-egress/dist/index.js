'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ingressEgress;

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);


function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// ------------------------------------------------------------------------------
// Constants required for rendering the graph
// ------------------------------------------------------------------------------
var eventMarkerWidthInPx = 5; // The event marker width
var eventMarkerHeightInPx = 10; // The event marker height
var paddingBetweenStackedEventsInPx = 2; // how much spacing in the y direction to put between stacked events
var cardHeightInPx = 162;

// Given a number of events shaped like `{countChange, timestamp}`, return a number of markers to
// draw on the graph. Markers have a position and elevation - the former being an X pixel position that
// the marker should be drawn at, and the later being the height (in markers) the marker should be
// offset from the center line.
function calculateMarkerPositions(events, timeScale) {
  var nowInMs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _moment2.default)().utc().valueOf();

  var lastIngressPosition = null;
  var lastIngressElevation = null;
  var lastEgressPosition = null;
  var lastEgressElevation = null;

  // Loop through events and return markers
  return events.map(function (event) {
    // Loop through each marker, and accumulate into `markersToDraw`.
    var position = timeScale((0, _moment2.default)(event.timestamp).valueOf()) - eventMarkerWidthInPx;
    var elevation = event.countChange;
    if (event.countChange === 1) {
      if (position && position < lastIngressPosition + eventMarkerWidthInPx + paddingBetweenStackedEventsInPx) {
        position = lastIngressPosition;
        elevation = lastIngressElevation + 1;
      }
      lastIngressPosition = position;
      lastIngressElevation = elevation;
      return { position: position, elevation: elevation };
    } else if (event.countChange === -1) {
      if (position && position < lastEgressPosition + eventMarkerWidthInPx + paddingBetweenStackedEventsInPx) {
        position = lastEgressPosition;
        elevation = lastEgressElevation - 1;
      }
      lastEgressPosition = position;
      lastEgressElevation = elevation;
      return { position: position, elevation: elevation };
    }
  }).filter(function (x) {
    return x;
  });
}

// Generate the proper time label for each fraction of the total time
function getTimeLabel(graphDurationInMin, fraction) {
  return graphDurationInMin * fraction >= 1 ? graphDurationInMin * fraction + 'm' : Math.floor(graphDurationInMin * fraction * 60) + 's';
};

function ingressEgress(elem) {
  var card = d3.select(elem).append('div').attr('class', 'card card-dark ingress-egress-card');

  // add legend to card to explain what stuff means
  var legend = card.append('span').attr('class', 'ingress-egress-card-legend');

  legend.append('div').attr('class', 'rect rect-in').attr('style', 'width: ' + eventMarkerWidthInPx + 'px; height: ' + eventMarkerHeightInPx + 'px');
  legend.append('span').text('In');

  legend.append('div').attr('class', 'rect rect-out').attr('style', 'width: ' + eventMarkerWidthInPx + 'px; height: ' + eventMarkerHeightInPx + 'px');
  legend.append('span').text('Out');

  // Svg to put all the data in
  var svg = card.append('svg').attr('class', 'ingress-egress-data').attr('width', '100%').attr('height', '100%');

  // Render the line down the middle
  svg.append('line').attr('class', 'mid-line').attr('x1', '0').attr('y1', '50%').attr('x2', '100%').attr('y2', '50%');

  var dataGroup = svg.append('g').attr('class', 'ingress-egress-data');

  // Labels at the bottom of the card
  var labels = card.append('ul').attr('class', 'ingress-egress-card-labels');

  return function (props) {
    // Get the graph's length in minutes for drawing the scale below.
    var graphDurationInMin = props.graphDurationInMin || 10;

    // Get the graph's width from the bounding box of the svg.
    var graphWidth = svg.node().getBBox().width;

    // Draw labels on the bottom of the graph
    var labelSelection = labels.selectAll('li').data([getTimeLabel(graphDurationInMin, 1) + ' ago', getTimeLabel(graphDurationInMin, 0.75), getTimeLabel(graphDurationInMin, 0.5), getTimeLabel(graphDurationInMin, 0.25), 'Now']);
    var labelEnterSelection = labelSelection.enter().append('li');
    labelSelection.merge(labelEnterSelection).text(function (d) {
      return d;
    });
    labelSelection.exit().remove();

    // Construct a scale for drawing the time series
    var now = _moment2.default.utc();
    var timeScale = d3.scaleLinear().rangeRound([graphWidth, 0]).domain([now.valueOf(), // Get the time in unix time (milliseconds)
    now.subtract(graphDurationInMin, 'minutes').valueOf()]);

    // Render data in the chart.
    var dataSelection = dataGroup.selectAll('rect').data(calculateMarkerPositions(props.events, timeScale, now.valueOf()).filter(function (i) {
      return i.position && i.position <= graphWidth;
    }) // Only draw points that fit into the graph.
    );

    var dataEnterSelection = dataSelection.enter().append('rect').attr('class', 'count-marker').attr('width', eventMarkerWidthInPx).attr('height', eventMarkerHeightInPx);
    dataSelection.merge(dataEnterSelection).attr('x', function (d) {
      return d.position;
    }).attr('y', function (d) {
      if (d.elevation > 0) {
        return cardHeightInPx / 2 - // Center the marker
        d.elevation * (eventMarkerHeightInPx + paddingBetweenStackedEventsInPx);
      } else {
        return cardHeightInPx / 2 - // Center the marker
        eventMarkerHeightInPx - // position by the top of marker, not bottom
        d.elevation * (eventMarkerHeightInPx + paddingBetweenStackedEventsInPx); //
      }
    }).attr('class', function (d) {
      return 'count-marker ' + (d.elevation > 0 ? 'count-marker-in' : 'count-marker-out');
    });

    dataSelection.exit().remove();
  };
}

