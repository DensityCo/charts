# Total Visits
Shows the total number of visits per day over a given period of time

![Here's what it looks like.](http://i.imgur.com/Pxw2ie3.png)

# Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import totalVisits from '@density/chart-total-visits';
// or: const totalVisits = require('@density/chart-total-visits').default;

const element = document.getElementById('chart-container');
const props = {dates: [], totalVisits: []};
totalVisits(element, props);
```

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

## Properties

- `dates`: An array of dates, formatted as `YYYY-MM-DD`. Example: `["2017-05-04", "2017-05-05", ...]`
- `totalVisits`: An array of integers indicating the total number of visits for the corresponding
  day in the `dates` array.

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
