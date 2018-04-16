import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';

import lineChart from './index';

const LineChart = chartAsReactComponent(lineChart);

storiesOf('Line Chart', module)
  .add('With no name', () => (
    <LineChart />
  ))
  .add('With name', () => (
    <LineChart name="Bob" />
  ))
