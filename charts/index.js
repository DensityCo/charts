"use strict";
const React = require('react');

function chartAsReactComponent(chart) {
  return React.createClass({
    render: function () {
      const cmp = this;
      return React.createElement('div', {
        ref: function(ref) {
          if (ref !== null) {
            if (!cmp.updateChart) {
              cmp.updateChart = chart(ref);
            }
            cmp.updateChart(cmp.props);
          }
        }
      });
    }
  });
}

module.exports = {chartAsReactComponent};
