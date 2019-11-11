import React from 'react';
// import logo from './logo.svg';
import './App.css';
import RangePicker from './components/RangePicker'

function App() {
  return (
    <div className="App">
      <div className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>This is a testing playground</p>
        <div>
          <RangePicker selectedStartDate='' selectedEndDate='' visibleState={true} handleSelected={() => {}}/>
        </div>
      </div>
    </div>
  );
}

export default App;
