import React from 'react';
import styled from 'styled-components';

interface CheckboxProps {
  disabled: boolean;
  checked: boolean;
  children: any;
  onCheckboxClick: (checked: boolean) => void;
}
export const Checkbox = (props: CheckboxProps) => {
  const { children, disabled, checked } = props;
  const onCheckboxClick = () => {
    props.onCheckboxClick(!checked);
  };
  return (
    <StyledSpan
      className={`${disabled && 'disabled'} ${checked && 'checked'}`}
      onClick={onCheckboxClick}
    >
      {children}
    </StyledSpan>
  );
};

const StyledSpan = styled.span`
  font-size: 12px;
  width: 22px;
  height: 22px;
  line-height: 22px;
  display: inline-block;
  text-align: center;
  border-radius: 2px;
  margin: 3px;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  text-size-adjust: 100%;
  &.disabled {
    color: #a5a5a5;
    cursor: not-allowed;
  }
  &.checked {
    color: white;
    background: #6da0e3;
  }
  &:hover {
    &:not(.checked) {
      &:not(.disabled) {
        background: rgba(109, 160, 227, 0.2);
        color: #6da0e3;
      }
    }
  }
  &:last-child {
    padding-right: 2px;
  }
`;
// 这里的 padding-right 就是为了适配 10 这个数字看起来稍微有些不居中的问题
