'use strict';

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _storybook = require('@kadira/storybook');

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _3 = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var DriftChart = (0, _3.chartAsReactComponent)(_2.default);

(0, _storybook.storiesOf)('Drift Chart', module).add('With moments for days', function () {
  return React.createElement(DriftChart, {
    drifts: [{ date: (0, _moment2.default)().add(0, 'day'), count: 1 }, { date: (0, _moment2.default)().add(1, 'day'), count: 2 }, { date: (0, _moment2.default)().add(2, 'day'), count: -3 }, { date: (0, _moment2.default)().add(3, 'day'), count: 2 }, { date: (0, _moment2.default)().add(4, 'day'), count: 5 }, { date: (0, _moment2.default)().add(5, 'day'), count: -1 }, { date: (0, _moment2.default)().add(6, 'day'), count: -8 }]
  });
}).add('With numbers for days', function () {
  return React.createElement(DriftChart, {
    drifts: [{ date: 0, count: -8 }, { date: 1, count: 1 }, { date: 2, count: 2 }, { date: 3, count: -3 }, { date: 4, count: 2 }, { date: 5, count: 5 }, { date: 6, count: -1 }]
  });
});

