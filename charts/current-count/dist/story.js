'use strict';

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _storybook = require('@kadira/storybook');

var _index = require('../index');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _index2 = require('./index');

var _index3 = _interopRequireDefault(_index2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var CurrentCount = (0, _index.chartAsReactComponent)(_index3.default);

(0, _storybook.storiesOf)('Current Count', module).add('With current count, capacity, lastEvent', function () {
  return React.createElement(CurrentCount, { currentCount: 24, capacity: 100, lastEvent: (0, _moment2.default)() });
}).add('With current count and capacity', function () {
  return React.createElement(CurrentCount, { currentCount: 24, capacity: 100 });
}).add('With a full capacity', function () {
  return React.createElement(CurrentCount, { currentCount: 100, capacity: 100 });
});

