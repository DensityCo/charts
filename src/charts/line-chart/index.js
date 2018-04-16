import './styles.scss';

export default function lineChart(elem, props={}) {
  // Here's where any constructing logic can happen, if required for your chart.
  // Typically here you create all the parts of your chart.
  const div = document.createElement('div');
  elem.appendChild(div);

  return (props={}) => {
    // And in here, you provide any update logic. Since variables in the construting function are
    // closed over you can use them down here, too.

    div.innerHTML = `Hello ${props.name || 'World'}! I'm a super-basic chart!`;
  }
}
