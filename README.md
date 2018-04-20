<img src="https://cdn.rawgit.com/DensityCo/charts/trunk/logo.svg" height="50" />

<br />

[![CircleCI](https://circleci.com/gh/DensityCo/charts.svg?style=svg)](https://circleci.com/gh/DensityCo/charts)
[![Dependency Status](https://david-dm.org/densityco/charts.svg)](https://david-dm.org/densityco/charts)
[![Package Version](https://img.shields.io/npm/v/@density/charts.svg)](https://npmjs.com/@density/charts)
![License](https://img.shields.io/badge/License-MIT-green.svg)

This repository contains a number of charts used within other Density projects like our
[dashboard](https://github.com/densityco/dashboard) to render count data, show trends, and help
Density customers understand the data that their units have collected.

## Why Open Source?
We want to make it as easy as possible to integrate Density data into your internal tools. Providing
charts that make this process seamless makes the process easier for those building the internal
tools but also gives examples as to the way we present count data visually within systems such as
out dashboard and dispatch email alerts.

## Getting started
```
$ git clone git@github.com:densityco/charts.git
$ cd charts/
$ npm install
$ npm run install-all # install all dependencies in each chart subpackage
$ npm start # start the storybook
```

### This uses React Storybook.
This project relies heavily on react storybook, which is a open source system for displaying react
components while in development. It supports hot reload and allows one to see all possible states of
a component while developing. Basically, it's awesome.

### Project Structure
```
.
├── charts                # All charts live inside the charts folder.
│   ├── drift-chart
│   │   ├── index.js      # All of our chart code.
│   │   ├── story.js      # A bunch of test cases for our chart, via react-storybook.
│   │   ├── styles.scss   # Styles for our chart.
│   │   └── package.json  # Each chart is is own package with its own dependencies.
│   │
│   └── index.js          # A few utility functions that make the package work.
├── make-chart            # A generator to make new charts.
├── package.json
└── stories               # All stories from all charts are symlinked into the root stories folder.
    └── drift-chart.js -> ../charts/drift-chart/story.js
```

### Chart structure
Each chart contains a `index.js`, which must export a function by default. That function must accept
a single element: a DOM element. This function constructs your chart and returns another function
that can be used to inject props to your chart. Here's an example:

```javascript
export default function myChart(elem) {
  // Here's where any constructing logic can happen, if required for your chart.
  // Typically here you create all the parts of your chart.
  const div = document.createElement('div');
  elem.appendChild(div);

  return (props={}) => {
    // And in here, you provide any update logic. Since variables in the construting function are
    // closed over you can use them down here, too.

    div.innerHTML = `Hello ${props.name || 'World'}! I'm a super-basic chart!`;
  }
}

// Use a chart like this:
const updateMyChart = myChart(document.getElementById('my-chart-root'));
updateMyChart({name: 'Bob'});
```

The function is initially called when the chart first renders, and then called afterward when any
value in `props` changes.

### What are the benefits to a chart structure like this?
A basic implementation for a chart might look something like this (this is a react example, but feel
free to extrapolate to your preferred component specification):
```jsx
function GreetingChart({name}) {
  return <svg>
    <g className="chart">
      <text> Hello {name || 'World'}!</text>
    </g>
  </svg>;
}

ReactDOM.render(<GreetingChart name="Density" />, document.body);
```

However, rendering a chart like this in react has a few downsides:
1. It has a dependency on React. What if someone else wants to use the chart in an angular
   application? Or without a framework at all?
2. React isn't meant to be used as a charting library, and other packages like `d3` have implemented
   a lot of helpers like scales, axes, data joins, and more to make building charts easier. Also,
   trying to embed `d3` in a react component can be difficult since they will both fight over the
   DOM if not managed properly.

Instead, keeping the charts platform agnostic means that they can be used within the context of any
framework, and each chart can manage all of its own dependencies since a common dependency on react
isn't required.

### How would I render my chart in a React application?
Luckily, there's a helper function to do just that:

```javascript
import {chartAsReactComponent} from './charts';
import myChart from './charts/my-chart';
const MyChartComponent = chartAsReactComponent(myChart);

// ...

ReactDOM.render(<MyChartComponent oneProp="foo" />, document.body);
```

### What about other frameworks?
Currently, there aren't helpers for other frameworks since we aren't using those extensively at
Density. However, writing a wrapper similar to `chartAsReactComponent` above should be relatively
trivial, and if you do, we'd love a contribution with it to this library!

### How would I create a react / angular / vue / some other framework-based chart?
Here's a react example. These concepts should generally translate to any other framework that allows
"mounting" of its output into the DOM at an arbitrary location.

```javascript
import * as React from 'react';
import ReactDOM from 'react-dom';

function MyChartComponent({foo}) {
  return <span>{foo}</span>;
}

export default function myChart(elem) {
  return props => ReactDOM.render(<MyChartComponent {...props} />, elem);
}
```

### How do I contribute code?
See [CONTRIBUTING.md](CONTRIBUTING.md).
