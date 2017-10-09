# %CHARTTITLE%
%CHARTDESC% [npm](https://npmjs.com/@density/chart-%CHARTDASH%)

*TODO: ADD PICTURE OF CHART*

# Using this chart
This chart has a single default export. This exported function takes two arguments: a dom element,
and an object full of properties. When called, this chart will render the chart inside the given DOM
element. See the below example.

```javascript
import %CHARTCAMEL% from '@density/chart-%CHARTDASH%';
// or: const %CHARTCAMEL% = require('@density/chart-%CHARTDASH%').default;

const element = document.getElementById('chart-container');
const props = {name: 'Bob'};

// Make your chart
const updateData = %CHARTCAMEL%(element);

// Give it new data
updateData(props);
```

## Properties

*TODO: ADD CHART PROPERTIES*

In addition, if you'd like to render a chart in a context where the DOM is abstracted away from you,
such as a React or Angular app, then check out [our companion helper library](https://github.com/DensityCo/charts#hold-on-then-how-do-i-render-my-chart-in-my-react-app).

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
