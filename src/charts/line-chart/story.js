import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';

import lineChart from './index';

const LineChart = chartAsReactComponent(lineChart);

storiesOf('Line Chart', module)
  .add('With no name', () => (
    <LineChart
      timeZone="America/New_York"
      data={[
        {value: 5, timestamp: '2018-04-16T14:00:00.000Z'},
        {value: 6, timestamp: '2018-04-16T20:00:00.000Z'},
        {value: 10, timestamp: '2018-04-16T23:00:00.000Z'},
      ]}
    />
  ))
