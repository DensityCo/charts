import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';

import linearProgress from './index';

const LinearProgress = chartAsReactComponent(linearProgress);

storiesOf('Linear Progress', module)
  .add('With no name', () => (
    <LinearProgress />
  ))
  .add('With name', () => (
    <LinearProgress name="Bob" />
  ))
