import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';

import lineChart, {
  xAxisDailyTick,
  yAxisMinMax,
  dataWaterline,
} from './index';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

const LineChart = chartAsReactComponent(lineChart);

storiesOf('Line Chart', module)
  .add('With no name', () => (
    <LineChart
      timeZone="UTC"

      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 40,
      })}

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [
          {value: 20, hasRule: true},
          {value: 10, hasRule: false},
        ],
      })}
      yAxisEnd={40}
      yAxisStart={0}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          data: [
            {value: 18, timestamp: '2018-04-16T14:00:00.000Z'},
            {value: 7, timestamp: '2018-04-16T20:00:00.000Z'},
            {value: 8, timestamp: '2018-04-16T21:00:00.000Z'},
            {value: 10, timestamp: '2018-04-16T23:00:00.000Z'},
          ],
        },
        // {
        //   name: 'secondary',
        //   type: dataWaterline,
        //   color: 'rgba(255, 0, 0, 0.2)',
        //   borderColor: 'red',
        //   data: [
        //     {value: 18, timestamp: '2018-04-16T14:00:00.000Z'},
        //     {value: 7, timestamp: '2018-04-16T20:00:00.000Z'},
        //     {value: 20, timestamp: '2018-04-16T21:00:00.000Z'},
        //     {value: 20, timestamp: '2018-04-16T23:00:00.000Z'},
        //   ],
        // },
      ]}
    />
  ))
