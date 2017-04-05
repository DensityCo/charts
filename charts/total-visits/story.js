import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';
import moment from 'moment';

import totalVisits from './index';

const TotalVisits = chartAsReactComponent(totalVisits);

// Generate some random data...
var createData = (duration) => {
  var dates = [];
  var visits = [];
  
  [...Array(duration).keys()].map((day) => {
    dates.push(moment().subtract(day, 'd').format("YYYY-MM-DD"));
    visits.push(Math.round(Math.random() * (100 - 0)));
  });

  return {
    'dates': dates,
    'visits': visits
  }
}

var data1 = createData(7);
var data2 = createData(20);

storiesOf('Total Visits', module)
  .add('Last 7 days of visits', () => (
    <TotalVisits dates={data1['dates']} totalVisits={data1['visits']} />
  ))
  .add('Last 20 days of visits', () => (
    <TotalVisits dates={data2['dates']} totalVisits={data2['visits']} />
  ))
