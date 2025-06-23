
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // Changed path to direct relative path

// Request notification permission early
if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.log('Notification permission denied.');
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);