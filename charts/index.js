"use strict";
const React = require('react');

function chartAsReactComponent(chart) {
  return React.createClass({
    render: function () {
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
  });
}

module.exports = {chartAsReactComponent};
