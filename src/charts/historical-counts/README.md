# Count Graph Chart
A graph of counts over time for a given space. [npm](https://npmjs.com/@density/chart-count-graph)

![Chart Example](https://i.imgur.com/IucfBdE.gif)

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
- `data`: An array of `{count: <count at a given time>, timestamp: <iso 8601 timestamp>, flag?: <boolean>}` objects. Any objects with the `"flag"` property set to `true` will draw in a flag at that timestamp with its count. Data must be in chronological order.
  Example: `[{"count": 4, "timestamp": "2017-03-28T12:00:00.000Z"}, {"count": 3, "timestamp": "2017-03-28T12:01:00.000Z", "flag": true}]`

- `start` *(optional)* A [moment](momentjs.com) that will be used as the starting point of the graph. If omitted, the graph will fit its data.

- `end` *(optional)* A [moment](momentjs.com) that will be used as the ending point of the graph. If omitted, the graph will fit its data.

- `width` *(optional)* An integer that denotes the width of this chart in pixels. Defaults to 1000.

- `height` *(optional)* An integer that denotes the width of this chart in pixels. Defaults to 400.

- `initialCount` *(optional)* An integer to specify what the count was before the first event. Defaults to 0.

- `xAxisResolution` *(optional)* A value of either `hour` (the default), `day`, or `week`. This
  value determines the distance between ticks on the x axis. This is important because for large
  time spans, a value of `hour` will produce too many labels and they will all collide into a big
  blob. Not good.

- `capacity` *(optional)* A value used to draw the light-blue filled region behind the graph. This
  traditionally (in the graphs that we've used in our dashboard thus-far) indicated the capacity in
  people that a space can hold. Defaults to `null`, which won't draw a capacity line.

- `timeZone` *(optional)* An IANA timezone as specified
  [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) that the graph should
  translate all datapoints and axis labels into prior to rendering. Defaults to `UTC`, which doesn't
  shift the datapoints.

- `timeZoneFormat` *(optional)* A callback that is passed the current IANA timezone and is expected
  to return a shorter time zone formatting string to include in the bottom overlay. This should only
  be used if `bottomOverlayLabelFormat` is not specified. For example, if `timeZoneFormat={n => n
  === 'America/New_York' ? 'ET' : n}` is passed, then if the chart is rendered with
  `timeZone="America/New_York"`, then the timezone will be displayed in the bottom overlay as `HH:MM A (ET)`.

- `xAxisResolution` *(optional)* One of the values `week`, `day`, or `hour`. This value determines
  the resolution of the ticks on the x axis - one tick per week, one tick per day, or one tick per
  hour. Defaults to `hour`.

- `xAxisLabelFormat` *(optional)* A mapping function that can be used to change the format of each
  label on the x axis. Each invocation of the function is passed an ISO timestamp for the given
  datapoint, and as a return value, the actual value to render on the axis is expected. Defaults to
  a function that extracts the hour from the timestamp, and adds an `a` or `p` suffix to indicate if
  the hour is in the am or pm (ie, '5p').

- `yAxisLabelFormat` *(optional)* A mapping function that can be used to change the format of each
  label on the y axis. Each invocation of the function is passed the count at the given marker on
  the y axis, and as a return value, the actual value to render on the axis is expected. Defaults to
  a noop function.

- `bottomOverlayLabelFormat` *(optional)* A mapping function that can be used to change the format
  of each label on the x axis. Each invocation of the function is passed an ISO timestamp at the
  current position that the user has touched / moused over, and as a return value, the actual value
  to render on the axis is expected. Defaults to a function that produces values like `5:23p (ET)
  Mon Apr 2`.

- `topOverlayLabelFormat` *(optional)* A mapping function that can be used to change the format of
  the value within the top overlay box. Each invocation of the function is passed the count at the
  current position that the user has touched / moused over, and as a return value, the actual value
  to render on the axis is expected. Defaults to a noop function.

- `renderPersonIcon` *(optional)* A boolean indicating if the upper overlay box should contain the
  person icon or not. Defaults to `true`.

# How this chart is structured
```
.
├── index.js        # Contains main chart code. Other javascript files may be present.
├── package.json
├── story.js        # Contains a react-storyboard story. Use it to present different states of your chart in the parent project.
└── styles.scss     # Contains all chart styles.
```
