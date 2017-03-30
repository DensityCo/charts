'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IngressEgressChart = IngressEgressChart;
exports.IngressEgressCard = IngressEgressCard;
exports.default = ingressEgress;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);


function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Some helpers to make the svg code a lot cleaner
function perc(n) {
  return n + '%';
}
function px(n) {
  return n + 'px';
}
function calc() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return 'calc(' + args.join(' ') + ')';
}

var brandPrimary = '#4198ff';

// ------------------------------------------------------------------------------
// Constants required for rendering the graph
// ------------------------------------------------------------------------------
var eventMarkerWidthInPx = 5; // The event marker width
var eventMarkerHeightInPx = 10; // The event marker height
var paddingBetweenStackedEventsInPx = 2; // how much spacing in the y direction to put between stacked events

// A graph for showing real time events as they happen to a space
// Roughly, it's implemented by having two "stacking contexts", one for +1 events and one for -1
// events. As +1 events some in, they're added to the +1 stacking context until they get too old,
// and then the stacking context is cleared and a new stack forms. The same thing happens for -1
// events. It's important to realize that +1 and -1 events are treated independantly in the below
// implementation.
function IngressEgressChart(_ref) {
  var events = _ref.events,
      graphDurationInMin = _ref.graphDurationInMin,
      stackEventDistance = _ref.stackEventDistance,
      relativeTimeSmoothing = _ref.relativeTimeSmoothing;

  var graphDurationInMs = graphDurationInMin * 60 * 1000;

  // Given a time, convert it the the percentage of the graph that it should be displayed at.
  function convertTimeToPercent(time) {
    return time / graphDurationInMs * 100;
  }

  // Start by getting the current time.
  var now = new Date().getTime();

  // Store the last relative timestamp of each event, both in the +1 and the -1 direction. THis is
  // because the "stacking contexts" of both diretions are really independant.
  var lastEventRelativeTimestamp = {};
  lastEventRelativeTimestamp[1] = null;
  lastEventRelativeTimestamp[-1] = null;

  // This is a similar idea to the above (with the +1 and -1 keys), but this time, instead of
  // tracking the last event's tiemstamp we're tracking how high the current "stacking context"
  // is. For example, if I had two +1 events, one right after another, and they stacked, the
  // stacking context under key +1 would be 2.
  var stackingContextAmounts = {};
  stackingContextAmounts[1] = 0;
  stackingContextAmounts[-1] = 0;

  // This is the x position of the current stack, whether is be only one event or a bunch of events.
  // This is requried because events in a stack beed to be aligned vertically.
  var stackStartPosition = 0;

  // Render each event. Events above the line are +1s on the space, events below the line are -1s on
  // the space. Events that are within `stackEventDistance` of each other are stacked on top of each
  // other as per the mockups.
  var eventRectangles = events.map(function (_ref2, ct) {
    var timestamp = _ref2.timestamp,
        direction = _ref2.count_change;

    // ------------------------------------------------------------------------------
    // Get a relative timestamp
    // ------------------------------------------------------------------------------

    // Calcualte a relative timestamp for the event. By relative timestamp, I mean a number where an
    // event that happened at the current time would be zero, and events that happened say one
    // minute ago would be 60000 (1 minute in milliseconds).
    var eventTime = new Date(timestamp).getTime();
    var relativeTimestamp = Math.floor((now - eventTime) / relativeTimeSmoothing) * relativeTimeSmoothing;

    // ------------------------------------------------------------------------------
    // Stacking of events
    // ------------------------------------------------------------------------------

    // Calculate how much the given event should stack. If the last event's timestamp is within
    // `stackEventDistance` of the previous timestamp, then we should stack.
    var stackAmount = 0;
    if (typeof lastEventRelativeTimestamp[direction] === 'number' && Math.abs(lastEventRelativeTimestamp[direction] - relativeTimestamp) <= stackEventDistance) {
      // this event should be stacked. Increment the stacking context...
      var eventStackHeight = ++stackingContextAmounts[direction];

      // the calculate how high (in px) to stack this event.
      stackAmount = eventStackHeight * (eventMarkerHeightInPx + paddingBetweenStackedEventsInPx);
      // The stack start position stays unchanged because we want this event to align with the event
      // below it.
    } else {
      // In case this event is the start of a stack, set the stack start position for the next
      // iteration.
      stackStartPosition = relativeTimestamp;
      stackingContextAmounts[direction] = 0;
    }

    // Clear stacking context
    // We reset to -1 because we want stacking to start at zero, and resetting to zero (which is
    // what would make sense here) means that when one is added we'd get one. Resetting to -1
    // means when one is added we get zero (what's expected).


    // ------------------------------------------------------------------------------
    // Render the rectangle
    // ------------------------------------------------------------------------------

    // For the next run, set the last timestamp to be the current one.
    lastEventRelativeTimestamp[direction] = relativeTimestamp;

    return _react2.default.createElement('rect', {
      key: direction + ':' + timestamp,

      x: calc(
      // Render the current time from the right (that's the 100 - bit).
      perc(100 - convertTimeToPercent(stackStartPosition)),
      // Subtract out the width of an event so that the whole event will show on render.
      '-', px(eventMarkerWidthInPx)),
      y: direction === 1 ?
      // direction is 1, so be over the line. Any stacking should go upward.
      calc(perc(50), '-', px(eventMarkerHeightInPx), '-', px(stackAmount)) :
      // direction is -1, so be under the line. Any stacking should go downward.
      calc(perc(50), '+', px(stackAmount)),

      height: px(eventMarkerHeightInPx),
      width: px(eventMarkerWidthInPx),

      fill: direction === 1 ? brandPrimary : // when direction is 1, make the rectangle blue
      '#8e9299' // when direction is -1, make the rectangle black(ish)

    });
  });

  return _react2.default.createElement(
    'svg',
    { width: '100%', height: '100%' },
    eventRectangles,
    _react2.default.createElement('line', {
      x1: 0,
      y1: perc(50),
      x2: perc(100),
      y2: perc(50),
      strokeWidth: 1,
      stroke: '#4A5159'
    })
  );
}
IngressEgressChart.defaultProps = {
  events: [],
  graphDurationInMin: 10, // in minutes

  stackEventDistance: 10 * 1000, // The amount of miiliseconds between stacking groups
  relativeTimeSmoothing: 100 };

function IngressEgressCard(graphProps) {
  // Get the graph's length in minutes for drawing the scale below.
  var maxStep = graphProps.graphDurationInMin || 10;

  return _react2.default.createElement(
    'div',
    { className: 'card card-dark', style: {
        height: 162,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      } },
    _react2.default.createElement(
      'span',
      { className: 'real-time-card-legend' },
      _react2.default.createElement('div', { className: 'rect rect-in', style: { width: eventMarkerWidthInPx, height: eventMarkerHeightInPx } }),
      'In',
      _react2.default.createElement('div', { className: 'rect rect-out', style: { width: eventMarkerWidthInPx, height: eventMarkerHeightInPx } }),
      'Out'
    ),
    _react2.default.createElement(IngressEgressChart, graphProps),
    _react2.default.createElement(
      'ul',
      { className: 'real-time-card-labels' },
      _react2.default.createElement(
        'li',
        null,
        maxStep,
        'm ago'
      ),
      _react2.default.createElement(
        'li',
        null,
        maxStep * 0.75,
        'm ago'
      ),
      _react2.default.createElement(
        'li',
        null,
        maxStep * 0.5,
        'm ago'
      ),
      _react2.default.createElement(
        'li',
        null,
        maxStep * 0.25,
        'm ago'
      ),
      _react2.default.createElement(
        'li',
        null,
        'Now'
      )
    )
  );
}

function ingressEgress(elem) {
  return function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return _reactDom2.default.render(_react2.default.createElement(IngressEgressCard, props), elem);
  };
}

