import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';

import dailyMetrics from './index';

const DailyMetrics = chartAsReactComponent(dailyMetrics);

storiesOf('Daily Metrics', module)
  .add('Simple Example', () => (
    <DailyMetrics width={800} height={300} data={[
      {label: "6/15", value: 50},
      {label: "6/16", value: 5},
      {label: "6/17", value: 1},
      {label: "6/18", value: 1},
      {label: "6/19", value: 1},
      {label: "6/20", value: 1},
      {label: "6/21", value: 50},
      {label: "6/22", value: 5},
      {label: "6/23", value: 1},
      {label: "6/24", value: 1},
      {label: "6/25", value: 1},
      {label: "6/26", value: 1},
      {label: "6/27", value: 1},
      {label: "6/28", value: 1},
    ]}/>
  ))
  .add('Live updating', () => {
    class Wrapper extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          data: [
            {label: "foo", value: 50},
          ],
          interval: setInterval(() => {
            this.setState({data: [...this.state.data, {
              label: Math.random().toString().slice(3, 7),
              value: Math.floor(Math.random() * 50),
            }]})
          }, 1000),
        };
      }
      componentWillUnmount() {
        clearInterval(this.state.interval);
      }
      render() {
        return <DailyMetrics width={800} height={300} data={this.state.data} />
      }
    }

    return <Wrapper />;
  })
