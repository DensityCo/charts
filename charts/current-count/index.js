import './styles.scss';

import * as React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

export default elem => ({label, currentCount, capacity, lastEvent}) => {
  const lastEventDelta = lastEvent ? `Last Event: ${moment(lastEvent).fromNow()}` : '';

  ReactDOM.render(<div className="card chart-current-count">
    <div className="card-body chart-current-count-body">
      <div className="chart-current-count-header">
        <strong>{label}</strong>
        <span style={{flex: '1 1 0%'}}></span>
        <span className="chart-current-count-last-event">{lastEventDelta}</span>
      </div>

      <div className="chart-current-count-text">{currentCount}</div>

      <div className="chart-current-count-footer">
        <span>Capacity: {capacity || 'N/A'}</span>
        <div className="chart-current-count-progress-bar">
          <div
            className="chart-current-count-progress-meter"
            style={{width: `${currentCount / capacity * 100}%`}}
          ></div>
        </div>
      </div>
    </div>
  </div>, elem);
}
