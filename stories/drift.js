import * as React from 'react';
import moment from 'moment';
import {storiesOf, action} from '@kadira/storybook';

import drift from '../charts/drift';
import {chartAsReactComponent} from '../charts';

const DriftChart = chartAsReactComponent(drift);

storiesOf('Drift Chart', module)
  .add('With moments for days', () => (
    <DriftChart
      drifts={[
        {date: moment().add(0, 'day'), count: 1},
        {date: moment().add(1, 'day'), count: 2},
        {date: moment().add(2, 'day'), count: -3},
        {date: moment().add(3, 'day'), count: 2},
        {date: moment().add(4, 'day'), count: 5},
        {date: moment().add(5, 'day'), count: -1},
        {date: moment().add(6, 'day'), count: -8},
      ]} 
    />
  ))
  .add('With numbers for days', () => (
    <DriftChart
      drifts={[
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
