'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = countGraph;


var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var brandPrimary = '#4198ff';

var leftMargin = 32;
var bottomMargin = 32;
var topMargin = 16;

var overlayDialogHeight = 72;
var overlayDialogWidth = 108;
var overlayDialogTextSize = 16; // Size of the text
var overlayDialogTextMargin = 12; // Y spacing between text and its container
var overlayDialogBorderRadius = 4;

// Distance between the overlay dialog and the line on the graph
var overlayDialogDistanceToLine = 10;

// Distance the overlay dialog has to get to the right side of the graph before the dialog breaks to
// the other side of the line.
var overlayDialogBreakToLeftPadding = 20;

function momentToNumber(date) {
  if (date instanceof _moment2.default) {
    return date.valueOf();
  } else {
    return (0, _moment2.default)(date).valueOf();
  }
}

function countGraph(elem) {
  var svg = d3.select(elem).append('svg').attr('class', 'graph-countgraph').attr('width', '100%');

  var svgGroup = svg.append('g').attr('transform', 'translate(' + leftMargin + ',' + topMargin + ')');

  // The graph path that shows the data goes in here.
  var graphGroup = svgGroup.append('g').attr('class', 'graph-group');

  // The axes go in here.
  var axisGroup = svgGroup.append('g').attr('class', 'axis-group');

  // Resets are all stuck in this group, must be above the axes, otehrwise the horizontal axis rules
  // cross over the reset line and make it look like a dotted line.
  var resetGroup = svgGroup.append('g').attr('class', 'reset-group');

  // Put all the overlay stuff in here (the line and dialog)
  var overlayGroup = svgGroup.append('g').attr('class', 'overlay-group');

  // The hidden rectangle to use to detect mouse position
  var overlayRect = svgGroup.append('g').attr('class', 'overlay-rect');

  return function update() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var width = props.width || 1000;
    var height = props.height || 400;
    var data = props.data || [];
    var resets = props.resets || [];

    // Adjust the svg size and viewbox to match the passed in values.
    svg.attr('height', height).attr('viewBox', '0 0 ' + width + ' ' + height);

    if (!Array.isArray(data)) {
      throw new Error('A \'data\' prop is required.');
    }

    // When no data is specified, don't render anything.
    if (data.length === 0) {
      return;
    }

    // Get the drawn graph size, minus the borders.
    var graphWidth = width - leftMargin;
    var graphHeight = height - topMargin - bottomMargin;

    // Get first values for using in computations
    var firstEvent = data[0];
    var firstCount = firstEvent ? firstEvent.count : 0;
    var firstTimestamp = firstEvent ? (0, _moment2.default)(firstEvent.timestamp) : (0, _moment2.default)();

    // Get last values for using in computations
    var lastEvent = data[data.length - 1];
    var lastCount = lastEvent ? lastEvent.count : 0;
    var lastTimestamp = lastEvent ? _moment2.default.min((0, _moment2.default)(lastEvent.timestamp), (0, _moment2.default)(props.end)) : (0, _moment2.default)();

    var start = props.start || firstTimestamp;
    var end = props.end || lastTimestamp;

    // Construct scales
    var xScale = d3.scaleLinear().rangeRound([graphWidth, 0]).domain([momentToNumber(end), momentToNumber(start)]);
    var largestCount = Math.max.apply(Math, data.map(function (i) {
      return i.count;
    }));
    var smallestCount = Math.min.apply(Math, data.map(function (i) {
      return i.count;
    }));
    var yScale = d3.scaleLinear().rangeRound([graphHeight, 0]).domain([smallestCount, largestCount]);

    var lastX = xScale(lastTimestamp);
    var lastY = yScale(lastCount);
    var bottomY = graphHeight - 1;

    // Generate the svg path for the graph line.
    var pathPrefix = ['M1,' + yScale(0), // Move to the lower left
    'L' + xScale(momentToNumber(firstTimestamp)) + ',' + yScale(0)].join('');
    var pathSuffix = ['L' + lastX + ',' + lastY, // Line to the last coordinate, if not already there.
    'L' + lastX + ',' + bottomY, // Line down to the y axis.
    'L1,' + bottomY];
    var linePath = data.reduce(function (total, i) {
      var magnitude = momentToNumber(i.timestamp);
      var xPosition = xScale(magnitude);
      var yPosition = yScale(i.count);

      // For "jagged" but more correct look
      // return `${total}L${xPosition},${yPosition}`;
      // For squared off look
      return total + 'H' + xPosition + 'V' + yPosition;
    }, '');

    var graphSelection = graphGroup.selectAll('.graph-path').data([data]);

    graphSelection.enter().append('path').attr('class', 'graph-path').merge(graphSelection).attr('d', function (d) {
      return pathPrefix + linePath + pathSuffix;
    });

    graphSelection.exit();

    // Draw the axes in the svg
    var xAxis = d3.axisBottom(xScale)
    // format the time scale display for different domain sizes
    // started by trying to remove the zero padding from the hours
    // and it got out of hand, this is complicated logic
    .tickFormat(function (d) {
      return d3.timeFormat('%-I%p')(d).toLowerCase();
    }).tickSizeOuter(0).ticks(10);

    var yAxis = d3.axisLeft(yScale).tickSizeOuter(0).ticks(10).tickSize(graphWidth);

    // Remove all axes that are already drawn
    axisGroup.selectAll("g").remove();

    // Draw axes in the axisGroup.
    axisGroup.append("g").attr("class", "axis axis-y").attr("transform", 'translate(' + (graphWidth - 5) + ',0)').call(yAxis);
    axisGroup.append("g").attr("class", "axis axis-x").attr("transform", 'translate(0,' + (graphHeight + 5) + ')').call(xAxis);

    // Generate reset lines
    var resetSelection = resetGroup.selectAll('.reset-line').data(resets);

    resetSelection.enter().append('path').attr('class', 'reset-line').merge(resetSelection).attr('d', function (d) {
      var resetPosition = xScale(momentToNumber(d.timestamp));
      return 'M' + resetPosition + ',0V' + graphHeight;
    });

    resetSelection.exit().remove('.reset-line');

    // Draw the overlay line
    overlayRect.append('rect').attr('x', 0).attr('y', 0).attr('width', graphWidth).attr('height', graphHeight).attr('fill', 'transparent').on('mousemove', function () {
      var mouseX = d3.mouse(overlayRect.node())[0];
      updateOverlayLine(mouseX);
    }).on('mouseout', function () {
      updateOverlayLine(null);
    });

    function updateOverlayLine(mouseX) {
      // Calculate, given a mouse X coordinate, the count and time at that x coordinate.
      var bisect = d3.bisector(function (d) {
        return momentToNumber(d.timestamp);
      }).right;
      var timeAtPosition = void 0,
          itemIndexAtOverlayPosition = void 0,
          countAtPosition = void 0,
          dataToJoin = void 0;
      timeAtPosition = xScale.invert(mouseX); // The time the user is hovering over, as a number.
      itemIndexAtOverlayPosition = bisect(data, timeAtPosition) - 1; // Where on the line is that time?

      // FIXME: another bug: data.length must be > 0
      // If the user is hovering over where the data is in the chart...
      if (firstTimestamp <= timeAtPosition && timeAtPosition <= lastTimestamp) {
        // ... get the count where the user is hovering.
        countAtPosition = data[itemIndexAtOverlayPosition].count;

        // If a mouse position was passed that is null, (ie, the mouse isn't in the chart any longer)
        // then disregard it so the overlay line will be deleted.
        dataToJoin = mouseX === null ? [] : [mouseX];
      } else {
        // The user isn't hovering over any data, so remove the overlay line.
        dataToJoin = [];
      }

      var overlaySelection = overlayGroup.selectAll('.overlay-line').data(dataToJoin);

      //
      // Enter
      //

      var enteringGroup = overlaySelection.enter().append('g').attr('class', 'overlay-line');

      // Overlay line
      enteringGroup.append('path').attr('d', 'M0,0V' + graphHeight);

      enteringGroup.append('circle').attr('cx', 0).attr('cy', 0) // NOTE: overridden in merge below
      .attr('r', 4);

      // Overlay dialog box
      var overlayDialogGroup = enteringGroup.append('g').attr('class', 'overlay-dialog');

      // Draw the overlay dialog box background
      overlayDialogGroup.append('rect').attr('class', 'overlay-dialog-bg').attr('x', 0).attr('y', overlayDialogHeight / 4).attr('width', overlayDialogWidth).attr('height', 0.75 * overlayDialogHeight).attr('rx', overlayDialogBorderRadius).attr('ry', overlayDialogBorderRadius);

      overlayDialogGroup.append('rect').attr('class', props.adjusted ? 'overlay-dialog-bg-adjusted' : 'overlay-dialog-bg-primary').attr('x', 0).attr('y', 0).attr('width', overlayDialogWidth).attr('height', overlayDialogHeight / 2).attr('rx', overlayDialogBorderRadius).attr('ry', overlayDialogBorderRadius);

      overlayDialogGroup.append('rect').attr('class', props.adjusted ? 'overlay-dialog-bg-adjusted' : 'overlay-dialog-bg-primary').attr('x', 0).attr('y', overlayDialogHeight / 4).attr('width', overlayDialogWidth).attr('height', overlayDialogHeight / 4);

      // Add text to overlay dialog box

      // The time for a given datapoint
      overlayDialogGroup.append("text").attr("class", "overlay-dialog-time").attr("x", overlayDialogWidth / 2).attr("y", overlayDialogTextMargin + overlayDialogTextSize - 4).attr("text-anchor", "middle");

      // The count at a given datapoint
      overlayDialogGroup.append("text").attr("class", "overlay-dialog-count").attr("x", overlayDialogWidth / 2).attr("y", overlayDialogHeight - overlayDialogTextMargin).attr("text-anchor", "middle");

      //
      // Merge
      //

      var mergingGroup = enteringGroup.merge(overlaySelection).attr('transform', function (d) {
        return 'translate(' + d + ',0)';
      });

      mergingGroup.select('circle').attr('cy', function (d) {
        return yScale(countAtPosition);
      });

      mergingGroup.select('.overlay-dialog').attr('transform', function (d) {
        // Determine which side of the line to drap the popup dialog on.
        var popupYCoord = yScale(countAtPosition) + overlayDialogDistanceToLine,
            popupXCoord = void 0;
        if (d + overlayDialogWidth + overlayDialogBreakToLeftPadding > graphWidth) {
          // Put popup on left if when on the right it would be off the svg.
          popupXCoord = -overlayDialogWidth - overlayDialogDistanceToLine;
        } else {
          // Put popup on right by default.
          popupXCoord = overlayDialogDistanceToLine;
        }

        // If the popup is being drawn outside of the svg when the user is looking at low counts,
        // then raise up the popup to put it above the cursor.
        if (popupYCoord + overlayDialogHeight + overlayDialogBreakToLeftPadding > graphHeight) {
          popupYCoord -= overlayDialogHeight + overlayDialogDistanceToLine;
        }

        return 'translate(' + popupXCoord + ',' + popupYCoord + ')';
      });

      mergingGroup.select('.overlay-dialog-time').text((0, _moment2.default)(timeAtPosition).format('h:mm A'));

      mergingGroup.select('.overlay-dialog-count').text(props.adjusted ? 'Adj: ' + countAtPosition : countAtPosition);

      //
      // Exit
      //

      overlaySelection.exit().remove('.overlay-line');
    }
  };
}

