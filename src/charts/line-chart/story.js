import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';
import moment from 'moment';

import lineChart, {
  xAxisDailyTick,
  yAxisMinMax,
  dataWaterline,
  overlayTwoPopups,
} from './index';

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

const LineChart = chartAsReactComponent(lineChart);

storiesOf('Line Chart', module)
  .add('With no name', () => (
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
          {value: 20, hasRule: true},
          {value: 10, hasRule: false},
        ],
      })}
      yAxisEnd={40}
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
        }),
      ]}

      data={[
        {
          name: 'default',
          type: dataWaterline,
          color: 'rgba(65, 152, 255, 0.2)',
          borderColor: 'rgb(65, 152, 255)',
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
