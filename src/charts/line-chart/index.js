import * as d3 from 'd3';

import moment from 'moment';
import 'moment-timezone';

import colorVariables from '@density/ui/variables/colors.json';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

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
    // SET DEFAULT VALUES
    // ------------------------------------------------------------------------
    timeZone = timeZone || 'UTC';
    data = data.map((item, ct) => {
      item.name = item.name || 'default';
      item.color = item.color || 'rgba(65, 152, 255, 0.2)';
      item.borderColor = item.borderColor || 'rgb(65, 152, 255)';
      item.verticalBaselineOffset = item.verticalBaselineOffset || 0;

      if (!item.data) {
        throw new Error(`Line Chart data item index ${ct} ('${item.name}') missing a data property. This is required!`);
      }

      item.data.forEach((j, jct) => {
        if (!j.timestamp) {
          throw new Error(`Line Chart data item index ${ct} ('${item.name}') missing a timestamp property within the data property (index ${jct}). This is required!`);
        }
        if (typeof j.value !== 'number') {
          throw new Error(`Line Chart data item index ${ct} ('${item.name}') missing a numeric value property (actual value: ${j.value}) within the data property (index ${jct}). This is required!`);
        }
      });

      // Verify the order of the data by comparing the first and second values to ensure that order is
      // oldest to newest
      if (item.data.length > 0) {
        if (moment.utc(item.data[0].timestamp).valueOf() - moment.utc(item.data[1].timestamp).valueOf() > 0) {
          throw new Error([
            `Line Chart data item index ${ct} ('${item.name}') looks to have data in the wrong order`,
            `(item index 0 was newer than item index 1). Please presort data from oldest to newest`,
            `before passing it to this chart.`
          ].join(' '));
        }
      }

      return item;
    });
    overlays = overlays || [];

    if (typeof svgWidth !== 'number') {
      throw new Error(`Line Chart is missing the property 'svgWidth'. This is required!`);
    }
    if (typeof svgHeight !== 'number') {
      throw new Error(`Line Chart is missing the property 'svgHeight'. This is required!`);
    }

    /* xAxis */
    /* yAxis */

    /* xAxisStart can be undefined */
    /* xAxisEnd can be undefined */
    /* yAxisStart can be undefined */
    /* yAxisEnd can be undefined */

    overlayShowPoint = typeof overlayShowPoint === 'undefined' ? true : overlayShowPoint;
    overlayPointRadius = typeof overlayPointRadius === 'undefined' ? 4.5 : overlayPointRadius;

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
    if (defaultDataset.data.length === 0) {
      return;
    }

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
      dataPoints,
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
      dataPoints,
      defaultDataset,
    }, layers.yAxis);

    // ------------------------------------------------------------------------
    // OVERLAY
    // ------------------------------------------------------------------------
    function overlayMouseAction(action, defaultDataset) {
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
            const eventAtPosition = defaultDataset.data[eventIndexAtOverlayPosition] || defaultDataset.data[0];

            const renderAfterLastDatapoint = typeof defaultDataset.renderAfterLastDatapoint === 'undefined' ? false : true;
            if (eventAtPosition && (renderAfterLastDatapoint ? true : xInMs <= dataPoints.lastEventXValue)) {
              return topMargin + yScale(eventAtPosition.value) - defaultDataset.verticalBaselineOffset;
            } else {
              return -100000000;
            }
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
                dataPoints,
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
                dataPoints,
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
                dataPoints,
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
    .merge(overlayPointSelection)
      .on('mousemove', overlayMouseAction('mousemove', defaultDataset))
      .on('mouseleave', overlayMouseAction('mouseleave', defaultDataset))
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
  verticalBaselineOffset,

  renderAfterLastDatapoint,
}) {
  renderAfterLastDatapoint = typeof renderAfterLastDatapoint === 'undefined' ? false : true;

  return ({xScale, yScale, graphHeight, dataPoints}, element) => {
    const waterlineFillPrefix = `M0,${graphHeight}` + /* move to the lower left of the graph */
      `L0,${yScale(dataPoints.firstEvent.value)}`; /* Move to the first datapoint's y value */

    const waterlineStrokePrefix = `M0,${graphHeight}` + /* move to the lower left of the graph */
      `M0,${yScale(dataPoints.firstEvent.value)}`; /* Move to the first datapoint's y value */

    const waterlineFillPostfix = renderAfterLastDatapoint ?
      `H${xScale(dataPoints.endXValue)}V${graphHeight}H1` :
      `H${xScale(dataPoints.lastEventXValue)}V${graphHeight}H1`;

    const waterlineStrokePostfix = renderAfterLastDatapoint ?
      `H${xScale(dataPoints.endXValue)}` :
      `H${xScale(dataPoints.lastEventXValue)}`;

    const waterlineSelection = d3.select(element).selectAll('.waterline').data([
      {
        data,
        path: data.reduce((acc, i, ct) => {
          const timeEpoch = moment.utc(i.timestamp).valueOf();
          if (timeEpoch > dataPoints.endXValue) {
            return acc;
          }

          const xPosition = xScale(timeEpoch);
          const yPosition = yScale(i.value);
          if (ct === 0) {
            // For the first plotted point, don't draw an outline on the left edge.
            return `${acc}M0,${yPosition-verticalBaselineOffset}`;
          } else if (xPosition > 0) {
            // Plot each point my moving horizontally then vertically.
            return `${acc}H${xPosition}V${yPosition-verticalBaselineOffset}`;
          } else {
            return acc;
          }
        }, ''),
      },
    ], d => d.data);
    const waterlineSelectionGroup = waterlineSelection.enter()
      .append('g')
        .attr('class', 'waterline');
    waterlineSelectionGroup.append('path')
      .attr('class', 'waterline-fill')
      .attr('shape-rendering', 'crispEdges')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('fill', color);
    waterlineSelectionGroup.append('path')
      .attr('class', 'waterline-stroke')
      .attr('stroke', borderColor)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', 'transparent');

    waterlineSelectionGroup.merge(waterlineSelection)
      .select('.waterline-fill')
      .attr('d', d => waterlineFillPrefix + d.path + waterlineFillPostfix);
    waterlineSelectionGroup.merge(waterlineSelection)
      .select('.waterline-stroke')
      .attr('d', d => waterlineStrokePrefix + d.path + waterlineStrokePostfix);
    waterlineSelection.exit().remove();
  };
}

