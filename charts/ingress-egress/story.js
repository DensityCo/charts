import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';

import ingressEgress from './index';

const IngressEgress = chartAsReactComponent(ingressEgress);

storiesOf('Ingress Egress', module)
  .add('With no name', () => (
    <IngressEgress />
  ))
  .add('With name', () => (
    <IngressEgress name="Bob" />
  ))
