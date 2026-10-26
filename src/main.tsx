import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UmamiAnalytics } from './components/UmamiAnalytics';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <UmamiAnalytics />
  </React.StrictMode>
);
