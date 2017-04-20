'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


var _react = require('react');

var React = _interopRequireWildcard(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = function (elem) {
  return function (_ref) {
    var label = _ref.label,
        currentCount = _ref.currentCount,
        capacity = _ref.capacity,
        lastEvent = _ref.lastEvent;

    var lastEventDelta = lastEvent ? 'Last Event: ' + (0, _moment2.default)(lastEvent).fromNow() : '';

    _reactDom2.default.render(React.createElement(
      'div',
      { className: 'card chart-current-count' },
      React.createElement(
        'div',
        { className: 'card-body chart-current-count-body' },
        React.createElement(
          'div',
          { className: 'chart-current-count-header' },
          React.createElement(
            'strong',
            null,
            label
          ),
          React.createElement('span', { style: { flex: '1 1 0%' } }),
          React.createElement(
            'span',
            { className: 'chart-current-count-last-event' },
            lastEventDelta
          )
        ),
        React.createElement(
          'div',
          { className: 'chart-current-count-text' },
          currentCount
        ),
        React.createElement(
          'div',
          { className: 'chart-current-count-footer' },
          React.createElement(
            'span',
            null,
            'Capacity: ',
            capacity || 'N/A'
          ),
          React.createElement(
            'div',
            { className: 'chart-current-count-progress-bar' },
            React.createElement('div', {
              className: 'chart-current-count-progress-meter',
              style: { width: currentCount / capacity * 100 + '%' }
            })
          )
        )
      )
    ), elem);
  };
};

