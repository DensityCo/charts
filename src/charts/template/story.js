import React from 'react';
import {storiesOf} from '@storybook/react';
import {chartAsReactComponent} from '../index';

import %CHARTCAMEL% from './index';

const %CHARTUPPERCAMEL% = chartAsReactComponent(%CHARTCAMEL%);

storiesOf('%CHARTTITLE%', module)
  .add('With no name', () => (
    <%CHARTUPPERCAMEL% />
  ))
  .add('With name', () => (
    <%CHARTUPPERCAMEL% name="Bob" />
  ))
