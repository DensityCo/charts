import './styles.scss';

export default function ingressEgress(elem, props={}) {
  elem.innerHTML = `Hello ${props.name || 'World'}! I'm a super-basic chart!`;
}
