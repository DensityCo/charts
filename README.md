# Density Charts
This repository contains all of our charts for displaying data. Many are written in D3, some in
react, and a few even with raw DOM apis!

## This uses React Storybook.
This project relies heavily on react storybook, which is a open source system for displaying react
components while in development. It supports hot reload and allows one to see all possible states of
a component while developing. Basically, it's awesome.

## Project Structure
```
.
├── charts                # All charts live inside the charts folder.
│   ├── drift-chart
│   │   ├── index.js      # All of our chart code.
│   │   ├── story.js      # A bunch of test cases for our chart, via react-storybook.
│   │   ├── styles.scss   # Styles for our chart.
│   │   └── package.json  # Each chart is is own package with its own dependencies.
│   │ 
│   └── index.js          # A few utility functions that make the package work.
├── make-chart            # A generator to make new charts.
├── package.json
└── stories               # All stories from all charts are symlinked into the root stories folder.
    └── drift-chart.js -> ../charts/drift-chart/story.js
```

## Getting started
```
$ git clone git@github.com:densityco/charts.git
$ cd charts/
$ npm install
$ npm run installall # install all dependencies in each chart subpackage
# npm run storybook # start the storybook
```

## Chart structure
Each chart contains a `index.js`, which must default-ly export a function. That function must accept
a single element: a DOM element. This function contructs your chart and returns another fucntion
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

### Why do it this way over a stateless React component?
Great question. We forsee a future where not all of our projects will be react-based. In fact, many
of our existing "web" projects aren't, including the marketing site and may of our internal customer
projects. Therefore, we feel that favoring react over any other technology and forcing ourselves to
use react into the future is a bad idea.

Instead, basing our charts on the raw DOM api gives us a few benefits:
- Using libraries like D3 are a pain in the context of React since they both try to control the DOM.
  Exposing a raw DOM api eliminates this problem.
- Our charts will work anywhere that the DOM api is available (Read: every browser ever.), which
  includes non-react based projects and react-based projects alike.
- A chart is just a function - no classes to worry about.

### Hold on, then how do I render my chart in my react app? 
You're full of great questions today. Luckily, there's a helper function to do just that:

```javascript
import {chartAsReactComponent} from './charts';
import myChart from './charts/my-chart';
const MyChartComponent = chartAsReactComponent(myChart);

// ...

ReactDOM.render(<MyChartComponent oneProp="foo" />, document.body);
```

### Whoa. But then how do I make a react-based chart? DID YOU THINK OF THAT? HUH? HUH?

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



## Creating a new chart
```
$ ./make-chart
Let's make a new chart.
Enter the name of your chart, in dash-case: foo-bar
Enter the name of your chart, in english (ie, `My chart`): Foo Bar
* Copying template to charts/foo-bar...
* Replacing placeholders with variations of foo-bar...
* Linking foo-bar story to stories folder...
Done!

You have a new chart in charts/foo-bar:
* charts/foo-bar/index.js contains your chart code.
* charts/foo-bar/styles.scss contains your chart styles.
* charts/foo-bar/story.js contains your react-storyboard story. Use it to present different states of your chart.

To build the storyboard and start a development server:
=> npm run storyboard
```

## Publishing to our NPM Registry

Even though all of our charts live in one repository, they all have seperate packages on our private
npm registry. Each chart has the package name of `@density/chart-MY-CHART-NAME`. Once you have a new
change and want to publish it, it's pretty easy:

1. First, make sure you have an account on our private npm registry and are logged in. Talk to @ryan
   on slack if you need to get set up.
2. Bump the version of the package (FOLLOW SEMVER!): `cd charts/my-chart && npm version [patch|minor|major]`
3. `make publish CHART=my-chart` will build the chart clean and publish the new version to the npm
   registry.
