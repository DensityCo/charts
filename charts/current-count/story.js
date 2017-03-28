import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';
import moment from 'moment';

import currentCount from './index';

const CurrentCount = chartAsReactComponent(currentCount);

storiesOf('Current Count', module)
  .add('With current count, capacity, lastEvent', () => (
    <CurrentCount currentCount={24} capacity={100} lastEvent={moment()} />
  ))
  .add('With current count and capacity', () => (
    <CurrentCount currentCount={24} capacity={100} />
  ))
  .add('With a full capacity', () => (
    <CurrentCount currentCount={100} capacity={100} />
  ))
