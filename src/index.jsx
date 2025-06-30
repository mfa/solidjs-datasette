import { render } from 'solid-js/web';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  render(() => <App />, document.getElementById('app'));
});
