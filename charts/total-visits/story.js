import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';
import moment from 'moment';
// import {} from 'moment-range';

import totalVisits from './index';

const TotalVisits = chartAsReactComponent(totalVisits);

// var dates1 = moment.range(moment().subtract(7, 'd'), Date.now()).toArray('days').map(date => date.format('YYYY-MM-DD'))
var dates1 = [moment().subtract(7, 'd').format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")]
var totalVisits1 = [100,50]

storiesOf('Total Visits', module)
  .add('Last 7 days of visits', () => (
    <TotalVisits dates={dates1} totalVisits={totalVisits1} />
  ))
  .add('Last 20 days of visits', () => (
    <TotalVisits dates={dates1} totalVisits={totalVisits1} />
  ))
