// client/src/App.jsx
import React from 'react';
import RedirectList from './components/RedirectList'; // <--- ต้อง import แบบนี้
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Redirect Link Manager</h1>
      <RedirectList /> {/* <--- ต้องเรียกใช้ Component แบบนี้ */}
    </div>
  );
}

export default App;