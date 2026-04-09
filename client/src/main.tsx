import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Warm up the backend server (Render free tier cold start)
const API_BASE = import.meta.env.VITE_API_URL || '/api';
fetch(`${API_BASE}/health`).catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
