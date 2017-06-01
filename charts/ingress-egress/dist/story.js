'use strict';

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _storybook = require('@kadira/storybook');

var _index = require('../index');

var _index2 = require('./index');

var _index3 = _interopRequireDefault(_index2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var IngressEgress = (0, _index.chartAsReactComponent)(_index3.default);

function generateRandomMillisecondPosition() {
  var time = Math.floor(Math.random() * 500000) + 100000;
  return new Date().getTime() - time;
}

function generateRandomCountChangeEvents() {
  var acc = [];
  for (var i = 0; i < Math.floor(Math.random() * 32); i++) {
    acc.push({
      countChange: Math.random() > 0.5 ? 1 : -1, // Pick a random direction
      timestamp: generateRandomMillisecondPosition() });
  }
  return acc;
}

(0, _storybook.storiesOf)('Ingress Egress Chart', module).add('With a few set datapoints', function () {
  return React.createElement(IngressEgress, {
    events: [{ countChange: 1, timestamp: new Date().getTime() - 500000 }, { countChange: 1, timestamp: new Date().getTime() - 425000 }, { countChange: -1, timestamp: new Date().getTime() - 420000 }, { countChange: 1, timestamp: new Date().getTime() - 400000 }]
  });
}).add('With a few set datapoints that should stack', function () {
  return React.createElement(IngressEgress, {
    events: [{ countChange: 1, timestamp: new Date().getTime() - 500000 }, { countChange: 1, timestamp: new Date().getTime() - 425000 }, { countChange: 1, timestamp: new Date().getTime() - 420000 }, { countChange: 1, timestamp: new Date().getTime() - 300000 }, { countChange: -1, timestamp: new Date().getTime() - 200000 }, { countChange: -1, timestamp: new Date().getTime() - 205000 }]
  });
}).add('With a bunch of random data', function () {
  return React.createElement(IngressEgress, { events: generateRandomCountChangeEvents() });
}).add('With a shorter duration (ie, 1 min)', function () {
  return React.createElement(IngressEgress, {
    events: [{ countChange: -1, timestamp: new Date().getTime() - 5000 }, { countChange: 1, timestamp: new Date().getTime() - 10000 }, { countChange: -1, timestamp: new Date().getTime() - 7500 }, { countChange: 1, timestamp: new Date().getTime() - 50000 }],
    graphDurationInMin: 1
  });
});

