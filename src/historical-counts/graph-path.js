// Render the svg path representing the graph's data.
export default function graphPath(
  selection,
  graphWidth, graphHeight, yScale,
  data
) {
  // Generate the svg path for the graph line.
  const pathPrefix = `M1,${graphHeight}` +
    `L1,${yScale(initialCount)}` +
    `H${xScale(normalize(dataStart))}`;
  const pathSuffix = `H${lastX}V${graphHeight}H1`;

  // Build the path by looping through the data.
  // For each point, move horizontally then vertically to the coordinate.
  const linePath = data.reduce((total, i) => {
    const xPosition = xScale(normalize(i.timestamp));
    const yPosition = yScale(i.count);
    if (xPosition >= 0) {
      return `${total}H${xPosition}V${yPosition}`;
    } else {
      return total;
    }
  }, '');

  // Render the calculated svg path to the dom via a data join.
  const graphSelection = selection
    .selectAll('.graph-path')
    .data([data]);

  // On enter, create two new paths: one to be used to create an outline and one to be used to fill
  // the contents 
  const graphEnterSelection = graphSelection.enter();
  graphEnterSelection
    .append('path')
    .attr('class', 'graph-path')
  graphEnterSelection
    .append('path')
    .attr('class', 'graph-path-outline')

  const graphMergeSelection = graphEnterSelection.merge(graphSelection);
    graphMergeSelection.select('.graph-path')
      .attr('d', d => pathPrefix + linePath + pathSuffix);
    graphMergeSelection.select('.graph-path-outline')
      .attr('d', d => pathPrefix + linePath);

  graphSelection.exit();
}
