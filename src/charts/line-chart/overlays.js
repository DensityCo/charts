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

  topOverlayWidth,
  topOverlayHeight,
  bottomOverlayWidth,
  bottomOverlayHeight,
}) {
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
        dataPoints,
      } = data;
      const xInMs = xScale.invert(mouseX);

      // Ensure that the overlay is only being drawn when the user is hovering over the data
      if (dataPoints.firstEventXValue < xInMs && xInMs > dataPoints.lastEventXValue) {
        selection.remove();
        return
      }

      // Figure out the event at the user's current mouse position
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

// Can be passed to the `formatter` prop of the `overlayTwoPopups` overlay.
// Renders the value as plain text, optionally running it through a mapping function first.
export function overlayTwoPopupsPlainTextFormatter(mapping) {
  return {
    enter: selection => {
      selection.append('text')
        .attr('text-anchor', 'middle')
        .attr('font-weight', '500')
    },
    merge: (data, selection) => {
      const {item, xScale, mouseX, topOverlayWidth} = data;
      selection.select('text')
        .attr('transform', `translate(${data.bottomOverlayWidth / 2},26)`)
        .text(mapping ? mapping(item, data) : item.value);
    },
    exit: selection => selection.remove(),
  }
}

// Can be passed to the `formatter` prop of the `overlayTwoPopups` overlay.
// Renders the value as plain text, but with a person icon to the left of the plain text, optionally
// running it through a mapping function first.
export function overlayTwoPopupsPersonIconTextFormatter(mapping) {
  return {
    enter: selection => {
      selection.append('text')
        .attr('text-anchor', 'left')
        .attr('font-weight', '500')
        .attr('transform', `translate(42,27)`)

      // Created via https://rawgit.com/jColeChanged/svg2d3js/master/index.html
      const qv7a5d925c094c53a70 = selection.append('g')
        .attr('stroke', 'none')
        .attr('stroke-width', '1')
        .attr('fill', 'none')
        .attr('fill-rule', 'evenodd')
        .attr('stroke-linejoin', 'round')
        .attr('transform', 'translate(15,10)')
      const qvf0621598a7e8cb863 = qv7a5d925c094c53a70.append('g')
        .attr('transform', 'translate(-775.000000, -397.000000)')
        .attr('stroke', '#4198FF')
        .attr('stroke-width', '1.5')
      const qvd28faf862aaae21da = qvf0621598a7e8cb863.append('g')
        .attr('transform', 'translate(170.000000, 159.000000)');
      const qvf4650fd1e11506470 = qvd28faf862aaae21da.append('g')
        .attr('transform', 'translate(591.000000, 227.000000)');
      const qv1fd943a9889237046 = qvf4650fd1e11506470.append('g')
        .attr('transform', 'translate(15.000000, 12.000000)');
      const qv6fd596351c7e83872 = qv1fd943a9889237046.append('path')
        .attr('d', 'M9.42856667,4 C9.42856667,6.20911111 7.89356667,8 6.00001111,8 C4.10645556,8 2.57145556,6.20911111 2.57145556,4 C2.57145556,1.79088889 4.10645556,0 6.00001111,0 C7.89356667,0 9.42856667,1.79088889 9.42856667,4 L9.42856667,4 Z');
      const qv79a38c2da85ee301f = qv1fd943a9889237046.append('path')
        .attr('d', 'M12,16 L12,11 C12,9.33688889 10.6392222,8 8.97611111,8 L3.02388889,8 C1.36077778,8 0,9.33688889 0,11 L0,16 L12,16 L12,16 Z');
      const qvd5bb95460496d63c4 = qv1fd943a9889237046.append('path')
        .attr('d', 'M3,12 L3,16');
      const qv3ba41bdbddbf151c1 = qv1fd943a9889237046.append('path')
        .attr('d', 'M9,12 L9,16');
    },
    merge: (data, selection) => {
      const {item, xScale, mouseX, topOverlayWidth} = data;
      selection.select('text')
        .text(mapping ? mapping(item, data) : item.value);
    },
    exit: selection => selection.remove(),
  }
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
