"use strict";
const React = require('react');

function chartAsReactComponent(chart) {
  return class extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return React.createElement('div', {
        ref: ref => {
          if (ref !== null) {
            if (!this.updateChart) {
              this.updateChart = chart(ref);
            }
            this.updateChart(this.props);
          }
        }
      });
    }
  }
}

module.exports = {chartAsReactComponent};
