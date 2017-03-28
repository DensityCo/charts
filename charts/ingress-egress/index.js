import React from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';

// Some helpers to make the svg code a lot cleaner
function perc(n) { return `${n}%`; }
function px(n) { return `${n}px`; }
function calc(...args) { return `calc(${args.join(' ')})`; }

const brandPrimary = '#4198ff';

// ------------------------------------------------------------------------------
// Constants required for rendering the graph
// ------------------------------------------------------------------------------
const eventMarkerWidthInPx = 5; // The event marker width
const eventMarkerHeightInPx = 10; // The event marker height
const paddingBetweenStackedEventsInPx = 2; // how much spacing in the y direction to put between stacked events

// A graph for showing real time events as they happen to a space
// Roughly, it's implemented by having two "stacking contexts", one for +1 events and one for -1
// events. As +1 events some in, they're added to the +1 stacking context until they get too old,
// and then the stacking context is cleared and a new stack forms. The same thing happens for -1
// events. It's important to realize that +1 and -1 events are treated independantly in the below
// implementation.
export function IngressEgressChart({
  events,
  graphDurationInMin,
  stackEventDistance,
  relativeTimeSmoothing,
}) {
  console.log(events);
  let graphDurationInMs = graphDurationInMin * 60 * 1000;

  // Given a time, convert it the the percentage of the graph that it should be displayed at.
  function convertTimeToPercent(time) {
    return time / graphDurationInMs * 100;
  }

  // Start by getting the current time.
  let now = (new Date()).getTime();

  // Store the last relative timestamp of each event, both in the +1 and the -1 direction. THis is
  // because the "stacking contexts" of both diretions are really independant.
  let lastEventRelativeTimestamp = {};
  lastEventRelativeTimestamp[1] = null;
  lastEventRelativeTimestamp[-1] = null;

  // This is a similar idea to the above (with the +1 and -1 keys), but this time, instead of
  // tracking the last event's tiemstamp we're tracking how high the current "stacking context"
  // is. For example, if I had two +1 events, one right after another, and they stacked, the
  // stacking context under key +1 would be 2.
  let stackingContextAmounts = {};
  stackingContextAmounts[1] = 0;
  stackingContextAmounts[-1] = 0;

  // This is the x position of the current stack, whether is be only one event or a bunch of events.
  // This is requried because events in a stack beed to be aligned vertically.
  let stackStartPosition = 0;

  // Render each event. Events above the line are +1s on the space, events below the line are -1s on
  // the space. Events that are within `stackEventDistance` of each other are stacked on top of each
  // other as per the mockups.
  let eventRectangles = events.map(({timestamp, count_change: direction}, ct) => {
    // ------------------------------------------------------------------------------
    // Get a relative timestamp
    // ------------------------------------------------------------------------------

    // Calcualte a relative timestamp for the event. By relative timestamp, I mean a number where an
    // event that happened at the current time would be zero, and events that happened say one
    // minute ago would be 60000 (1 minute in milliseconds).
    let eventTime = (new Date(timestamp)).getTime();
    let relativeTimestamp = Math.floor((now - eventTime) / relativeTimeSmoothing) * relativeTimeSmoothing;

    // ------------------------------------------------------------------------------
    // Stacking of events
    // ------------------------------------------------------------------------------

    // Calculate how much the given event should stack. If the last event's timestamp is within
    // `stackEventDistance` of the previous timestamp, then we should stack.
    let stackAmount = 0;
    if (
      typeof lastEventRelativeTimestamp[direction] === 'number' &&
      Math.abs(lastEventRelativeTimestamp[direction] - relativeTimestamp) <= stackEventDistance
    ) {
      // this event should be stacked. Increment the stacking context...
      let eventStackHeight = ++stackingContextAmounts[direction];

      // the calculate how high (in px) to stack this event.
      stackAmount = eventStackHeight * (eventMarkerHeightInPx + paddingBetweenStackedEventsInPx);
      // The stack start position stays unchanged because we want this event to align with the event
      // below it.
    } else {
      // In case this event is the start of a stack, set the stack start position for the next
      // iteration.
      stackStartPosition = relativeTimestamp;
      stackingContextAmounts[direction] = 0;
    }

    // Clear stacking context
    // We reset to -1 because we want stacking to start at zero, and resetting to zero (which is
    // what would make sense here) means that when one is added we'd get one. Resetting to -1
    // means when one is added we get zero (what's expected).


    // ------------------------------------------------------------------------------
    // Render the rectangle
    // ------------------------------------------------------------------------------

    // For the next run, set the last timestamp to be the current one.
    lastEventRelativeTimestamp[direction] = relativeTimestamp;

    return <rect
      key={`${direction}:${timestamp}`}

      x={calc(
        // Render the current time from the right (that's the 100 - bit).
        perc(100 - convertTimeToPercent(stackStartPosition)),
        // Subtract out the width of an event so that the whole event will show on render.
        '-', px(eventMarkerWidthInPx)
      )}
      y={direction === 1 ?
        // direction is 1, so be over the line. Any stacking should go upward.
        calc(perc(50), '-', px(eventMarkerHeightInPx), '-', px(stackAmount)) :
        // direction is -1, so be under the line. Any stacking should go downward.
        calc(perc(50), '+', px(stackAmount))
      }

      height={px(eventMarkerHeightInPx)}
      width={px(eventMarkerWidthInPx)}

      fill={
        direction === 1 ?
        brandPrimary : // when direction is 1, make the rectangle blue
        '#8e9299' // when direction is -1, make the rectangle black(ish)
      }
    />;
  });

  return <svg width="100%" height="100%">
    {eventRectangles}

    {/* The midline */}
    <line
      x1={0}
      y1={perc(50)}
      x2={perc(100)}
      y2={perc(50)}
      strokeWidth={1}
      stroke="#4A5159"
    />
  </svg>;
}
IngressEgressChart.defaultProps = {
  events: [],
  graphDurationInMin: 10, // in minutes

  stackEventDistance: 10 * 1000, // The amount of miiliseconds between stacking groups
  relativeTimeSmoothing: 100, // in ms. The effect this has is considering all values around a given timestamp the same value.
};



export function IngressEgressCard(graphProps) {
  // Get the graph's length in minutes for drawing the scale below.
  let maxStep = graphProps.graphDurationInMin || 10;

  return <div className='card card-dark' style={{
    height: 162,
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative',
  }}>
    <span className="real-time-card-legend">
      <div className="rect rect-in" style={{width: eventMarkerWidthInPx, height: eventMarkerHeightInPx}} />
      In
      <div className="rect rect-out" style={{width: eventMarkerWidthInPx, height: eventMarkerHeightInPx}} />
      Out
    </span>
    <IngressEgressChart {...graphProps} />
    <ul className="real-time-card-labels">
      <li>{maxStep}m ago</li>
      <li>{maxStep * 0.75}m ago</li>
      <li>{maxStep * 0.5}m ago</li>
      <li>{maxStep * 0.25}m ago</li>
      <li>Now</li>
    </ul>
  </div>;
}


export default function ingressEgress(elem, props={}) {
  ReactDOM.render(<IngressEgressCard {...props} />, elem);
}
