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
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var drifts = props.drifts;

  var width = props.width || 1000;
  var height = props.height || 350;

  var graphWidth = width - 2 * leftMargin;
  var graphHeight = height - 2 * topMargin;

  if (drifts && drifts.length) {
    // Given an array of drifts, map them to data with a day name and count
    var data = drifts.map(function (drift) {
      return {
        day: labels[typeof drift.date === 'number' ? drift.date : drift.date.day()],
        value: drift.count
      };
    });

    var svg = d3.select(elem).selectAll('svg').data([data]).enter().append('svg').attr('class', 'graph graph-drift').attr('width', '100%').attr('height', height).attr('viewBox', '0 0 ' + width + ' ' + height);
    var x = d3.scaleLinear().rangeRound([graphWidth, 0]);
    var y = d3.scaleBand().rangeRound([0, graphHeight]).padding(0.3);

    // Create a group for everything to live in
    var g = svg.append("g").attr('transform', 'translate(' + leftMargin + ',' + topMargin + ')');

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

    // Draw the x axis (values)
    var xAxis = d3.axisBottom(x).ticks(10).tickSizeOuter(0).tickSize(graphHeight);
    g.append("g").attr("class", "axis axis-x").call(xAxis).attr("transform", 'translate(0,0)');

    // Draw the y axis (labels)
    g.append("g").attr("class", "axis axis-y").attr("transform", 'translate(30,0)').call(d3.axisLeft(y).tickSizeOuter(0));

    // Next, draw the bars. Make a group so that the bars can be drawn in it at the end of the
    // render cycle though.
    var barGroup = g.append('g').attr('transform', 'translate(0,20)');

    // Draw a line through the center
    g.append('line').attr('class', 'mid-line').attr('x1', x(0)).attr('y1', 0).attr('x2', x(0)).attr('y2', graphHeight).attr('stroke-width', 2).attr('stroke', grayDark);

    // Create a data join
    var selection = barGroup.selectAll(".bar").data(data);
    var enterSelection = selection.enter().append("path").attr("class", "bar"); // add new items
    var exitSelection = selection.exit().remove(); // remove items when they are no longer in the data.

    var mergeSelection = enterSelection.merge(selection);

    // Render a rectangular bar for each drift
    mergeSelection.attr('d', function (d) {
      return ['M ' + x(0) + ' ' + y(d.day), // move to the point
      'H ' + x(d.value), 'V ' + (y(d.day) - y.bandwidth()), 'H ' + x(0)].join(' ');
    }).attr('fill', function (d) {
      return d.value > 0 ? positiveColor : negativeColor;
    }).attr('title', function (d) {
      return d.value;
    }).attr('class', 'bar');
  }
}

