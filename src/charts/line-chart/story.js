import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';
import moment from 'moment';

import lineChart, { dataWaterline } from './index';
import { xAxisDailyTick, yAxisMinMax, exampleAxis } from './axes';
import {
  overlayTwoPopups,
  overlayExample,

  overlayTwoPopupsPlainTextFormatter,
    overlayTwoPopupsPersonIconTextFormatter,
} from './overlays';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

const LineChart = chartAsReactComponent(lineChart);

// Since this data is so large, it's been serialized below in the format:
// "count,timestamp;count,timestamp;..."
// This function converts that format into:
// [{count: 1, timestamp: "timestamp"}, ...]
function uncompressData(data) {
  return data.split(';').map(i => {
    const [value, timestamp] = i.split(',');
    return {value: parseInt(value), timestamp};
  });
}

storiesOf('Line Chart', module)
  .add('Small amount of artificial data, no overlay. Simplest possible chart use case.', () => (
    <LineChart
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({})}
      yAxis={yAxisMinMax({})}
      data={[
        {
          type: dataWaterline,
          data: [
            {value: 40, timestamp: '2018-04-16T14:00:00.000Z'},
            {value: 7, timestamp: '2018-04-16T20:00:00.000Z'},
            {value: 8, timestamp: '2018-04-16T21:00:00.000Z'},
            {value: 10, timestamp: '2018-04-16T23:00:00.000Z'},
          ],
        },
      ]}
    />
  ))
  .add('Y axis rule at 50 (with dotted rule) and label at 20', () => (
    <LineChart
      timeZone="UTC"
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 15,
      })}

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [
          {value: 50, hasRule: true},
          {value: 20, hasRule: false},
        ],
      })}
      yAxisEnd={40}
      yAxisStart={0}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          // topPopupFormatter: overlayTwoPopupsPlainTextFormatter(item => `${item.value}`),
          topPopupFormatter: overlayTwoPopupsPersonIconTextFormatter(item => `${item.value}`),
          bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
            (item, {mouseX, xScale}) => {
              const timestamp = moment.utc(xScale.invert(mouseX));
              const time = timestamp.format(`h:mma`).slice(0, -1);
              const date = timestamp.format(`ddd MMM Do`);
              return `${time} ${date}`;
            }
          ),

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 80,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
        // overlayExample({color: 'red'}),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          verticalBaselineOffset: 0,
          data: [
            {value: 40, timestamp: '2018-04-16T14:00:00.000Z'},
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
  .add('24 hour chart', () => (
    <LineChart
      timeZone="America/New_York"
      svgWidth={1000}
      svgHeight={300}

      xAxisStart="2018-04-11T00:00:00-04:00"
      xAxisEnd="2018-04-11T23:59:59-04:00"
      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 15,
      })}

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [
          {value: 4, hasRule: false},
          {value: 4, hasShadow: true},
        ],
        showMaximumPoint: false,
      })}
      yAxisEnd={5}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          topPopupFormatter: overlayTwoPopupsPersonIconTextFormatter(item => `${item.value}`),
          bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
            (item, {mouseX, xScale}) => {
              const timestamp = moment.utc(xScale.invert(mouseX)).tz('America/New_York');
              const time = timestamp.format(`h:mma`).slice(0, -1);
              const date = timestamp.format(`ddd MMM Do`);
              return `${time} ${date}`;
            }
          ),

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 80,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          verticalBaselineOffset: 10,
          data: [
            { timestamp: '2018-04-12T03:55:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:50:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:45:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:40:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:35:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:30:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:25:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:20:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:15:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:10:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:05:00.000Z', value: 0 },
            { timestamp: '2018-04-12T03:00:00.000Z', value: 0 },
            { timestamp: '2018-04-12T02:55:00.000Z', value: 0 },
            { timestamp: '2018-04-12T02:50:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:45:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:40:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:35:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:30:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:25:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:20:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:15:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:10:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:05:00.000Z', value: 1 },
            { timestamp: '2018-04-12T02:00:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:55:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:50:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:45:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:40:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:35:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:30:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:25:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:20:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:15:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:10:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:05:00.000Z', value: 1 },
            { timestamp: '2018-04-12T01:00:00.000Z', value: 1 },
            { timestamp: '2018-04-12T00:55:00.000Z', value: 1 },
            { timestamp: '2018-04-12T00:50:00.000Z', value: 1 },
            { timestamp: '2018-04-12T00:45:00.000Z', value: 1 },
            { timestamp: '2018-04-12T00:40:00.000Z', value: 1 },
            { timestamp: '2018-04-12T00:35:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:30:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:25:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:20:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:15:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:10:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:05:00.000Z', value: 2 },
            { timestamp: '2018-04-12T00:00:00.000Z', value: 2 },
            { timestamp: '2018-04-11T23:55:00.000Z', value: 2 },
            { timestamp: '2018-04-11T23:50:00.000Z', value: 2 },
            { timestamp: '2018-04-11T23:45:00.000Z', value: 2 },
            { timestamp: '2018-04-11T23:40:00.000Z', value: 2 },
            { timestamp: '2018-04-11T23:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:10:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T23:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T22:10:00.000Z', value: 4 },
            { timestamp: '2018-04-11T22:05:00.000Z', value: 2 },
            { timestamp: '2018-04-11T22:00:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:55:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:50:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:45:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:40:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:35:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:30:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:25:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:20:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:15:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:10:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:05:00.000Z', value: 3 },
            { timestamp: '2018-04-11T21:00:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:55:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:50:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:45:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:40:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:35:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:30:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:25:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:20:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:15:00.000Z', value: 2 },
            { timestamp: '2018-04-11T20:10:00.000Z', value: 2 },
            { timestamp: '2018-04-11T20:05:00.000Z', value: 3 },
            { timestamp: '2018-04-11T20:00:00.000Z', value: 4 },
            { timestamp: '2018-04-11T19:55:00.000Z', value: 4 },
            { timestamp: '2018-04-11T19:50:00.000Z', value: 3 },
            { timestamp: '2018-04-11T19:45:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:40:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:35:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:30:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:25:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:20:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:15:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:10:00.000Z', value: 2 },
            { timestamp: '2018-04-11T19:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T19:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T18:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T18:50:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:45:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:40:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:35:00.000Z', value: 3 },
            { timestamp: '2018-04-11T18:30:00.000Z', value: 3 },
            { timestamp: '2018-04-11T18:25:00.000Z', value: 3 },
            { timestamp: '2018-04-11T18:20:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:15:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:10:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:05:00.000Z', value: 2 },
            { timestamp: '2018-04-11T18:00:00.000Z', value: 3 },
            { timestamp: '2018-04-11T17:55:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:50:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:45:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:40:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:35:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:30:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:25:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:20:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:15:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:10:00.000Z', value: 4 },
            { timestamp: '2018-04-11T17:05:00.000Z', value: 3 },
            { timestamp: '2018-04-11T17:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T16:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T16:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T16:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T16:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T16:35:00.000Z', value: 2 },
            { timestamp: '2018-04-11T16:30:00.000Z', value: 2 },
            { timestamp: '2018-04-11T16:25:00.000Z', value: 3 },
            { timestamp: '2018-04-11T16:20:00.000Z', value: 4 },
            { timestamp: '2018-04-11T16:15:00.000Z', value: 4 },
            { timestamp: '2018-04-11T16:10:00.000Z', value: 4 },
            { timestamp: '2018-04-11T16:05:00.000Z', value: 4 },
            { timestamp: '2018-04-11T16:00:00.000Z', value: 4 },
            { timestamp: '2018-04-11T15:55:00.000Z', value: 4 },
            { timestamp: '2018-04-11T15:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T15:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T15:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T15:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T15:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T15:25:00.000Z', value: 2 },
            { timestamp: '2018-04-11T15:20:00.000Z', value: 3 },
            { timestamp: '2018-04-11T15:15:00.000Z', value: 3 },
            { timestamp: '2018-04-11T15:10:00.000Z', value: 3 },
            { timestamp: '2018-04-11T15:05:00.000Z', value: 2 },
            { timestamp: '2018-04-11T15:00:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:55:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:50:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:45:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:40:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:35:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:30:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:25:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:20:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:15:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:10:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:05:00.000Z', value: 2 },
            { timestamp: '2018-04-11T14:00:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:55:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:50:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:45:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:40:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:35:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:30:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:25:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:20:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:15:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:10:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:05:00.000Z', value: 2 },
            { timestamp: '2018-04-11T13:00:00.000Z', value: 2 },
            { timestamp: '2018-04-11T12:55:00.000Z', value: 2 },
            { timestamp: '2018-04-11T12:50:00.000Z', value: 2 },
            { timestamp: '2018-04-11T12:45:00.000Z', value: 2 },
            { timestamp: '2018-04-11T12:40:00.000Z', value: 2 },
            { timestamp: '2018-04-11T12:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T12:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T12:25:00.000Z', value: 0 },
            { timestamp: '2018-04-11T12:20:00.000Z', value: 0 },
            { timestamp: '2018-04-11T12:15:00.000Z', value: 0 },
            { timestamp: '2018-04-11T12:10:00.000Z', value: 0 },
            { timestamp: '2018-04-11T12:05:00.000Z', value: 0 },
            { timestamp: '2018-04-11T12:00:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:55:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:50:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:45:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:40:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:35:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:30:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:25:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:20:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:15:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:10:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:05:00.000Z', value: 0 },
            { timestamp: '2018-04-11T11:00:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:55:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:50:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:45:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:40:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:35:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:30:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:25:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:20:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:15:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:10:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:05:00.000Z', value: 0 },
            { timestamp: '2018-04-11T10:00:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:55:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:50:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:45:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:40:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:35:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:30:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:25:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:20:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:15:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:10:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:05:00.000Z', value: 0 },
            { timestamp: '2018-04-11T09:00:00.000Z', value: 0 },
            { timestamp: '2018-04-11T08:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:10:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T08:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:10:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T07:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:10:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T06:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:10:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T05:00:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:55:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:50:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:45:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:40:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:35:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:30:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:25:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:20:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:15:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:10:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:05:00.000Z', value: 1 },
            { timestamp: '2018-04-11T04:00:00.000Z', value: 1 }
          ].sort((a, b) => moment.utc(a.timestamp).valueOf() - moment.utc(b.timestamp).valueOf()),
        },
      ]}
    />
  ))
  .add('Utilization Chart', () => (
    <LineChart
      timeZone="America/New_York"
      svgWidth={1000}
      svgHeight={300}

      xAxisStart="2018-04-11T00:00:00-04:00"
      xAxisEnd="2018-04-11T23:59:59-04:00"
      xAxis={xAxisDailyTick({})}

      yAxis={yAxisMinMax({
        leftOffset: 20,
        points: [
          {value: 100, hasRule: true},
          // {value: 0, hasRule: false},
        ],
        showMaximumPoint: false,
        // showMinimumPoint: false,
      })}
      yAxisStart={0}
      yAxisEnd={100}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          topPopupFormatter: overlayTwoPopupsPlainTextFormatter(item => `Utilization: ${Math.round(item.value)}%`, 'top'),
          bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
            (item, {mouseX, xScale}) => {
              const timestamp = moment.utc(xScale.invert(mouseX)).tz('America/New_York');
              const time = timestamp.format(`h:mma`).slice(0, -1);
              return `Avg. Weekday at ${time}`;
            }
          ),

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 150,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          verticalBaselineOffset: 10,
          data: [
            { timestamp: "2018-04-11T00:10:26Z", value: 5 },
            { timestamp: "2018-04-11T00:20:52Z", value: 5 },
            { timestamp: "2018-04-11T00:31:18Z", value: 5 },
            { timestamp: "2018-04-11T00:41:44Z", value: 5 },
            { timestamp: "2018-04-11T00:52:10Z", value: 5 },
            { timestamp: "2018-04-11T01:02:36Z", value: 5 },
            { timestamp: "2018-04-11T01:13:02Z", value: 5 },
            { timestamp: "2018-04-11T01:23:28Z", value: 5 },
            { timestamp: "2018-04-11T01:33:54Z", value: 5 },
            { timestamp: "2018-04-11T01:44:20Z", value: 5 },
            { timestamp: "2018-04-11T01:54:46Z", value: 5 },
            { timestamp: "2018-04-11T02:05:13Z", value: 5 },
            { timestamp: "2018-04-11T02:15:39Z", value: 5 },
            { timestamp: "2018-04-11T02:26:05Z", value: 5 },
            { timestamp: "2018-04-11T02:36:31Z", value: 5 },
            { timestamp: "2018-04-11T02:46:57Z", value: 5 },
            { timestamp: "2018-04-11T02:57:23Z", value: 5 },
            { timestamp: "2018-04-11T03:07:49Z", value: 5 },
            { timestamp: "2018-04-11T03:18:15Z", value: 5 },
            { timestamp: "2018-04-11T03:28:41Z", value: 5 },
            { timestamp: "2018-04-11T03:39:07Z", value: 5 },
            { timestamp: "2018-04-11T03:49:33Z", value: 5 },
            { timestamp: "2018-04-11T03:59:59Z", value: 5 },
            { timestamp: "2018-04-11T04:10:26Z", value: 5 },
            { timestamp: "2018-04-11T04:20:52Z", value: 0 },
            { timestamp: "2018-04-11T04:31:18Z", value: 0 },
            { timestamp: "2018-04-11T04:41:44Z", value: 0 },
            { timestamp: "2018-04-11T04:52:10Z", value: 0 },
            { timestamp: "2018-04-11T05:02:36Z", value: 0 },
            { timestamp: "2018-04-11T05:13:02Z", value: 0 },
            { timestamp: "2018-04-11T05:23:28Z", value: 0 },
            { timestamp: "2018-04-11T05:33:54Z", value: 0 },
            { timestamp: "2018-04-11T05:44:20Z", value: 0 },
            { timestamp: "2018-04-11T05:54:46Z", value: 0 },
            { timestamp: "2018-04-11T06:05:13Z", value: 0 },
            { timestamp: "2018-04-11T06:15:39Z", value: 0 },
            { timestamp: "2018-04-11T06:26:05Z", value: 0 },
            { timestamp: "2018-04-11T06:36:31Z", value: 0 },
            { timestamp: "2018-04-11T06:46:57Z", value: 0 },
            { timestamp: "2018-04-11T06:57:23Z", value: 0 },
            { timestamp: "2018-04-11T07:07:49Z", value: 0 },
            { timestamp: "2018-04-11T07:18:15Z", value: 0 },
            { timestamp: "2018-04-11T07:28:41Z", value: 0 },
            { timestamp: "2018-04-11T07:39:07Z", value: 0 },
            { timestamp: "2018-04-11T07:49:33Z", value: 0 },
            { timestamp: "2018-04-11T07:59:59Z", value: 2.5 },
            { timestamp: "2018-04-11T08:10:26Z", value: 5 },
            { timestamp: "2018-04-11T08:20:52Z", value: 7.5 },
            { timestamp: "2018-04-11T08:31:18Z", value: 7.5 },
            { timestamp: "2018-04-11T08:41:44Z", value: 10 },
            { timestamp: "2018-04-11T08:52:10Z", value: 7.5 },
            { timestamp: "2018-04-11T09:02:36Z", value: 10 },
            { timestamp: "2018-04-11T09:13:02Z", value: 12.5 },
            { timestamp: "2018-04-11T09:23:28Z", value: 12.5 },
            { timestamp: "2018-04-11T09:33:54Z", value: 12.5 },
            { timestamp: "2018-04-11T09:44:20Z", value: 17.5 },
            { timestamp: "2018-04-11T09:54:46Z", value: 20 },
            { timestamp: "2018-04-11T10:05:12Z", value: 20 },
            { timestamp: "2018-04-11T10:15:39Z", value: 17.5 },
            { timestamp: "2018-04-11T10:26:05Z", value: 12.5 },
            { timestamp: "2018-04-11T10:36:31Z", value: 17.5 },
            { timestamp: "2018-04-11T10:46:57Z", value: 20 },
            { timestamp: "2018-04-11T10:57:23Z", value: 20 },
            { timestamp: "2018-04-11T11:07:49Z", value: 15 },
            { timestamp: "2018-04-11T11:18:15Z", value: 17.5 },
            { timestamp: "2018-04-11T11:28:41Z", value: 17.5 },
            { timestamp: "2018-04-11T11:39:07Z", value: 22.5 },
            { timestamp: "2018-04-11T11:49:33Z", value: 25 },
            { timestamp: "2018-04-11T11:59:59Z", value: 20 },
            { timestamp: "2018-04-11T12:10:26Z", value: 12.5 },
            { timestamp: "2018-04-11T12:20:52Z", value: 10 },
            { timestamp: "2018-04-11T12:31:18Z", value: 10 },
            { timestamp: "2018-04-11T12:41:44Z", value: 10 },
            { timestamp: "2018-04-11T12:52:10Z", value: 22.5 },
            { timestamp: "2018-04-11T13:02:36Z", value: 20 },
            { timestamp: "2018-04-11T13:13:02Z", value: 27.500000000000004 },
            { timestamp: "2018-04-11T13:23:28Z", value: 25 },
            { timestamp: "2018-04-11T13:33:54Z", value: 22.5 },
            { timestamp: "2018-04-11T13:44:20Z", value: 25 },
            { timestamp: "2018-04-11T13:54:46Z", value: 22.5 },
            { timestamp: "2018-04-11T14:05:12Z", value: 22.5 },
            { timestamp: "2018-04-11T14:15:39Z", value: 25 },
            { timestamp: "2018-04-11T14:26:05Z", value: 32.5 },
            { timestamp: "2018-04-11T14:36:31Z", value: 30 },
            { timestamp: "2018-04-11T14:46:57Z", value: 32.5 },
            { timestamp: "2018-04-11T14:57:23Z", value: 32.5 },
            { timestamp: "2018-04-11T15:07:49Z", value: 30 },
            { timestamp: "2018-04-11T15:18:15Z", value: 30 },
            { timestamp: "2018-04-11T15:28:41Z", value: 30 },
            { timestamp: "2018-04-11T15:39:07Z", value: 32.5 },
            { timestamp: "2018-04-11T15:49:33Z", value: 35 },
            { timestamp: "2018-04-11T15:59:59Z", value: 22.5 },
            { timestamp: "2018-04-11T16:10:25Z", value: 25 },
            { timestamp: "2018-04-11T16:20:52Z", value: 27.500000000000004 },
            { timestamp: "2018-04-11T16:31:18Z", value: 35 },
            { timestamp: "2018-04-11T16:41:44Z", value: 35 },
            { timestamp: "2018-04-11T16:52:10Z", value: 25 },
            { timestamp: "2018-04-11T17:02:36Z", value: 32.5 },
            { timestamp: "2018-04-11T17:13:02Z", value: 32.5 },
            { timestamp: "2018-04-11T17:23:28Z", value: 30 },
            { timestamp: "2018-04-11T17:33:54Z", value: 30 },
            { timestamp: "2018-04-11T17:44:20Z", value: 27.500000000000004 },
            { timestamp: "2018-04-11T17:54:46Z", value: 25 },
            { timestamp: "2018-04-11T18:05:12Z", value: 25 },
            { timestamp: "2018-04-11T18:15:39Z", value: 22.5 },
            { timestamp: "2018-04-11T18:26:05Z", value: 7.5 },
            { timestamp: "2018-04-11T18:36:31Z", value: 10 },
            { timestamp: "2018-04-11T18:46:57Z", value: 10 },
            { timestamp: "2018-04-11T18:57:23Z", value: 10 },
            { timestamp: "2018-04-11T19:07:49Z", value: 2.5 },
            { timestamp: "2018-04-11T19:18:15Z", value: 2.5 },
            { timestamp: "2018-04-11T19:28:41Z", value: 2.5 },
            { timestamp: "2018-04-11T19:39:07Z", value: 5 },
            { timestamp: "2018-04-11T19:49:33Z", value: 10 },
            { timestamp: "2018-04-11T19:59:59Z", value: 10 },
            { timestamp: "2018-04-11T20:10:25Z", value: 10 },
            { timestamp: "2018-04-11T20:20:52Z", value: 10 },
            { timestamp: "2018-04-11T20:31:18Z", value: 10 },
            { timestamp: "2018-04-11T20:41:44Z", value: 7.5 },
            { timestamp: "2018-04-11T20:52:10Z", value: 7.5 },
            { timestamp: "2018-04-11T21:02:36Z", value: 7.5 },
            { timestamp: "2018-04-11T21:13:02Z", value: 7.5 },
            { timestamp: "2018-04-11T21:23:28Z", value: 7.5 },
            { timestamp: "2018-04-11T21:33:54Z", value: 7.5 },
            { timestamp: "2018-04-11T21:44:20Z", value: 7.5 },
            { timestamp: "2018-04-11T21:54:46Z", value: 7.5 },
            { timestamp: "2018-04-11T22:05:12Z", value: 7.5 },
            { timestamp: "2018-04-11T22:15:39Z", value: 7.5 },
            { timestamp: "2018-04-11T22:26:05Z", value: 7.5 },
            { timestamp: "2018-04-11T22:36:31Z", value: 7.5 },
            { timestamp: "2018-04-11T22:46:57Z", value: 7.5 },
            { timestamp: "2018-04-11T22:57:23Z", value: 7.5 },
            { timestamp: "2018-04-11T23:07:49Z", value: 5 },
            { timestamp: "2018-04-11T23:18:15Z", value: 5 },
            { timestamp: "2018-04-11T23:28:41Z", value: 5 },
            { timestamp: "2018-04-11T23:39:07Z", value: 5 },
            { timestamp: "2018-04-11T23:49:33Z", value: 5 },
            { timestamp: "2018-04-11T23:59:59Z", value: 5 },
          ].sort((a, b) => moment.utc(a.timestamp).valueOf() - moment.utc(b.timestamp).valueOf()),
        },
      ]}
    />
  ))
  .add('Daily Metrics long-timespan chart', () => (
    <LineChart
      timeZone="America/New_York"
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({
        tickResolutionInMs: 1 * ONE_DAY_IN_MS,
        formatter: n => moment.utc(n).tz('America/New_York').format(`MM/DD`),
      })}

      yAxis={yAxisMinMax({})}

      overlays={[
        overlayTwoPopups({
          topPopupFormatter: overlayTwoPopupsPlainTextFormatter(item => `${Math.round(item.value)} Total Events`, 'top'),
          bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
            (item, {mouseX, xScale}) => {
              const timestamp = moment.utc(xScale.invert(mouseX)).tz('America/New_York');
              return timestamp.format(`ddd MMM DD YYYY`);
            }
          ),

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 20,

          topOverlayWidth: 150,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          verticalBaselineOffset: 10,
          data: [
            { timestamp: "2018-03-17T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-18T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-19T04:00:00.000Z", value: 2 },
            { timestamp: "2018-03-20T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-21T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-22T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-23T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-24T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-25T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-26T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-27T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-28T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-29T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-30T04:00:00.000Z", value: 0 },
            { timestamp: "2018-03-31T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-01T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-02T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-03T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-04T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-05T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-06T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-07T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-08T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-09T04:00:00.000Z", value: 32 },
            { timestamp: "2018-04-10T04:00:00.000Z", value: 31 },
            { timestamp: "2018-04-11T04:00:00.000Z", value: 57 },
            { timestamp: "2018-04-12T04:00:00.000Z", value: 19 },
            { timestamp: "2018-04-13T04:00:00.000Z", value: 22 },
            { timestamp: "2018-04-14T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-15T04:00:00.000Z", value: 0 },
            { timestamp: "2018-04-16T04:00:00.000Z", value: 77 },
            { timestamp: "2018-04-17T04:00:00.000Z", value: 22 },
            { timestamp: "2018-04-18T04:00:00.000Z", value: 0 },
          ].sort((a, b) => moment.utc(a.timestamp).valueOf() - moment.utc(b.timestamp).valueOf()),
        },
      ]}
    />
  ))
  .add('With a day of data', () => (
    <LineChart
      timeZone="UTC"
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 15,
      })}

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [],
      })}
      yAxisEnd={100}
      yAxisStart={0}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          topPopupFormatter: {
            enter: selection => {
              selection.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-weight', '500')
            },
            merge: ({item, xScale, mouseX, topOverlayWidth}, selection) => {
              selection.select('text')
                .attr('transform', `translate(${topOverlayWidth / 2},26)`)
                .text(`${item.value}`);
            },
            exit: selection => selection.remove(),
          },
          bottomPopupFormatter: {
            enter: selection => {
              selection.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-weight', '500')
            },
            merge: ({xScale, mouseX, bottomOverlayWidth}, selection) => {
              selection.select('text')
                .attr('transform', `translate(${bottomOverlayWidth / 2},26)`)
                .text(`${moment.utc(xScale.invert(mouseX)).format()}`);
            },
            exit: selection => selection.remove(),
          },

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 100,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          data: uncompressData(fullDayOfData),
        },
      ]}
    />
  ))
  .add('With a partial day of data with explicit start and end (over a 24 hour span)', () => (
    <LineChart
      timeZone="UTC"
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 15,
      })}
      xAxisStart="2017-03-29T12:03:05.679Z"
      xAxisEnd="2017-03-30T12:03:05.679Z"

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [],
      })}
      yAxisEnd={100}
      yAxisStart={0}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          topPopupFormatter: {
            enter: selection => {
              selection.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-weight', '500')
            },
            merge: ({item, xScale, mouseX, topOverlayWidth}, selection) => {
              selection.select('text')
                .attr('transform', `translate(${topOverlayWidth / 2},26)`)
                .text(`${item.value}`);
            },
            exit: selection => selection.remove(),
          },
          bottomPopupFormatter: {
            enter: selection => {
              selection.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-weight', '500')
            },
            merge: ({xScale, mouseX, bottomOverlayWidth}, selection) => {
              selection.select('text')
                .attr('transform', `translate(${bottomOverlayWidth / 2},26)`)
                .text(`${moment.utc(xScale.invert(mouseX)).format()}`);
            },
            exit: selection => selection.remove(),
          },

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 100,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          data: uncompressData(partialDayOfData),
        },
      ]}
    />
  ))
  .add('With a partial day of data with explicit start and end (over a 24 hour span), rendering after the last datapoint', () => (
    <LineChart
      timeZone="UTC"
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 15,
      })}
      xAxisStart="2017-03-29T12:03:05.679Z"
      xAxisEnd="2017-03-30T12:03:05.679Z"

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [],
      })}
      yAxisEnd={100}
      yAxisStart={0}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          topPopupFormatter: {
            enter: selection => {
              selection.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-weight', '500')
            },
            merge: ({item, xScale, mouseX, topOverlayWidth}, selection) => {
              selection.select('text')
                .attr('transform', `translate(${topOverlayWidth / 2},26)`)
                .text(`${item.value}`);
            },
            exit: selection => selection.remove(),
          },
          bottomPopupFormatter: {
            enter: selection => {
              selection.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-weight', '500')
            },
            merge: ({xScale, mouseX, bottomOverlayWidth}, selection) => {
              selection.select('text')
                .attr('transform', `translate(${bottomOverlayWidth / 2},26)`)
                .text(`${moment.utc(xScale.invert(mouseX)).format()}`);
            },
            exit: selection => selection.remove(),
          },

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 100,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          renderAfterLastDatapoint: true,
          data: uncompressData(partialDayOfData),
        },
      ]}
    />
  ))
  .add('Without any data. Should be empty.', () => (
    <LineChart
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({})}
      yAxis={yAxisMinMax({})}
      overlays={[]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          data: [],
        },
      ]}
    />
  ))
  .add(`With adding points to the graph over time. This is to show that the graph can receive updates.`, () => {
    class AddNewPointsToGraph extends React.Component {
      constructor(props) {
        super(props);
        this.state = {data: [
          {value: 1, timestamp: moment().subtract(2, 'second').toISOString()},
          {value: 3, timestamp: moment().subtract(1, 'second').toISOString()},
        ]}
      }
      componentDidMount() {
        let currentCount = 0;
        this.interval = setInterval(() => {
          currentCount += Math.random() > 0.5 ? 1 : -1;
          if (currentCount < 0) {
            currentCount = 0;
          }
          this.setState({data: [
            ...this.state.data,
            { value: currentCount, timestamp: moment().toISOString() }
          ]});
        }, 1000);
      }
      componentWillUnmount() {
        clearInterval(this.interval);
      }
      render() {
        return <LineChart
          timeZone="UTC"
          svgWidth={1000}
          svgHeight={300}

          xAxis={xAxisDailyTick({
            tickResolutionInMs: 10 * 1000,
            formatter: (n) => {
              const timeFormat = moment.utc(n).format('HH:mm:ss');
              return timeFormat.slice(
                0, 
                timeFormat.startsWith('12') ? -1 : -2
              ).toLowerCase();
            },
          })}

          yAxis={yAxisMinMax({
            leftOffset: 20,
            axisRuleLineDashWidth: 4,
            axisRuleLineDashSpacing: 10,
            points: [],
          })}

          overlayShowPoint={true}
          overlayPointRadius={4.5}

          overlays={[
            overlayTwoPopups({
              topPopupFormatter: {
                enter: selection => {
                  selection.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('font-weight', '500')
                },
                merge: ({item, xScale, mouseX, topOverlayWidth}, selection) => {
                  selection.select('text')
                    .attr('transform', `translate(${topOverlayWidth / 2},26)`)
                    .text(`${item.value}`);
                },
                exit: selection => selection.remove(),
              },
              bottomPopupFormatter: {
                enter: selection => {
                  selection.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('font-weight', '500')
                },
                merge: ({xScale, mouseX, bottomOverlayWidth}, selection) => {
                  selection.select('text')
                    .attr('transform', `translate(${bottomOverlayWidth / 2},26)`)
                    .text(`${moment.utc(xScale.invert(mouseX)).format()}`);
                },
                exit: selection => selection.remove(),
              },

              bottomOverlayTopMargin: 40,
              topOverlayBottomMargin: 10,

              topOverlayWidth: 100,
              topOverlayHeight: 42,
              bottomOverlayWidth: 200,
              bottomOverlayHeight: 42,
            }),
          ]}

          data={[
            {
              name: 'default',
              type: dataWaterline,
              color: 'rgba(65, 152, 255, 0.2)',
              borderColor: 'rgb(65, 152, 255)',
              data: this.state.data,
            },
          ]}
        />;
      }
    }
    return <AddNewPointsToGraph />;
  })
  .add('Everything possible', () => (
    <LineChart
      timeZone="UTC"
      svgWidth={1000}
      svgHeight={300}

      xAxis={xAxisDailyTick({
        timeBetweenTicksInMs: 1 * ONE_MINUTE_IN_MS,
        bottomOffset: 15,
      })}
      // xAxis={exampleAxis({color: 'red'})}

      yAxis={yAxisMinMax({
        leftOffset: 20,
        axisRuleLineDashWidth: 4,
        axisRuleLineDashSpacing: 10,
        points: [
          {value: 20, hasRule: true},
          {value: 10, hasRule: false},
        ],
        showMinimumPoint: true,
        showMaximumPoint: true,
      })}
      yAxisEnd={40}
      yAxisStart={0}

      overlayShowPoint={true}
      overlayPointRadius={4.5}

      overlays={[
        overlayTwoPopups({
          // topPopupFormatter: overlayTwoPopupsPlainTextFormatter(item => `${item.value}`),
          topPopupFormatter: overlayTwoPopupsPersonIconTextFormatter(item => `${item.value}`),
          bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
            (item, {mouseX, xScale}) => {
              const timestamp = moment.utc(xScale.invert(mouseX));
              const time = timestamp.format(`h:mma`).slice(0, -1);
              const date = timestamp.format(`ddd MMM Do`);
              return `${time} ${date}`;
            }
          ),

          bottomOverlayTopMargin: 40,
          topOverlayBottomMargin: 10,

          topOverlayWidth: 80,
          topOverlayHeight: 42,
          bottomOverlayWidth: 200,
          bottomOverlayHeight: 42,
        }),
        // overlayExample({color: 'red'}),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
          verticalBaselineOffset: 0,
          data: [
            {value: 40, timestamp: '2018-04-16T14:00:00.000Z'},
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







const fullDayOfData = "1,2017-03-28T12:02:11.330Z;0,2017-03-28T12:02:14.864Z;1,2017-03-28T12:02:21.997Z;2,2017-03-28T12:02:22.897Z;3,2017-03-28T12:02:35.030Z;4,2017-03-28T12:08:10.959Z;5,2017-03-28T12:10:34.591Z;6,2017-03-28T12:10:41.158Z;5,2017-03-28T12:12:31.856Z;6,2017-03-28T12:12:43.855Z;7,2017-03-28T12:14:53.954Z;8,2017-03-28T12:17:11.019Z;9,2017-03-28T12:18:04.085Z;8,2017-03-28T12:20:13.117Z;9,2017-03-28T12:20:54.350Z;10,2017-03-28T12:21:18.017Z;9,2017-03-28T12:21:20.183Z;10,2017-03-28T12:21:30.616Z;9,2017-03-28T12:27:09.645Z;8,2017-03-28T12:28:55.077Z;9,2017-03-28T12:28:55.844Z;10,2017-03-28T12:31:59.475Z;9,2017-03-28T12:32:04.142Z;10,2017-03-28T12:33:18.041Z;11,2017-03-28T12:33:22.274Z;10,2017-03-28T12:35:46.905Z;11,2017-03-28T12:37:09.938Z;12,2017-03-28T12:39:24.569Z;13,2017-03-28T12:47:25.697Z;14,2017-03-28T12:53:49.592Z;13,2017-03-28T12:55:17.825Z;14,2017-03-28T12:57:45.524Z;13,2017-03-28T12:58:07.456Z;14,2017-03-28T13:06:58.150Z;13,2017-03-28T13:09:23.948Z;14,2017-03-28T13:10:53.648Z;15,2017-03-28T13:12:19.846Z;14,2017-03-28T13:12:55.945Z;13,2017-03-28T13:14:00.744Z;12,2017-03-28T13:18:14.408Z;13,2017-03-28T13:22:38.271Z;14,2017-03-28T13:22:39.238Z;15,2017-03-28T13:24:37.337Z;14,2017-03-28T13:25:33.969Z;13,2017-03-28T13:25:38.903Z;14,2017-03-28T13:28:57.367Z;15,2017-03-28T13:30:27.333Z;16,2017-03-28T13:32:33.831Z;15,2017-03-28T13:34:40.630Z;16,2017-03-28T13:36:51.961Z;17,2017-03-28T13:36:54.530Z;16,2017-03-28T13:37:07.794Z;15,2017-03-28T13:38:06.760Z;16,2017-03-28T13:43:32.623Z;17,2017-03-28T13:50:16.918Z;18,2017-03-28T13:50:33.318Z;17,2017-03-28T13:51:25.551Z;16,2017-03-28T13:51:49.950Z;17,2017-03-28T13:53:15.549Z;18,2017-03-28T13:54:36.282Z;17,2017-03-28T13:55:12.315Z;18,2017-03-28T13:56:41.414Z;17,2017-03-28T13:57:31.379Z;18,2017-03-28T13:57:34.247Z;17,2017-03-28T13:59:05.212Z;16,2017-03-28T14:03:43.742Z;17,2017-03-28T14:04:15.341Z;18,2017-03-28T14:04:43.474Z;19,2017-03-28T14:05:06.107Z;18,2017-03-28T14:05:08.241Z;19,2017-03-28T14:05:31.340Z;18,2017-03-28T14:10:33.670Z;19,2017-03-28T14:10:52.403Z;18,2017-03-28T14:11:05.204Z;19,2017-03-28T14:11:26.969Z;20,2017-03-28T14:11:34.569Z;21,2017-03-28T14:11:36.271Z;22,2017-03-28T14:12:49.068Z;21,2017-03-28T14:13:33.401Z;20,2017-03-28T14:15:55.533Z;21,2017-03-28T14:17:31.731Z;22,2017-03-28T14:21:25.762Z;23,2017-03-28T14:23:24.527Z;22,2017-03-28T14:25:40.959Z;23,2017-03-28T14:26:39.125Z;24,2017-03-28T14:27:14.224Z;25,2017-03-28T14:29:06.757Z;24,2017-03-28T14:30:25.122Z;23,2017-03-28T14:30:44.122Z;24,2017-03-28T14:31:17.321Z;25,2017-03-28T14:32:53.120Z;26,2017-03-28T14:36:47.684Z;27,2017-03-28T14:36:49.152Z;28,2017-03-28T14:37:27.950Z;29,2017-03-28T14:38:30.716Z;30,2017-03-28T14:39:33.415Z;29,2017-03-28T14:41:50.880Z;30,2017-03-28T14:42:59.846Z;31,2017-03-28T14:44:32.378Z;32,2017-03-28T14:46:48.243Z;33,2017-03-28T14:49:17.141Z;34,2017-03-28T14:49:18.275Z;35,2017-03-28T14:49:42.607Z;34,2017-03-28T14:50:39.840Z;35,2017-03-28T14:50:52.306Z;36,2017-03-28T14:52:17.940Z;35,2017-03-28T14:52:58.838Z;34,2017-03-28T14:53:50.004Z;35,2017-03-28T14:54:05.871Z;36,2017-03-28T14:55:04.837Z;35,2017-03-28T14:55:23.736Z;34,2017-03-28T14:55:24.536Z;35,2017-03-28T14:56:40.402Z;34,2017-03-28T14:58:11.101Z;33,2017-03-28T15:00:20.366Z;32,2017-03-28T15:00:54.765Z;33,2017-03-28T15:01:10.732Z;32,2017-03-28T15:01:43.898Z;31,2017-03-28T15:03:20.630Z;32,2017-03-28T15:05:42.028Z;31,2017-03-28T15:08:51.659Z;30,2017-03-28T15:11:22.691Z;31,2017-03-28T15:11:52.123Z;32,2017-03-28T15:12:32.890Z;33,2017-03-28T15:14:12.522Z;32,2017-03-28T15:18:13.285Z;31,2017-03-28T15:19:47.651Z;32,2017-03-28T15:24:01.514Z;31,2017-03-28T15:25:39.380Z;30,2017-03-28T15:25:40.247Z;31,2017-03-28T15:26:49.279Z;30,2017-03-28T15:27:14.547Z;31,2017-03-28T15:27:25.345Z;32,2017-03-28T15:27:26.846Z;33,2017-03-28T15:29:48.376Z;34,2017-03-28T15:37:16.670Z;33,2017-03-28T15:38:55.870Z;32,2017-03-28T15:39:09.236Z;33,2017-03-28T15:40:43.968Z;34,2017-03-28T15:40:49.102Z;35,2017-03-28T15:40:50.304Z;34,2017-03-28T15:42:00.501Z;33,2017-03-28T15:42:01.068Z;32,2017-03-28T15:44:51.166Z;31,2017-03-28T15:44:51.566Z;30,2017-03-28T15:46:42.697Z;31,2017-03-28T15:46:50.066Z;32,2017-03-28T15:47:11.465Z;31,2017-03-28T15:47:20.197Z;32,2017-03-28T15:52:33.693Z;31,2017-03-28T15:53:23.726Z;32,2017-03-28T15:58:11.823Z;33,2017-03-28T15:58:28.489Z;32,2017-03-28T15:58:30.323Z;31,2017-03-28T16:00:56.054Z;32,2017-03-28T16:01:12.054Z;31,2017-03-28T16:01:14.621Z;32,2017-03-28T16:01:20.387Z;31,2017-03-28T16:01:28.487Z;30,2017-03-28T16:01:41.886Z;29,2017-03-28T16:04:00.318Z;28,2017-03-28T16:04:08.052Z;29,2017-03-28T16:04:11.286Z;28,2017-03-28T16:04:11.786Z;29,2017-03-28T16:07:30.349Z;28,2017-03-28T16:09:14.814Z;27,2017-03-28T16:10:00.847Z;28,2017-03-28T16:11:49.779Z;29,2017-03-28T16:12:27.812Z;30,2017-03-28T16:17:15.008Z;29,2017-03-28T16:17:20.509Z;28,2017-03-28T16:17:28.642Z;29,2017-03-28T16:17:38.041Z;28,2017-03-28T16:17:53.710Z;29,2017-03-28T16:26:32.935Z;28,2017-03-28T16:27:26.001Z;27,2017-03-28T16:28:19.534Z;28,2017-03-28T16:29:11.100Z;27,2017-03-28T16:29:59.137Z;28,2017-03-28T16:31:34.731Z;27,2017-03-28T16:32:46.197Z;26,2017-03-28T16:34:02.029Z;27,2017-03-28T16:35:05.528Z;28,2017-03-28T16:35:06.363Z;27,2017-03-28T16:37:05.592Z;28,2017-03-28T16:48:36.141Z;27,2017-03-28T16:49:16.606Z;28,2017-03-28T16:52:14.798Z;27,2017-03-28T16:52:25.896Z;28,2017-03-28T16:56:05.523Z;29,2017-03-28T16:57:15.889Z;28,2017-03-28T16:58:35.754Z;29,2017-03-28T16:59:02.154Z;28,2017-03-28T17:00:14.152Z;29,2017-03-28T17:00:24.086Z;30,2017-03-28T17:00:51.419Z;31,2017-03-28T17:01:34.084Z;32,2017-03-28T17:01:51.818Z;33,2017-03-28T17:05:12.881Z;34,2017-03-28T17:06:29.913Z;33,2017-03-28T17:09:15.543Z;32,2017-03-28T17:10:14.842Z;33,2017-03-28T17:12:51.506Z;34,2017-03-28T17:13:08.906Z;35,2017-03-28T17:16:31.836Z;36,2017-03-28T17:16:33.104Z;37,2017-03-28T17:19:57.033Z;38,2017-03-28T17:29:29.794Z;37,2017-03-28T17:32:56.324Z;36,2017-03-28T17:33:56.123Z;37,2017-03-28T17:34:05.523Z;38,2017-03-28T17:34:19.790Z;37,2017-03-28T17:34:48.589Z;36,2017-03-28T17:34:50.590Z;37,2017-03-28T17:43:22.382Z;36,2017-03-28T17:44:01.181Z;37,2017-03-28T17:45:20.647Z;36,2017-03-28T17:45:36.947Z;37,2017-03-28T17:46:37.379Z;38,2017-03-28T17:46:59.679Z;37,2017-03-28T17:48:44.612Z;36,2017-03-28T17:49:16.645Z;35,2017-03-28T17:49:19.045Z;34,2017-03-28T17:49:27.778Z;35,2017-03-28T17:50:29.911Z;36,2017-03-28T17:50:57.677Z;35,2017-03-28T17:52:27.443Z;36,2017-03-28T17:52:37.309Z;35,2017-03-28T17:53:47.975Z;36,2017-03-28T17:55:01.575Z;35,2017-03-28T17:55:47.276Z;36,2017-03-28T17:55:54.276Z;35,2017-03-28T17:56:49.844Z;34,2017-03-28T17:58:11.379Z;35,2017-03-28T17:58:11.612Z;36,2017-03-28T17:58:48.012Z;35,2017-03-28T17:59:20.846Z;36,2017-03-28T18:00:20.547Z;35,2017-03-28T18:00:29.080Z;36,2017-03-28T18:00:38.814Z;35,2017-03-28T18:01:55.781Z;34,2017-03-28T18:03:48.616Z;33,2017-03-28T18:04:33.348Z;34,2017-03-28T18:05:04.981Z;35,2017-03-28T18:05:55.315Z;36,2017-03-28T18:05:59.015Z;37,2017-03-28T18:06:09.948Z;36,2017-03-28T18:06:27.915Z;37,2017-03-28T18:08:49.248Z;36,2017-03-28T18:09:16.181Z;35,2017-03-28T18:10:20.747Z;34,2017-03-28T18:11:19.713Z;35,2017-03-28T18:11:46.147Z;36,2017-03-28T18:15:55.478Z;37,2017-03-28T18:18:10.277Z;36,2017-03-28T18:18:35.343Z;37,2017-03-28T18:21:08.409Z;38,2017-03-28T18:22:52.508Z;37,2017-03-28T18:24:20.407Z;38,2017-03-28T18:24:58.373Z;39,2017-03-28T18:25:00.674Z;38,2017-03-28T18:25:20.775Z;39,2017-03-28T18:25:31.774Z;40,2017-03-28T18:25:38.207Z;41,2017-03-28T18:25:54.873Z;42,2017-03-28T18:26:09.306Z;41,2017-03-28T18:28:47.771Z;40,2017-03-28T18:29:48.304Z;41,2017-03-28T18:31:45.568Z;42,2017-03-28T18:34:33.765Z;41,2017-03-28T18:38:16.595Z;42,2017-03-28T18:39:53.394Z;41,2017-03-28T18:41:25.526Z;42,2017-03-28T18:41:45.026Z;41,2017-03-28T18:41:46.460Z;42,2017-03-28T18:44:09.323Z;41,2017-03-28T18:44:55.956Z;42,2017-03-28T18:46:10.322Z;43,2017-03-28T19:01:11.311Z;44,2017-03-28T19:01:26.744Z;45,2017-03-28T19:01:54.244Z;46,2017-03-28T19:02:02.778Z;45,2017-03-28T19:02:12.710Z;44,2017-03-28T19:02:47.543Z;45,2017-03-28T19:03:52.641Z;46,2017-03-28T19:04:24.406Z;45,2017-03-28T19:06:19.867Z;46,2017-03-28T19:08:22.429Z;45,2017-03-28T19:09:44.925Z;46,2017-03-28T19:10:59.989Z;45,2017-03-28T19:11:15.089Z;44,2017-03-28T19:11:16.257Z;43,2017-03-28T19:11:21.189Z;44,2017-03-28T19:13:08.687Z;45,2017-03-28T19:13:24.688Z;46,2017-03-28T19:14:05.053Z;47,2017-03-28T19:15:16.086Z;46,2017-03-28T19:15:38.952Z;47,2017-03-28T19:15:42.919Z;46,2017-03-28T19:17:33.651Z;47,2017-03-28T19:19:14.283Z;48,2017-03-28T19:19:27.983Z;47,2017-03-28T19:19:42.816Z;48,2017-03-28T19:20:11.549Z;47,2017-03-28T19:21:08.682Z;48,2017-03-28T19:21:36.882Z;47,2017-03-28T19:21:47.015Z;48,2017-03-28T19:22:05.715Z;47,2017-03-28T19:23:52.813Z;46,2017-03-28T19:24:29.580Z;47,2017-03-28T19:25:48.179Z;48,2017-03-28T19:25:54.512Z;47,2017-03-28T19:25:55.680Z;46,2017-03-28T19:26:47.511Z;47,2017-03-28T19:28:31.543Z;48,2017-03-28T19:29:38.109Z;49,2017-03-28T19:31:30.075Z;48,2017-03-28T19:31:30.975Z;49,2017-03-28T19:31:44.841Z;48,2017-03-28T19:32:24.474Z;49,2017-03-28T19:33:41.706Z;48,2017-03-28T19:34:31.772Z;49,2017-03-28T19:35:14.439Z;50,2017-03-28T19:39:04.436Z;51,2017-03-28T19:39:04.503Z;52,2017-03-28T19:39:04.869Z;51,2017-03-28T19:41:01.034Z;52,2017-03-28T19:42:58.465Z;51,2017-03-28T19:43:15.899Z;52,2017-03-28T19:43:23.932Z;51,2017-03-28T19:45:27.897Z;52,2017-03-28T19:46:26.596Z;53,2017-03-28T19:48:12.628Z;54,2017-03-28T19:49:05.561Z;55,2017-03-28T19:50:09.793Z;56,2017-03-28T19:50:19.194Z;55,2017-03-28T19:50:21.527Z;56,2017-03-28T19:50:34.826Z;57,2017-03-28T19:50:48.893Z;58,2017-03-28T19:51:01.559Z;57,2017-03-28T19:51:05.293Z;56,2017-03-28T19:52:42.125Z;55,2017-03-28T19:52:51.992Z;54,2017-03-28T19:53:05.258Z;55,2017-03-28T19:54:48.690Z;54,2017-03-28T19:56:09.189Z;53,2017-03-28T20:00:29.719Z;54,2017-03-28T20:02:51.651Z;53,2017-03-28T20:03:47.417Z;52,2017-03-28T20:03:55.351Z;53,2017-03-28T20:04:30.883Z;52,2017-03-28T20:05:56.882Z;51,2017-03-28T20:06:39.915Z;50,2017-03-28T20:09:20.946Z;51,2017-03-28T20:13:18.639Z;50,2017-03-28T20:15:51.601Z;51,2017-03-28T20:21:00.655Z;50,2017-03-28T20:21:50.320Z;49,2017-03-28T20:28:21.210Z;50,2017-03-28T20:31:36.206Z;49,2017-03-28T20:32:16.271Z;50,2017-03-28T20:33:05.804Z;49,2017-03-28T21:18:19.972Z;48,2017-03-28T21:19:43.071Z;49,2017-03-28T21:20:57.643Z;50,2017-03-28T21:22:05.080Z;49,2017-03-28T21:22:53.550Z;50,2017-03-28T21:25:38.091Z;49,2017-03-28T21:31:36.166Z;48,2017-03-28T22:00:36.217Z;49,2017-03-28T22:01:59.749Z;48,2017-03-28T22:03:59.881Z;47,2017-03-28T22:10:18.544Z;46,2017-03-28T22:15:02.541Z;47,2017-03-28T22:28:48.696Z;48,2017-03-28T22:55:25.742Z;49,2017-03-28T22:58:22.041Z;50,2017-03-28T22:58:40.239Z;49,2017-03-28T23:00:25.104Z;50,2017-03-28T23:40:22.923Z;49,2017-03-28T23:47:46.435Z;48,2017-03-29T00:01:28.471Z;47,2017-03-29T00:01:29.805Z;48,2017-03-29T08:50:08.721Z;49,2017-03-29T09:09:12.640Z;48,2017-03-29T09:09:14.674Z;49,2017-03-29T09:09:22.274Z;48,2017-03-29T09:09:25.374Z;49,2017-03-29T09:09:40.307Z;50,2017-03-29T09:09:40.742Z;49,2017-03-29T09:15:29.768Z;50,2017-03-29T09:16:20.368Z;49,2017-03-29T09:22:54.796Z;50,2017-03-29T11:27:16.572Z;51,2017-03-29T11:31:00.103Z;50,2017-03-29T11:31:53.569Z;49,2017-03-29T11:33:53.067Z;48,2017-03-29T11:33:54.668Z;49,2017-03-29T11:33:59.468Z;48,2017-03-29T11:34:46.467Z;49,2017-03-29T11:35:07.766Z;48,2017-03-29T11:35:52.032Z;49,2017-03-29T11:36:10.399Z;50,2017-03-29T11:37:54.898Z;51,2017-03-29T11:37:56.265Z;52,2017-03-29T11:50:06.822Z;53,2017-03-29T11:54:37.486Z;52,2017-03-29T11:57:51.516Z;53,2017-03-29T11:57:59.383Z;54,2017-03-29T11:58:06.950Z;55,2017-03-29T11:58:17.016Z;54,2017-03-29T11:59:50.315Z";

const partialDayOfData = "1,2017-03-29T12:03:05.679Z;2,2017-03-29T12:04:49.011Z;1,2017-03-29T12:07:48.509Z;0,2017-03-29T12:07:49.610Z;1,2017-03-29T12:11:41.973Z;2,2017-03-29T12:15:20.570Z;1,2017-03-29T12:19:23.601Z;2,2017-03-29T12:20:02.534Z;3,2017-03-29T12:20:03.674Z;4,2017-03-29T12:23:02.165Z;5,2017-03-29T12:23:04.632Z;6,2017-03-29T12:27:42.895Z;7,2017-03-29T12:30:38.692Z;8,2017-03-29T12:32:52.591Z;9,2017-03-29T12:33:00.358Z;10,2017-03-29T12:34:33.356Z;11,2017-03-29T12:35:54.323Z;10,2017-03-29T12:42:10.151Z;9,2017-03-29T12:43:29.417Z;10,2017-03-29T12:45:45.415Z;11,2017-03-29T12:47:00.481Z;10,2017-03-29T12:49:23.646Z;11,2017-03-29T12:51:16.611Z;10,2017-03-29T12:52:32.610Z;11,2017-03-29T12:53:14.910Z;12,2017-03-29T12:53:44.976Z;13,2017-03-29T12:56:00.508Z;14,2017-03-29T12:56:56.607Z;13,2017-03-29T12:59:49.838Z;12,2017-03-29T12:59:51.172Z;11,2017-03-29T12:59:53.639Z;12,2017-03-29T13:02:04.770Z;11,2017-03-29T13:03:19.103Z;12,2017-03-29T13:05:20.268Z;13,2017-03-29T13:11:30.530Z;14,2017-03-29T13:11:47.396Z;15,2017-03-29T13:11:49.063Z;16,2017-03-29T13:12:35.262Z;15,2017-03-29T13:13:22.695Z;14,2017-03-29T13:13:40.761Z;13,2017-03-29T13:13:42.129Z;12,2017-03-29T13:13:45.863Z;11,2017-03-29T13:13:48.562Z;10,2017-03-29T13:14:56.327Z;11,2017-03-29T13:15:06.961Z;10,2017-03-29T13:15:44.060Z;11,2017-03-29T13:18:37.158Z;10,2017-03-29T13:20:43.457Z;11,2017-03-29T13:21:39.656Z;10,2017-03-29T13:21:46.556Z;9,2017-03-29T13:23:25.421Z;10,2017-03-29T13:23:26.856Z;11,2017-03-29T13:25:12.787Z;10,2017-03-29T13:25:24.787Z;11,2017-03-29T13:25:45.086Z;12,2017-03-29T13:25:54.520Z;11,2017-03-29T13:26:04.419Z;12,2017-03-29T13:27:00.219Z;13,2017-03-29T13:27:19.218Z;14,2017-03-29T13:27:45.985Z;13,2017-03-29T13:28:14.551Z;12,2017-03-29T13:28:15.351Z;13,2017-03-29T13:28:47.151Z;14,2017-03-29T13:30:40.783Z;13,2017-03-29T13:30:56.282Z;14,2017-03-29T13:31:43.182Z;15,2017-03-29T13:31:44.182Z;16,2017-03-29T13:31:44.349Z;15,2017-03-29T13:31:54.650Z;14,2017-03-29T13:31:57.017Z;13,2017-03-29T13:33:32.247Z;14,2017-03-29T13:35:13.713Z;15,2017-03-29T13:37:07.045Z;16,2017-03-29T13:37:07.878Z;15,2017-03-29T13:38:34.612Z;14,2017-03-29T13:40:16.942Z;13,2017-03-29T13:40:18.677Z;14,2017-03-29T13:45:10.539Z;15,2017-03-29T13:45:12.573Z;14,2017-03-29T13:46:04.338Z;13,2017-03-29T13:47:24.937Z;12,2017-03-29T13:47:30.872Z;13,2017-03-29T13:47:33.504Z;14,2017-03-29T13:47:58.470Z;15,2017-03-29T13:48:53.070Z;16,2017-03-29T13:49:45.502Z;15,2017-03-29T13:51:11.835Z;16,2017-03-29T13:51:39.934Z;17,2017-03-29T13:52:14.034Z;18,2017-03-29T13:52:16.368Z;19,2017-03-29T13:52:59.533Z;20,2017-03-29T13:53:00.868Z;19,2017-03-29T13:53:21.033Z;18,2017-03-29T13:54:39.732Z;19,2017-03-29T13:56:29.231Z;18,2017-03-29T13:58:24.996Z;19,2017-03-29T14:01:21.327Z;20,2017-03-29T14:02:45.393Z;21,2017-03-29T14:08:58.255Z";
