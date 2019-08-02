import React from 'react';
import logo from './logo.svg';
import './App.css';
import Loader from './components/Loader.jsx'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          This is a testing playground
        </p>
        <div>
          <Loader/>
        </div>
      </header>
    </div>
  );
}

export default App;
