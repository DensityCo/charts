import React from 'react';
import moment from 'moment';
import {storiesOf} from '@storybook/react';

import drift from './index';
import {chartAsReactComponent} from '../';

const DriftChart = chartAsReactComponent(drift);

storiesOf('Drift Chart', module)
  .add('With moments for days', () => (
    <DriftChart
      data={[
        {date: moment().add(0, 'day'), drift: 1, eventCount: 100},
        {date: moment().add(1, 'day'), drift: 2, eventCount: 123},
        {date: moment().add(2, 'day'), drift: -3, eventCount: 123},
        {date: moment().add(3, 'day'), drift: 2, eventCount: 123},
        {date: moment().add(4, 'day'), drift: 5, eventCount: 123},
        {date: moment().add(5, 'day'), drift: 0, eventCount: 123},
        {date: moment().add(6, 'day'), drift: -8, eventCount: 123},
      ]} 
    />
  ))
  .add('With numbers for days', () => (
    <DriftChart
      data={[
        {date: 0, drift: 1, eventCount: 100},
        {date: 1, drift: 2, eventCount: 123},
        {date: 2, drift: -3, eventCount: 123},
        {date: 3, drift: 2, eventCount: 123},
        {date: 4, drift: 5, eventCount: 123},
        {date: 5, drift: 0, eventCount: 123},
        {date: 6, drift: -8, eventCount: 123},
      ]} 
    />
  ))





  .add(`With adding points to the chart over time. This is to show that the chart can receive updates.`, () => {
    class AddNewPointsToGraph extends React.Component {
      constructor(props) {
        super(props);
        this.state = {data: []}
      }
      componentDidMount() {
        this.interval = setInterval(() => {
          this.setState({
            data: (new Array(7))
              .fill(0)
              .map((_, ct) => ({
                date: ct,
                drift: Math.floor(Math.random() * 20) - 10,
                eventCount: 100,
              }))
          });
        }, 1000);
      }
      componentWillUnmount() {
        clearInterval(this.interval);
      }
      render() {
        console.log('update', this.state.data);
        return <DriftChart data={this.state.data} />;
      }
    }

    return <AddNewPointsToGraph />;
  })
