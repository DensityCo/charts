import * as d3 from 'd3';

import moment from 'moment';
import 'moment-timezone';

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

export function overlayExample({color}) {
  return {
    enter: (data, selection) => {
      selection.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color)
    },
    merge: ({mouseX, mouseY}, selection) => {
      selection.select('rect')
      .attr('x', mouseX)
      .attr('y', mouseY)
    },
    exit: (props, selection) => {
      selection.remove()
    },
  };
}
