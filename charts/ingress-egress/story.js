import * as React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {chartAsReactComponent} from '../index';

import ingressEgress from './index';

const IngressEgress = chartAsReactComponent(ingressEgress);

function generateRandomMillisecondPosition() {
  const time = Math.floor(Math.random() * 500000) + 100000;
  return (new Date()).getTime() - time;
}

function generateRandomCountChangeEvents() {
  const acc = [];
  for (let i = 0; i < Math.floor(Math.random() * 32); i++) {
    acc.push({
      count_change: Math.random() > 0.5 ? 1 : -1, // Pick a random direction
      timestamp: generateRandomMillisecondPosition(), // and timestamp
    });
  }
  return acc;
}

storiesOf('Ingress Egress Chart', module)
  .add('With a few set datapoints', () => (
    <IngressEgress
      events={[
        {count_change: 1, timestamp: new Date().getTime() - 500000},
        {count_change: 1, timestamp: new Date().getTime() -  425000 },
        {count_change: -1, timestamp: new Date().getTime() - 400000 },
      ]}
    />
  ))
  .add('With a bunch of random data', () => (
    <IngressEgress events={generateRandomCountChangeEvents()} />
  ))
  .add('With a shorter duration (ie, 1 min)', () => (
    <IngressEgress
      events={[
        {count_change: 1, timestamp: new Date().getTime() - 10000},
        {count_change: -1, timestamp: new Date().getTime() - 7500 },
        {count_change: 1, timestamp: new Date().getTime() -  50000 },
      ]}
      graphDurationInMin={1}
    />
  ))
