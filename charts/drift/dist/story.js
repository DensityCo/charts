'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _storybook = require('@kadira/storybook');

var _2 = require('./');

var _3 = _interopRequireDefault(_2);

var _4 = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DriftChart = (0, _4.chartAsReactComponent)(_3.default);

(0, _storybook.storiesOf)('Drift Chart', module).add('With moments for days', function () {
  return React.createElement(DriftChart, {
    data: [{ date: (0, _moment2.default)().add(0, 'day'), drift: 1, eventCount: 100 }, { date: (0, _moment2.default)().add(1, 'day'), drift: 2, eventCount: 123 }, { date: (0, _moment2.default)().add(2, 'day'), drift: -3, eventCount: 123 }, { date: (0, _moment2.default)().add(3, 'day'), drift: 2, eventCount: 123 }, { date: (0, _moment2.default)().add(4, 'day'), drift: 5, eventCount: 123 }, { date: (0, _moment2.default)().add(5, 'day'), drift: 0, eventCount: 123 }, { date: (0, _moment2.default)().add(6, 'day'), drift: -8, eventCount: 123 }]
  });
}).add('With numbers for days', function () {
  return React.createElement(DriftChart, {
    data: [{ date: 0, drift: 1, eventCount: 100 }, { date: 1, drift: 2, eventCount: 123 }, { date: 2, drift: -3, eventCount: 123 }, { date: 3, drift: 2, eventCount: 123 }, { date: 4, drift: 5, eventCount: 123 }, { date: 5, drift: 0, eventCount: 123 }, { date: 6, drift: -8, eventCount: 123 }]
  });
}).add('With adding points to the chart over time. This is to show that the chart can receive updates.', function () {
  var AddNewPointsToGraph = function (_React$Component) {
    _inherits(AddNewPointsToGraph, _React$Component);

    function AddNewPointsToGraph(props) {
      _classCallCheck(this, AddNewPointsToGraph);

      var _this = _possibleConstructorReturn(this, (AddNewPointsToGraph.__proto__ || Object.getPrototypeOf(AddNewPointsToGraph)).call(this, props));

      _this.state = { data: [] };
      return _this;
    }

    _createClass(AddNewPointsToGraph, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        this.interval = setInterval(function () {
          _this2.setState({
            data: new Array(7).fill(0).map(function (_, ct) {
              return {
                date: ct,
                drift: Math.floor(Math.random() * 20) - 10,
                eventCount: 100
              };
            })
          });
        }, 1000);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        clearInterval(this.interval);
      }
    }, {
      key: 'render',
      value: function render() {
        console.log('update', this.state.data);
        return React.createElement(DriftChart, { data: this.state.data });
      }
    }]);

    return AddNewPointsToGraph;
  }(React.Component);

  return React.createElement(AddNewPointsToGraph, null);
});

