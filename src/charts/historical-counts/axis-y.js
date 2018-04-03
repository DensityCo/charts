const axisYMaximumLineDashWidth = 2;
const axisYMaximumLineDashSpacing = 10;

export default function yAxis(
  selection,
  scale, graphWidth,
  smallestCount, largestCount, capacity,
  yAxisLabelFormatter
) {
  // Create a selection to create or update the axis.
  const yAxisSelection = selection.selectAll('.axis-y').data([
    // We want the axis to redraw if any of the below values change.
    `${capacity} ${largestCount} ${smallestCount}`,
  ]);

  // When a new axis is to be created, create a container with each label as required.
  const yAxisEnterSelection = yAxisSelection.enter();
  const yAxisEnterSelectionGroup = yAxisEnterSelection.append('g')
    .attr("class", "historical-counts-axis-y")

  // Lebel the smallest value.
  yAxisEnterSelectionGroup.append('text')
    .attr('class', 'axis-y-minimum')
    .attr('y', scale(smallestCount))
    .text(yAxisLabelFormatter(smallestCount, 0));

  // Label the capacity, if a capacity was passed.
  if (capacity) {
    yAxisEnterSelectionGroup.append('text')
      .attr('class', 'axis-y-capacity')
      .attr('y', scale(capacity))
      .text(yAxisLabelFormatter(capacity, -1));
  }

  // Label the largest value.
  yAxisEnterSelectionGroup.append('text')
    .attr('class', 'axis-y-maximum')
    .attr('y', scale(largestCount))
    .text(yAxisLabelFormatter(largestCount, 1));

  // Add a dotted line horizontally at the maximum position
  yAxisEnterSelectionGroup.append('path')
    .attr('y', scale(largestCount))
    .attr('class', 'axis-y-maximum-line')

  // When updating the axis, adjust the contents of each of the above labels as well as their
  // position along the axis.
  const yAxisMergeSelection = yAxisEnterSelection.merge(yAxisSelection);

  yAxisMergeSelection.select('axis-y-minimum')
    .attr('y', scale(smallestCount))
    .text(yAxisLabelFormatter(smallestCount, 0));

  yAxisMergeSelection.select('axis-y-capacity')
    .attr('y', scale(capacity))
    .text(yAxisLabelFormatter(capacity, -1));

  yAxisMergeSelection.select('axis-y-maximum')
    .attr('y', scale(largestCount))
    .text(yAxisLabelFormatter(largestCount, 1));

  // Render a dotted line at the top-most item in the y axis.
  const maximumLineYPos = scale(largestCount) - 2;
  yAxisMergeSelection.select('.axis-y-maximum-line')
    .attr('d', `M0,${maximumLineYPos} ${(function(graphWidth) {
      let linePath = '';
      for (let i = 0; i < graphWidth; i += axisYMaximumLineDashWidth + axisYMaximumLineDashSpacing) {
        linePath += `H${i+axisYMaximumLineDashWidth} M${i+axisYMaximumLineDashWidth+axisYMaximumLineDashSpacing},${maximumLineYPos}`;
      }
      return linePath;
    })(graphWidth)}`)
}
