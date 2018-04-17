# Line Chart
Chart for displaying information using lines on a 2d grid where the bottom axis is time [npm](https://npmjs.com/@density/chart-line-chart)

*TODO: ADD PICTURE OF CHART*

## Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import lineChart from '@density/chart-line-chart';
// or: const lineChart = require('@density/chart-line-chart').default;

const element = document.getElementById('chart-container');
const props = {name: 'Bob'};

// Make your chart
const updateData = lineChart(element);

// Give it new data
updateData(props);
```

## Properties

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

## How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```

# Chart subcomponents

The line chart accepts a number of different modules to control how different core chart components
are rendered. Currently, there are two types of modules that this chart knows how to work with:
`Axes` and `Overlays`.

## Axis
An `Axis` contains all the code required to render either the x or y axis on the chart. Each axis
is a function that returns a second, closed over function--very similar to a chart. The upper-level
function is called by the user so that they can pass configuration parameters to an axis, and the
lower level function is called by the chart to pass more non-user-provided configuration parameters
and an element to render the axis within. Effectively, an axis looks like this:

```
// A "simple" example axis. This demonstrates how to build an axis that works with the line chart.
// Usage as a react prop: xAxis={exampleAxis({color: 'red'})}
//
export function exampleAxis({color}) {
  color = color || 'royalblue';
  return ({scale}, element) => {
    // Add an axis:
    element.call(d3.axisBottom(scale));

    // Do some custom drawing:
    const selection = element.selectAll('rect').data([10, 20, 30]);
    selection.enter()
      .append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color)
    .merge(selection)
      .attr('x', d => d)
      .attr('y', d => d)
    selection.exit().remove()
  };
}

// Axis Usage

<LineChart
  ... other props
  xAxis={exampleAxis({color: 'red'})}
  ... other props
/>
```

![docs-assets/example-axis.png](docs-assets/example-axis.png)
