import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';

import totalVisits from './index';

const TotalVisits = chartAsReactComponent(totalVisits);

storiesOf('Total Visits', module)
  .add('With no name', () => (
    <TotalVisits />
  ))
  .add('With name', () => (
    <TotalVisits name="Bob" />
  ))
