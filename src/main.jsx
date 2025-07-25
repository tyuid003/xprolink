// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- ต้องเป็นแบบนี้เป๊ะๆ
import App from './App.jsx';
// import './index.css'; // ลบบรรทัดนี้ หรือคอมเมนต์ไว้

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);