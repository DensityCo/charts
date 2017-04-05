import './styles.scss';
import c3 from 'c3';

export default elem => (props={}) => {
  const dates = props.dates;
  const totalVisits = props.totalVisits;

  let datesWithHeader = ['Date'].concat(dates);
  let totalVisitsWithHeader = ['Total Visits'].concat(totalVisits);

  let chart = c3.generate({
    bindto: '#totalvisitschart',
    tooltip: {
      show: false
    },
    data: {
      x: 'Date',
      y: 'Total Visits',
      colors: {
        'Total Visits': '#469AFD',
      },
      columns: [
        datesWithHeader,
        totalVisitsWithHeader,
      ],
      type: 'bar',
      labels: true
    },
    legend: {
      hide: true
    },
    axis: {
      y: {
        show: false
      },
      x: {
        type: 'timeseries',
        label: {
          show: false
        },
        height: 50,
        tick: {
          format: '%-m/%-d',
          outer: false
        }
      }
    },
    bar: {
      width: {
        ratio: 0.9
      }
    }
  });

  elem.innerHTML = `<div id="totalvisitschart"></div>`;

  
}