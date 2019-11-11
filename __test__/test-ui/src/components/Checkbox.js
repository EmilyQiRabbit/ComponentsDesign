import { __makeTemplateObject } from "tslib";
import React, { useState } from 'react';
import styled from 'styled-components';
export var Checkbox = function () {
    var _a = useState(false), checked = _a[0], setChecked = _a[1];
    return React.createElement(StyledCheckbox, { className: "" + (checked ? 'checked' : ''), onClick: function () {
            setChecked(!checked);
        } });
};
var StyledCheckbox = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  width: 16px;\n  height: 16px;\n  border: 1px solid #d9d9d9;\n  border-radius: 2px;\n  cursor: pointer;\n  position: relative;\n  &:hover {\n    border-color: #1890ff;\n  }\n  &.checked {\n    background-color: #1890ff;\n    border-color: #1890ff;\n    &:after{\n      position: absolute;\n      top: 49%;\n      left: 20%;\n      display: table;\n      width: 5.71428571px;\n      height: 9.14285714px;\n      border: 2px solid #fff;\n      border-top: 0;\n      border-left: 0;\n      transform: rotate(45deg) scale(1) translate(-50%, -50%);\n      opacity: 1;\n      transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;\n      content: ' ';\n    }\n  }\n"], ["\n  width: 16px;\n  height: 16px;\n  border: 1px solid #d9d9d9;\n  border-radius: 2px;\n  cursor: pointer;\n  position: relative;\n  &:hover {\n    border-color: #1890ff;\n  }\n  &.checked {\n    background-color: #1890ff;\n    border-color: #1890ff;\n    &:after{\n      position: absolute;\n      top: 49%;\n      left: 20%;\n      display: table;\n      width: 5.71428571px;\n      height: 9.14285714px;\n      border: 2px solid #fff;\n      border-top: 0;\n      border-left: 0;\n      transform: rotate(45deg) scale(1) translate(-50%, -50%);\n      opacity: 1;\n      transition: all .2s cubic-bezier(.12, .4, .29, 1.46) .1s;\n      content: ' ';\n    }\n  }\n"])));
var templateObject_1;
