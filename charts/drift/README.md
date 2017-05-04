# Drift Chart
A chart to render a graph of daily drifts for a space.

![Here's what it looks like.](http://i.imgur.com/9eUATma.png)


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
