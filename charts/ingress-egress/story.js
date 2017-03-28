import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';

import ingressEgress from './index';

const IngressEgress = chartAsReactComponent(ingressEgress);

function generateRandomMillisecondPosition() {
  const time = Math.floor(Math.random() * 500000);
  return (new Date()).getTime() - time;
}

storiesOf('Ingress Egress', module)
  .add('With a bunch of random data', () => (
    <IngressEgress
      events={[
        {count_change: 1, timestamp: new Date().getTime() -  1500 },
        {count_change: -1, timestamp: new Date().getTime() - 10000 },
        {count_change: 1, timestamp: new Date().getTime() -  50000 },
      ]}
    />
  ))
  .add('With name', () => (
    <IngressEgress
      events={[
        {count_change: 1, timestamp: generateRandomMillisecondPosition() },
        {count_change: -1, timestamp: generateRandomMillisecondPosition() },
        {count_change: 1, timestamp: generateRandomMillisecondPosition() },
      ]}
    />
  ))
