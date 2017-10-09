import * as d3 from 'd3';

import './styles.scss';

export default function linearProgress(elem, props={}) {
  elem = d3.select(elem)
    .attr('class', 'linear-progress-chart');

  const svg = elem.append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  const progressContainer = svg.append('rect')
    .attr('class', 'progress-container')
    .attr('height', '100%')
    .attr('width', '100%');

  const progressBar = svg.append('rect')
    .attr('class', 'progress-bar')
    .attr('height', '100%')
    .attr('width', '0%');

  return props => {
    const percentFull = props.percentFull || 0;
    const transitionDuration = props.transitionDuration || 300;

    progressBar.transition()
      .duration(transitionDuration)
      .attr('width', `${percentFull}%`);
  }
}
