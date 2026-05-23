import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App';
import axios from 'axios'; // 1. Import Axios
import { API_BASE_URL } from './config'; // 2. Import your configuration address

// 3. Set the global baseURL (For local testing, swap this out with 'http://localhost:5000')
axios.defaults.baseURL = API_BASE_URL; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);