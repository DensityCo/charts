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

function chartAsReactComponentAutoUpdate(chart) {
  return class extends React.Component {
    componentDidMount() {
      const animate = frame => {
        if (window.requestAnimationFrame) {
          return window.requestAnimationFrame(frame);
        } else {
          return setInterval(frame, 1000 / 30); // 30 FPS
        }
      };

      this.animationFrame = animate(() => {
        if (this.updateChart) {
          this.updateChart(this.props);
        }
      });
    }
    componentWillUnmount() {
      const unanimate = window.cancelAnimationFrame || window.clearInterval;
      unanimate(this.animationFrame);
    }
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

module.exports = {chartAsReactComponent, chartAsReactComponentAutoUpdate};
