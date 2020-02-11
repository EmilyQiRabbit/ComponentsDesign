import { __makeTemplateObject } from "tslib";
import React, { useState } from 'react';
import styled from 'styled-components';
import '../style/checkbox.css';
export var Checkbox = function () {
    var _a = useState(false), checked = _a[0], setChecked = _a[1];
    return React.createElement(StyledCheckbox, { className: "" + (checked ? 'checked' : ''), onClick: function () {
            setChecked(!checked);
        } },
        React.createElement("span", { className: 'ripple' })); // 这个 span 用于制作波纹效果
};
var StyledCheckbox = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  width: 16px;\n  height: 16px;\n  border: 1px solid #d9d9d9;\n  border-radius: 10px;\n  cursor: pointer;\n  position: relative;\n  border-collapse: separate;\n  transition: all .3s;\n  .ripple {\n    &:after {\n      position: absolute;\n      top: -1px;\n      left: -1px;\n      width: 100%;\n      height: 100%;\n      border: 1px solid #1890ff;\n      border-radius: 2px;\n      visibility: hidden;\n      content: '';\n    }\n  }\n  &:hover {\n    border-color: #1890ff;\n  }\n  &:after{\n    position: absolute;\n    top: 49%;\n    left: 20%;\n    display: table;\n    width: 5.71428571px;\n    height: 9.14285714px;\n    border: 2px solid #fff;\n    border-top: 0;\n    border-left: 0;\n    transform: rotate(45deg) scale(1) translate(-50%, -50%);\n    opacity: 0;\n    transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;\n    content: ' ';\n  }\n  &.checked {\n    background-color: #1890ff;\n    border-color: #1890ff;\n    &:after{\n      opacity: 1;\n    }\n    .ripple {\n      &:after {\n        visibility: visible;\n        animation: checkboxEffect .36s ease-in-out;\n        animation-fill-mode: both;\n      }\n    }\n  }\n"], ["\n  width: 16px;\n  height: 16px;\n  border: 1px solid #d9d9d9;\n  border-radius: 10px;\n  cursor: pointer;\n  position: relative;\n  border-collapse: separate;\n  transition: all .3s;\n  .ripple {\n    &:after {\n      position: absolute;\n      top: -1px;\n      left: -1px;\n      width: 100%;\n      height: 100%;\n      border: 1px solid #1890ff;\n      border-radius: 2px;\n      visibility: hidden;\n      content: '';\n    }\n  }\n  &:hover {\n    border-color: #1890ff;\n  }\n  &:after{\n    position: absolute;\n    top: 49%;\n    left: 20%;\n    display: table;\n    width: 5.71428571px;\n    height: 9.14285714px;\n    border: 2px solid #fff;\n    border-top: 0;\n    border-left: 0;\n    transform: rotate(45deg) scale(1) translate(-50%, -50%);\n    opacity: 0;\n    transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;\n    content: ' ';\n  }\n  &.checked {\n    background-color: #1890ff;\n    border-color: #1890ff;\n    &:after{\n      opacity: 1;\n    }\n    .ripple {\n      &:after {\n        visibility: visible;\n        animation: checkboxEffect .36s ease-in-out;\n        animation-fill-mode: both;\n      }\n    }\n  }\n"])));
var templateObject_1;