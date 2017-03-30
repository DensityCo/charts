import './styles.scss';

export default function totalVisits(elem, props={}) {
  elem.innerHTML = `Hello ${props.name || 'World'}! I'm a super-basic chart!`;
}
