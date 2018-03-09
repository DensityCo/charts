import * as React from 'react';
import {storiesOf, action} from '@storybook/react';
import {chartAsReactComponent} from '../index';
import moment from 'moment';

import ingressEgress from './index';

const IngressEgress = chartAsReactComponent(ingressEgress);

function generateRandomMillisecondPosition() {
  const time = Math.floor(Math.random() * 50000) + 10000;
  return moment.utc().subtract(time, 'milliseconds');
}

function generateRandomCountChangeEvents() {
  const acc = [];
  for (let i = 0; i < Math.floor(Math.random() * 32); i++) {
    acc.push({
      countChange: Math.random() > 0.5 ? 1 : -1, // Pick a random direction
      timestamp: generateRandomMillisecondPosition(), // and timestamp
    });
  }

  const data = acc.sort((a, b) => a.timestamp - b.timestamp);
  action('data')(data);
  return data;
}

storiesOf('Real Time Count', module)
  .add('With a few set datapoints', () => (
    <IngressEgress
      events={[
        {countChange: 1, timestamp: moment.utc()},
        {countChange: 1, timestamp: moment.utc().subtract(6000, 'milliseconds')},
        {countChange: 1, timestamp: moment.utc().subtract(12000, 'milliseconds') },
        {countChange: 1, timestamp: moment.utc().subtract(40000, 'milliseconds') },
        {countChange: -1, timestamp: moment.utc().subtract(42000, 'milliseconds') },
      ]}
    />
  ))
  .add('With a few set datapoints that should stack', () => (
    <IngressEgress
      events={[
        {countChange: 1, timestamp: new Date().getTime() - 50000},
        {countChange: 1, timestamp: new Date().getTime() -  43402 },
        {countChange: 1, timestamp: new Date().getTime() -  43401 },
        {countChange: 1, timestamp: new Date().getTime() -  42001 },
        {countChange: 1, timestamp: new Date().getTime() - 42000 },
        {countChange: 1, timestamp: new Date().getTime() - 30000 },
        {countChange: -1, timestamp: new Date().getTime() - 20000 },
        {countChange: -1, timestamp: new Date().getTime() - 20500 },
      ]}
    />
  ))
  .add('With a custom viewbox that renders the chart larger', () => (
    <IngressEgress
      events={[
        {countChange: 1, timestamp: new Date().getTime() - 50000},
        {countChange: 1, timestamp: new Date().getTime() -  43402 },
        {countChange: 1, timestamp: new Date().getTime() -  43401 },
        {countChange: 1, timestamp: new Date().getTime() -  42001 },
        {countChange: 1, timestamp: new Date().getTime() - 42000 },
        {countChange: 1, timestamp: new Date().getTime() - 30000 },
        {countChange: -1, timestamp: new Date().getTime() - 20000 },
        {countChange: -1, timestamp: new Date().getTime() - 20500 },
      ]}
      eventMarkerRadius={5}
      eventMarkerSpacingFromMidLine={10}
      eventMarkerInfoPopupHeight={30}
      eventMarkerInfoPopupWidth={30}
      eventMarkerInfoPopupSpacingFromMarker={15}
      eventMarkerInfoPopupCaretWidth={10}
      eventMarkerInfoPopupFontSize={20}
    />
  ))
  .add('With a bunch of random data', () => (
    <IngressEgress events={generateRandomCountChangeEvents()} />
  ))
  .add('With a shorter duration (ie, 1 min)', () => (
    <IngressEgress
      events={[
        {countChange: -1, timestamp: new Date().getTime() - 5000},
        {countChange: 1, timestamp: new Date().getTime() - 10000},
        {countChange: -1, timestamp: new Date().getTime() - 7500 },
        {countChange: 1, timestamp: new Date().getTime() -  50000 },
      ]}
      graphDurationInMin={1}
    />
  ))
  .add('Live updates', () => {
    class Wrapper extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          data: [
            {countChange: -1, timestamp: moment.utc()},
          ],
          interval: setInterval(function() {
            this.setState({
              data: [...this.state.data, {
                countChange: Math.random() > 0.5 ? 1 : -1, // Pick a random direction
                timestamp: (new Date()).getTime(),
              }],
            });
          }.bind(this), 1000),
        };
      }
      componentWillUnmount() {
        clearInterval(this.state.interval);
      }
      render() {
        return <div>
          <IngressEgress events={this.state.data} />
          <button onClick={() => this.forceUpdate()}>Update</button>
        </div>
      }
    }
    return <Wrapper />;
  })
