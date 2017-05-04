# Ingress Egress Chart
A plot of ingresses and egresses over time.

![Here's what it looks like.](http://i.imgur.com/BnPGCKP.png)


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
