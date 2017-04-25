import * as React from 'react';
import moment from 'moment';
import {storiesOf, action} from '@kadira/storybook';

import drift from './';
import {chartAsReactComponent} from '../';

const DriftChart = chartAsReactComponent(drift);

storiesOf('Drift Chart', module)
  .add('With moments for days', () => (
    <DriftChart
      data={[
        {date: moment().add(0, 'day'), drift: 1, count: 100},
        {date: moment().add(1, 'day'), drift: 2, count: 123},
        {date: moment().add(2, 'day'), drift: -3, count: 123},
        {date: moment().add(3, 'day'), drift: 2, count: 123},
        {date: moment().add(4, 'day'), drift: 5, count: 123},
        {date: moment().add(5, 'day'), drift: -1, count: 123},
        {date: moment().add(6, 'day'), drift: -8, count: 123},
      ]} 
    />
  ))
  .add('With numbers for days', () => (
    <DriftChart
      data={[
        {date: 0, count: -8},
        {date: 1, count: 1},
        {date: 2, count: 2},
        {date: 3, count: -3},
        {date: 4, count: 2},
        {date: 5, count: 5},
        {date: 6, count: -1},
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
                count: Math.floor(Math.random() * 20) - 10,
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
