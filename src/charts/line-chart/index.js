import * as d3 from 'd3';

import moment from 'moment';
import 'moment-timezone';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

const colorVariables = {
  "grayCinder": "#222A2E",

  "grayDarkest": "#4E5457",
  "grayDarker": "#8E9299",
  "grayDark": "#B4B8BF",
  "gray": "#CBCFD6",
  "grayLight": "#E8E8ED",
  "grayLighter": "#F0F0F2",
  "grayLightest": "#FAFAFA",

  "brandPrimary": "#4198FF",
  "brandSuccess": "#80CD80",
  "brandDanger": "#FF5454",
  "brandWarning": "#FFBA08",
};


export default function lineChart(elem, props={}) {
  const svg = d3.select(elem).append('svg');

  const layers = {
    data: svg.append('g').attr('class', 'layer layer-data'),

    xAxis: svg.append('g').attr('class', 'layer layer-x-axis'),
    yAxis: svg.append('g').attr('class', 'layer layer-y-axis'),

    overlay: svg.append('g').attr('class', 'layer layer-overlay'),
  };

  layers.overlay.append('g')
    .attr('class', 'overlay-views')
  layers.overlay.append('g')
    .attr('class', 'overlay-points')

  return ({
    timeZone,
    data,
    overlays,

    svgWidth,
    svgHeight,

    xAxis,
    yAxis,

    xAxisStart,
    xAxisEnd,
    yAxisStart,
    yAxisEnd,

    overlayShowPoint,
    overlayPointRadius,
  }) => {

    // ------------------------------------------------------------------------
    // ADJUST GRAPH SIZE
    // ------------------------------------------------------------------------

    const topMargin = 76;
    const leftMargin = 56;
    const rightMargin = 20;
    const bottomMargin = 96;

    const graphWidth = svgWidth - leftMargin - rightMargin;
    const graphHeight = svgHeight - topMargin - bottomMargin;

    svg.attr('width', svgWidth);
    svg.attr('height', svgHeight);

    layers.xAxis.attr('transform', `translate(${leftMargin},${topMargin+graphHeight})`)
    layers.yAxis.attr('transform', `translate(${leftMargin},${topMargin})`)
    layers.data.attr('transform', `translate(${leftMargin},${topMargin})`)

    // ------------------------------------------------------------------------
    // GATHERING DATA POINTS
    // ------------------------------------------------------------------------
    const dataPoints = {};

    const defaultDataset = data.find(i => i.name === 'default');

    dataPoints.firstEvent = defaultDataset.data[0];
    dataPoints.lastEvent = defaultDataset.data.slice(-1)[0];

    dataPoints.firstEventXValue = moment.utc(dataPoints.firstEvent.timestamp).valueOf(); /* epoch ms */
    dataPoints.firstEventYValue = dataPoints.firstEvent.value;
    dataPoints.lastEventXValue = moment.utc(dataPoints.lastEvent.timestamp).valueOf(); /* epoch ms */
    dataPoints.lastEventYValue = dataPoints.lastEvent.value;

    dataPoints.eventWithSmallestValue = defaultDataset.data.reduce((a, b) => a.value < b.value ? a : b, {value: Infinity});
    dataPoints.eventWithLargestValue = defaultDataset.data.reduce((a, b) => a.value > b.value ? a : b, {value: -1});

    dataPoints.startXValue = xAxisStart ? moment.utc(xAxisStart).valueOf() : dataPoints.firstEventXValue;
    dataPoints.endXValue = xAxisEnd ? moment.utc(xAxisEnd).valueOf() : dataPoints.lastEventXValue;

    dataPoints.startYValue = typeof yAxisStart !== 'undefined' ? yAxisStart : dataPoints.eventWithSmallestValue.value;
    dataPoints.endYValue = typeof yAxisEnd !== 'undefined' ? yAxisEnd : dataPoints.eventWithLargestValue.value;

    const xScale = d3.scaleLinear()
      .rangeRound([0, graphWidth])
      .domain([dataPoints.startXValue, dataPoints.endXValue]);

    const yScale = d3.scaleLinear()
      .rangeRound([graphHeight, 0])
      .domain([dataPoints.startYValue, dataPoints.endYValue]);

    // ------------------------------------------------------------------------
    // X AXIS
    // ------------------------------------------------------------------------
    xAxis({
      scale: xScale,
      timeZone,
      bottomMargin,
    }, layers.xAxis);

    // ------------------------------------------------------------------------
    // Y AXIS
    // ------------------------------------------------------------------------
    yAxis({
      scale: yScale,
      firstEventYValue: dataPoints.startYValue,
      lastEventYValue: dataPoints.endYValue,
      graphWidth,
      leftMargin,
    }, layers.yAxis);

    // ------------------------------------------------------------------------
    // OVERLAY
    // ------------------------------------------------------------------------
    function overlayMouseAction(action) {
      return function() {
        // Break early if we shouldn't draw the overlay point
        if (!overlayShowPoint) {
          return;
        }

        let selectionData = [], x = null, y = null;
        if (action === 'mousemove') {
          const coordinates = d3.mouse(this);
          x = coordinates[0] - leftMargin;
          y = coordinates[1] - topMargin;
          selectionData = [x];
        }

        // Render the point on the graph that correspnds to where the user currently has their
        // mouse directed at.
        const pointSelection = layers.overlay.select('.overlay-points').selectAll('.point').data(selectionData);
        pointSelection.enter()
          .append('circle')
            .attr('class', 'point')
            .attr('r', overlayPointRadius)
            .attr('fill', colorVariables.brandPrimary)
        .merge(pointSelection)
          .attr('cx', d => leftMargin + d)
          .attr('cy', d => {
            const xInMs = xScale.invert(d);
            const eventIndexAtOverlayPosition = d3
              .bisector(d => moment.utc(d.timestamp).valueOf())
              .right(defaultDataset.data, xInMs) - 1;
            const eventAtPosition = defaultDataset.data[eventIndexAtOverlayPosition];
            return topMargin + yScale(eventAtPosition.value);
          });
        pointSelection.exit().remove();


        // Render any number of overlays on top of the point.
        const overlaySelection = layers.overlay.select('.overlay-views')
          .attr('transform', `translate(${leftMargin},${topMargin})`)
          .selectAll('.overlay-view')
          .data(
            /* ensure that each overlay exits when the mouse leaves */
            action === 'mouseleave' ? [] : overlays
          );
        overlaySelection.enter()
          .append('g')
            .attr('class', 'overlay-view')
            .each(function(d) {
              return d.enter({
                /* no mouse x or y here since they are null */
                xScale,
                yScale,
                graphWidth,
                graphHeight,
                defaultDataset,
              }, d3.select(this)); /* this = reference to the g.overlay-view created above */
            })
        .merge(overlaySelection)
          .each(function(d) {
            if (x !== null && y !== null) {
              return d.merge({
                mouseX: x,
                mouseY: y,
                xScale,
                yScale,
                graphWidth,
                graphHeight,
                defaultDataset,
              }, d3.select(this)); /* this = reference to the g.overlay-view created above */
            }
          });
        overlaySelection.exit()
          .each(function(d) {
              return d.exit({
                // no mouse x or y here since they most likely the mouse is outside of the overlay
                // rect at this point
                xScale,
                yScale,
                graphWidth,
                graphHeight,
                defaultDataset,
              }, d3.select(this)); /* this = reference to the g.overlay-view created above */
          });
      };
    }
    const overlayPointSelection = layers.overlay.selectAll('.overlay').data([dataPoints]);
    overlayPointSelection.enter()
      .append('rect')
        .attr('class', 'overlay')
        .attr('fill', 'transparent')
        .attr('x', leftMargin)
        .attr('y', topMargin)
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .on('mousemove', overlayMouseAction('mousemove'))
        .on('mouseleave', overlayMouseAction('mouseleave'))
    overlayPointSelection.exit().remove()

    // ------------------------------------------------------------------------
    // WATERLINES
    // ------------------------------------------------------------------------
    const dataSelection = layers.data.selectAll('.data').data(data);
    dataSelection.enter()
      .append('g')
        .attr('class', 'data')
    .merge(dataSelection)
      .each(function(d) {
        return d.type(d)({
          xScale,
          yScale,
          graphHeight,
          graphWidth,
          dataPoints,
        }, this); /* this = reference to the g.data created above */
      });
  }
}

export function dataWaterline({
  data,
  color,
  borderColor,
}) {
  return ({xScale, yScale, graphHeight, dataPoints}, element) => {
    const waterlinePrefix = `M0,${graphHeight}` + /* move to the lower left of the graph */
      `L0,${yScale(dataPoints.startYValue)}`; /* move to the first datapoint in the waterline */
    const waterlinePostfix = `H${xScale(dataPoints.lastEventXValue)}V${graphHeight}H1`;

    const waterlineSelection = d3.select(element).selectAll('.waterline').data([data]);
    const waterlineSelectionGroup = waterlineSelection.enter()
      .append('g')
        .attr('class', 'waterline');
    waterlineSelectionGroup.append('path')
      .attr('class', 'waterline-fill')
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', color);
    waterlineSelectionGroup.append('path')
      .attr('class', 'waterline-stroke')
      .attr('stroke', borderColor)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', 'transparent');

    waterlineSelectionGroup.merge(waterlineSelection)
      .select('.waterline-fill')
      .attr('d', d => {
        return waterlinePrefix + d.reduce((acc, i) => {
          const xPosition = xScale(moment.utc(i.timestamp).valueOf());
          const yPosition = yScale(i.value);
          return `${acc} H${xPosition} V${yPosition}`;
        }, '') + waterlinePostfix;
      });
    waterlineSelectionGroup.merge(waterlineSelection)
      .select('.waterline-stroke')
      .attr('d', d => {
        return `M0,${graphHeight} M0,${yScale(dataPoints.firstEventYValue)}` + d.reduce((acc, i) => {
          const xPosition = xScale(moment.utc(i.timestamp).valueOf());
          const yPosition = yScale(i.value);
          return `${acc} H${xPosition} V${yPosition}`;
        }, '');
      });
    waterlineSelection.exit().remove();
  };
}

export function overlayTwoPopups({
  topPopupFormatter,
  bottomPopupFormatter,

  bottomOverlayTopMargin,
  topOverlayBottomMargin,
}) {
  const topOverlayWidth = 100;
  const topOverlayHeight = 42;
  const bottomOverlayWidth = 200;
  const bottomOverlayHeight = 42;

  return {
    enter: ({xScale, yScale}, selection) => {
      // Add filter for use in making shadows behind things.
      const filter = selection.append('filter')
        .attr('id', 'two-popup-overlay-shadow')
      filter.append('feGaussianBlur')
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 5)
        .attr("result", "blur");
      filter.append('feOffset')
        .attr('dx', 2)
        .attr('dy', 2)
        .attr("result", "offsetBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur")
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Render a vertical line that indicates where the user is within the graph
      selection.append('line')
        .attr('stroke', colorVariables.brandPrimary)
        .attr('shape-rendering', 'crispEdges');

      // Scaffold the top overlay
      const topOverlay = selection.append('g')
        .attr('class', 'top-overlay');
      topOverlay.append('rect')
        .attr('class', 'top-overlay-background shadow')
        .attr('height', topOverlayHeight)
        .attr('fill', 'rgba(0, 0, 0, 0.1)')
        .style("filter", "url(#two-popup-overlay-shadow)")
      topOverlay.append('rect')
        .attr('class', 'top-overlay-background')
        .attr('fill', '#fff')
        .attr('stroke', colorVariables.gray)
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('height', topOverlayHeight)

      // Allow custom formatter code to run on the top overlay.
      const topOverlayLabel = topOverlay.append('g')
        .attr('class', 'top-overlay-label');
      topPopupFormatter.enter(topOverlayLabel);

      // And scaffold the bottom overlay
      const bottomOverlay = selection.append('g')
        .attr('class', 'bottom-overlay');
      bottomOverlay.append('rect')
        .attr('class', 'bottom-overlay-background shadow')
        .attr('height', bottomOverlayHeight)
        .attr('fill', 'rgba(0, 0, 0, 0.1)')
        .style("filter", "url(#two-popup-overlay-shadow)")
      bottomOverlay.append('rect')
        .attr('class', 'bottom-overlay-background')
        .attr('fill', '#fff')
        .attr('stroke', colorVariables.gray)
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('height', bottomOverlayHeight)

      // Allow custom formatter code to run on the top overlay.
      const bottomOverlayLabel = bottomOverlay.append('g')
        .attr('class', 'bottom-overlay-label')
      bottomPopupFormatter.enter(bottomOverlayLabel);
    },
    merge: (data, selection) => {
      const {
        mouseX,
        mouseY,
        xScale,
        yScale,
        graphWidth,
        graphHeight,
        defaultDataset,
      } = data;
      const xInMs = xScale.invert(mouseX);
      const eventIndexAtOverlayPosition = d3
        .bisector(d => moment.utc(d.timestamp).valueOf())
        .right(defaultDataset.data, xInMs) - 1;
      const eventAtPosition = defaultDataset.data[eventIndexAtOverlayPosition];

      const formatterData = {
        ...data,
        item: eventAtPosition,
        topOverlayWidth,
        topOverlayHeight,
        bottomOverlayWidth,
        bottomOverlayHeight,
      };

      // Render a vertical line that indicates where the user is within the graph
      selection.select('line')
        .attr('x1', mouseX)
        .attr('y1', 0 - topOverlayBottomMargin)
        .attr('x2', mouseX)
        .attr('y2', graphHeight + bottomOverlayTopMargin)

      let topOverlayXPosition = mouseX - (topOverlayWidth / 2);
      // Ensure that the top overlay won't underflow the svg
      if (topOverlayXPosition < 0) {
        topOverlayXPosition = 0;
      }
      // Ensure that the top overlay won't overflow the svg
      if (topOverlayXPosition + topOverlayWidth > graphWidth) {
        topOverlayXPosition = graphWidth - topOverlayWidth;
      }

      // Apply the new x, y, and width to the top overlay
      selection.selectAll('.top-overlay-background')
        .attr('x', topOverlayXPosition)
        .attr('y', 0 - topOverlayBottomMargin - topOverlayHeight)
        .attr('width', topOverlayWidth)

      // Allow custom formatter code to run on the top overlay.
      const topOverlayLabel = selection.select('.top-overlay-label');
      topOverlayLabel.attr('transform', `translate(${topOverlayXPosition},${0 - topOverlayBottomMargin - topOverlayHeight})`)
      topPopupFormatter.merge(formatterData, topOverlayLabel);


      let bottomOverlayXPosition = mouseX - (bottomOverlayWidth / 2);
      // Ensure that the bottom overlay won't underflow the svg
      if (bottomOverlayXPosition < 0) {
        bottomOverlayXPosition = 0;
      }
      // Ensure that the bottom overlay won't overflow the svg
      if (bottomOverlayXPosition + bottomOverlayWidth > graphWidth) {
        bottomOverlayXPosition = graphWidth - bottomOverlayWidth;
      }

      // Apply the new x, y, and width to the bottom overlay
      selection.selectAll('.bottom-overlay-background')
        .attr('x', bottomOverlayXPosition)
        .attr('y', graphHeight + bottomOverlayTopMargin)
        .attr('width', bottomOverlayWidth)

      // Allow custom formatter code to run on the top overlay.
      const bottomOverlayLabel = selection.select('.bottom-overlay-label');
      bottomOverlayLabel.attr('transform', `translate(${bottomOverlayXPosition},${graphHeight + bottomOverlayTopMargin})`);
      bottomPopupFormatter.merge(formatterData, bottomOverlayLabel);
    },
    exit: (props, selection) => {
      selection.remove()
    },
  };
}
