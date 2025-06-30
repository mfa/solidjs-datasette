import { render } from 'solid-js/web';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    render(() => <App />, appElement);
  } else {
    console.error('The element with ID "app" does not exist in the document.');
  }
});
