import React, { useState } from 'react';
import styled from 'styled-components';

export const Checkbox = () => {
  const [checked, setChecked] = useState(false);
  return <StyledCheckbox className={`${checked ? 'checked' : ''}`} onClick={() => {
    setChecked(!checked)
  }}></StyledCheckbox>
}

const StyledCheckbox = styled.div`
  width: 16px;
  height: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  &:hover {
    border-color: #1890ff;
  }
  &.checked {
    background-color: #1890ff;
    border-color: #1890ff;
    &:after{
      position: absolute;
      top: 49%;
      left: 20%;
      display: table;
      width: 5.71428571px;
      height: 9.14285714px;
      border: 2px solid #fff;
      border-top: 0;
      border-left: 0;
      transform: rotate(45deg) scale(1) translate(-50%, -50%);
      opacity: 1;
      transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;
      content: ' ';
    }
  }
`

