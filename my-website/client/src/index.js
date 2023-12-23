import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

// Get the element in your HTML where you want to mount the app
const container = document.getElementById('root');

// Create a root.
const root = createRoot(container);

// Initial render: Render an element to the root.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
