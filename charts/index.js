import * as React from 'react';

export function chartAsReactComponent(chart) {
  return class extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return <div ref={ref => {
        if (ref !== null) {
          chart(ref, this.props);
        }
      }} />;
    }
  }
}
