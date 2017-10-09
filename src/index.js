"use strict";
import * as React from 'react';

function chartAsReactComponent(chart) {
  return class extends React.Component {
    render() {
      return <div ref={ref => {
        if (ref !== null) {
          if (!this.updateChart) {
            this.updateChart = chart(ref);
          }
          this.updateChart(this.props);
        }
      }} />;
    }
  }
}

module.exports = {chartAsReactComponent};
