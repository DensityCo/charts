'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = drift;

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);


function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var labels = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT'
};
var brandPrimary = '#4198ff';
var grayDark = '#8E9299';
var positiveColor = brandPrimary;
var negativeColor = '#fbbf58';

var leftMargin = 48;
var topMargin = 32;

function drift(elem) {

  var svg = d3.select(elem).append('svg').attr('class', 'graph graph-drift').attr('width', '100%');

  // Create a group for everything to live in
  var g = svg.append("g").attr('transform', 'translate(' + leftMargin + ',' + topMargin + ')');

  // Create groups for each chart part
  var axisGroup = g.append("g");

  var barGroup = g.append('g').attr('transform', 'translate(0,20)');

  var midLine = g.append('line').attr('class', 'mid-line');

  // When the chart updates...
  return function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var width = props.width || 1000;
    var height = props.height || 350;

    var graphWidth = width - 2 * leftMargin;
    var graphHeight = height - 2 * topMargin;

    // Adjust svg attributes depending on props
    svg.attr('height', height).attr('viewBox', '0 0 ' + width + ' ' + height);

    if (props.data && props.data.length) {
      // Given an array of drifts, map them to data with a day name and count
      var data = props.data.map(function (drift) {
        return {
          day: labels[typeof drift.date === 'number' ? drift.date : drift.date.day()],
          value: drift.count
        };
      });

      var x = d3.scaleLinear().rangeRound([graphWidth, 0]);
      var y = d3.scaleBand().rangeRound([0, graphHeight]).padding(0.3);

      // Set the duration of the scales.
      // The x axis: values. Scales to have the largest value at the extremes, left and right.
      var maxData = d3.max(data, function (d) {
        return d.value;
      }),
          minData = d3.min(data, function (d) {
        return d.value;
      });
      var maxExtreme = Math.max(Math.abs(maxData), Math.abs(minData), 2) * 1.4;
      x.domain([maxExtreme, -1 * maxExtreme]);
      // The y axis: labels for each day.
      y.domain(data.map(function (d) {
        return d.day;
      }));

      // Draw axes:
      // 1. Remove existing axes.
      axisGroup.selectAll("g").remove();

      // 2. Draw X axis / Y axis
      axisGroup.append("g").attr("class", "axis axis-x").attr("transform", 'translate(0,0)').call(d3.axisBottom(x).ticks(10).tickSizeOuter(0).tickSize(graphHeight));
      axisGroup.append("g").attr("class", "axis axis-y").attr("transform", 'translate(30,0)').call(d3.axisLeft(y).tickSizeOuter(0));

      // Draw a line through the center
      midLine.attr('x1', x(0)).attr('y1', 0).attr('x2', x(0)).attr('y2', graphHeight).attr('stroke-width', 2).attr('stroke', grayDark);

      // Create a data join
      var selection = barGroup.selectAll(".bar").data(data);
      selection.enter().append("path").attr("class", "bar").merge(selection).attr('d', function (d) {
        // Render a rectangular bar for each drift
        return ['M ' + x(0) + ' ' + y(d.day), // move to the point
        'H ' + x(d.value), 'V ' + (y(d.day) - y.bandwidth()), 'H ' + x(0)].join(' ');
      }).attr('fill', function (d) {
        return d.value > 0 ? positiveColor : negativeColor;
      }).attr('title', function (d) {
        return d.value;
      });

      selection.exit().remove(); // remove items when they are no longer in the data.
    }
  };
}

