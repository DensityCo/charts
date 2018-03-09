# Real Time Count Chart
A plot of ingresses and egresses over time. [npm](https://npmjs.com/@density/chart-ingress-egress)

![Here's what it looks like.](http://i.imgur.com/14N6bhT.png)

# Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import realTimeCount from '@density/chart-real-time-count';
// or: const realTimeCount = require('@density/chart-real-time-count').default;

const element = document.getElementById('chart-container');
const props = {events: []};
realTimeCount(element, props);
```

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

## Properties
- `events`: An array of `{countChange: <direction of count change>, timestamp: <iso 8601 timestamp, epoch, or moment>}` objects.

- `eventMarkerRadius`: The event marker radius (the dots on the graph) in px
- `eventMarkerSpacingFromMidLine`: Spacing between the event marker and the middle line
- `eventMarkerInfoPopupHeight`: Height of the info popup, not including the pointer.
- `eventMarkerInfoPopupWidth`: Width of the info popup that shows if more than one event happened.
- `eventMarkerInfoPopupSpacingFromMarker`: Spacing between the info popup and the event marker.
- `eventMarkerInfoPopupCaretWidth`: Size of the caret on the top or bottom of the info popup.
- `eventMarkerInfoPopupFontSize`:  FOnt size of the count label inside of the info popup.

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

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
