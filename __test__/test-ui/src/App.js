import React from 'react';
// import logo from './logo.svg';
import './App.css';
import RangePicker from './components/RangePicker'
import { Checkbox } from './components/Checkbox'

function App() {
  return (
    <div className="App">
      <div className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>This is a testing playground</p>
        <div>
          <RangePicker selectedStartDate='' selectedEndDate='' visibleState={true} handleSelected={() => {}}/>
        </div>
        <div className='checkbox-wrapper'>
          <Checkbox style={{ float: 'left' }}/>
          <p>👆这是一个 checkbox</p>
        </div>
      </div>
    </div>
  );
}

export default App;
