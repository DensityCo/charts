"use strict";
const React = require('react');
const createClass = require('create-react-class');

function chartAsReactComponent(chart) {
  return createClass({
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

module.exports = {chartAsReactComponent: chartAsReactComponent};
