# Count Graph Chart
A graph of counts over time for a given space.

![Chart Example](chart.gif)

# Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import countGraph from '@density/chart-count-graph';
// or: const countGraph = require('@density/chart-count-graph').default;

const element = document.getElementById('chart-container');
const props = {data: []};
countGraph(element, props);
```

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

## Properties
- `data`: An array of `{count: <count at a given time>, timestamp: <iso 8601 timestamp>}` objects.
  Example: `[{"count": 4, "timestamp": "2017-03-28T12:00:00.000Z"}, {"count": 3, "timestamp": "2017-03-28T12:01:00.000Z"}]`

- `resets`: *(optional)* An array of `{count: <count to reset to>, timestamp: <iso 8601 timestamp when the reset occured>}` objects. Defaults to `[]`.
  Example: `[{"count": 4, "timestamp": "2017-03-28T12:00:00.000Z"}, {"count": 3, "timestamp": "2017-03-28T12:01:00.000Z"}]`

- `start` *(optional)* A [moment](momentjs.com) that will be used as the starting point of the
  graph. If omitted, the graph will fit its data.

- `end` *(optional)* A [moment](momentjs.com) that will be used as the ending point of the
  graph. If omitted, the graph will fit its data.

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
