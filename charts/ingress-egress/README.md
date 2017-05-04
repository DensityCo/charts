# Ingress Egress Chart
A plot of ingresses and egresses over time.

![Here's what it looks like.](http://i.imgur.com/BnPGCKP.png)

# Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import ingressEgress from '@density/chart-ingress-egress';
// or: const ingressEgress = require('@density/chart-ingress-egress').default;

const element = document.getElementById('chart-container');
const props = {events: []};
ingressEgress(element, props);
```

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

## Properties
- `events`: An array of `{countChange: <direction of count change>, timestamp: <iso 8601 timestamp or epoch>}` objects.

  Example:
```javascript
[
  {
    countChange: 1,                    // An ingress was recorded
    timestamp: "2017-05-04T12:51:00Z"  // on May 4th, 2017 at 12:51 UTC.
  },
  {
    countChange: -1,                   // An egress was recorded
    timestamp: "2017-05-04T12:54:00Z"  // on May 4th, 2017 at 12:54 UTC.
  },
  ...
]
```

- `graphDurationInMin` *(optional)*: An integer representing the duration in minutes the chart
  should display. Events that are older than this value will not be shown.

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
