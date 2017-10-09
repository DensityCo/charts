# Drift Chart
A chart to render a graph of daily drifts for a space.  [npm](https://npmjs.com/@density/chart-drift)

![Here's what it looks like.](http://i.imgur.com/9eUATma.png)

# Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import driftChart from '@density/chart-drift';
// or: const driftChart = require('@density/chart-drift').default;

const element = document.getElementById('chart-container');
const props = {dates: [], driftChart: []};
driftChart(element, props);
```

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

## Properties
- `data`: An array of `{drift: <count at a given time>, date: <moment object representing a given day>, eventCount: <how many events happened in a given day>}` objects.

  Example:
```javascript
[
  {
    drift: 5,                            // A drift of 5
    date: moment().subtract(1, 'day'),   // was recorded yesterday
    eventCount: 100,                     // and there was 100 total events yesterday.
  },
  {
    drift: 1,                            // A drift of 1
    date: moment().subtract(2, 'day'),   // was recorded two days ago
    eventCount: 142,                     // and there was 142 total events two days ago.
  },
  ...
]
```

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
