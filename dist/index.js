"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var React = _interopRequireWildcard(_react);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function chartAsReactComponent(chart) {
  return function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: "render",
      value: function render() {
        var _this2 = this;

        return React.createElement("div", { ref: function ref(_ref) {
            if (_ref !== null) {
              if (!_this2.updateChart) {
                _this2.updateChart = chart(_ref);
              }
              _this2.updateChart(_this2.props);
            }
          } });
      }
    }]);

    return _class;
  }(React.Component);
}

function chartAsReactComponentAutoUpdate(chart) {
  return function (_React$Component2) {
    _inherits(_class2, _React$Component2);

    function _class2() {
      _classCallCheck(this, _class2);

      return _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).apply(this, arguments));
    }

    _createClass(_class2, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this4 = this;

        var animate = function animate(frame) {
          if (window.requestAnimationFrame) {
            return window.requestAnimationFrame(frame);
          } else {
            return setInterval(frame, 1000 / 30); // 30 FPS
          }
        };

        this.animationFrame = animate(function () {
          if (_this4.updateChart) {
            _this4.updateChart(_this4.props);
          }
        });
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var unanimate = window.cancelAnimationFrame || window.clearInterval;
        unanimate(this.animationFrame);
      }
    }, {
      key: "render",
      value: function render() {
        var _this5 = this;

        return React.createElement("div", { ref: function ref(_ref2) {
            if (_ref2 !== null) {
              if (!_this5.updateChart) {
                _this5.updateChart = chart(_ref2);
              }
              _this5.updateChart(_this5.props);
            }
          } });
      }
    }]);

    return _class2;
  }(React.Component);
}

module.exports = { chartAsReactComponent: chartAsReactComponent, chartAsReactComponentAutoUpdate: chartAsReactComponentAutoUpdate };

