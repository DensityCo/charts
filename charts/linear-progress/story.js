import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';

import linearProgress from './index';

const LinearProgress = chartAsReactComponent(linearProgress);

storiesOf('Linear Progress', module)
  .add('Empty', () => (
    <LinearProgress />
  ))
  .add('Half full and comically slow', () => (
    <LinearProgress percentFull="50" transitionDuration="5000"/>
  ))
  .add('Full', () => (
    <LinearProgress percentFull="100" />
  ))
