import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom'; // ← ЗАМЕНИТЕ BrowserRouter на HashRouter

import { App } from '@components/app/app';
import { store } from '@services/store';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        {' '}
        {/* ← HashRouter, без basename */}
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>
);