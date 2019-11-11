import { __extends, __makeTemplateObject } from "tslib";
import dayjs from 'dayjs';
import { chunk } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import CaretDownSolidImage from '../icons/caret_down_solid.svg';
var cache = {};
var MonthsNumber = 12;
function daysInMonth(year) {
    // 是否有缓存
    if (cache[year]) {
        return cache[year];
    }
    // 每月天数
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29;
    }
    var daysOfYear = daysInMonth.map(function (num, index) {
        var pre = daysInMonth[(index + 11) % MonthsNumber]; // 前一个月
        var next = daysInMonth[(index + 1) % MonthsNumber]; // 后一个月
        var thisMonth = [];
        // 获取礼拜几
        var day = new Date(year, index, 1).getDay();
        day = day || 7;
        while (--day > 0) {
            // 上个月的末尾几天
            var i = pre--;
            thisMonth.unshift({
                day: i,
                date: (index ? year : year - 1) + "-" + (index || 12) + "-" + i,
                disable: true
            });
        }
        // 本月的日期
        for (var i = 1; i <= num; i++) {
            thisMonth.push({
                day: i,
                date: year + "-" + (index + 1) + "-" + i,
                disable: false
            });
        }
        // 下个月的前几天
        for (var i = 1; i <= next; i++) {
            thisMonth.push({
                day: i,
                date: index + 2 > 12 ? year + 1 + "-1-" + i : year + "-" + (index + 2) + "-" + i,
                disable: true
            });
        }
        // 凑够 42 天，即 7 天 * 6 周
        thisMonth.length = 42;
        return thisMonth;
    });
    // 缓存
    cache[year] = daysOfYear;
    return daysOfYear;
}
var RangePicker = /** @class */ (function (_super) {
    __extends(RangePicker, _super);
    function RangePicker(props) {
        var _this = _super.call(this, props) || this;
        _this.renderTableHead = function () {
            var headerDays = [('一'), ('二'), ('三'), ('四'), ('五'), ('六'), ('日')];
            return React.createElement("thead", null,
                React.createElement("tr", null, headerDays.map(function (day) {
                    return (React.createElement("th", { key: day },
                        React.createElement("span", null, day)));
                })));
        };
        _this.renderTableBody = function (days) {
            var _a = _this.state, selectedStartDate = _a.selectedStartDate, selectedEndDate = _a.selectedEndDate, hoverdDate = _a.hoverdDate;
            var showRangeBetweenStartAndHover = selectedStartDate && !selectedEndDate && hoverdDate;
            var showRangeBetweenStartAndEnd = selectedStartDate && selectedEndDate;
            var disableDate = _this.props.disableDate;
            return React.createElement("tbody", null, days.map(function (daysArr, i) {
                return (React.createElement("tr", { key: i }, daysArr.map(function (day) {
                    var date = day.date;
                    // dayjs 格式数据
                    var dayjsOfDate = dayjs(date);
                    var dayjsOfStart = dayjs(selectedStartDate);
                    var dayjsOfEnd = dayjs(selectedEndDate);
                    var dayjsOfHover = dayjs(hoverdDate);
                    // 是否被选中
                    var selected = dayjs(date).isSame(dayjs(selectedStartDate)) || dayjs(date).isSame(dayjs(selectedEndDate));
                    // 是否处于合适范围内，需要加上浅蓝色背景
                    var isBetweenStartAndHover = showRangeBetweenStartAndHover && !day.disable &&
                        ((dayjsOfDate.isAfter(dayjsOfStart) && dayjsOfDate.isBefore(dayjsOfHover)) ||
                            (dayjsOfDate.isBefore(dayjsOfStart) && dayjsOfDate.isAfter(dayjsOfHover)));
                    var isBetweenStartAndEnd = showRangeBetweenStartAndEnd && !day.disable && dayjsOfDate.isAfter(dayjsOfStart) && dayjsOfDate.isBefore(dayjsOfEnd);
                    var disabledByProps = disableDate ? disableDate(date) : false;
                    var dateDisabled = disabledByProps || day.disable;
                    return (React.createElement("td", { onClick: function () { !dateDisabled && _this.handleSelected(day); }, onMouseOver: function () { !dateDisabled && _this.handleMouseOver(day); }, "data-date": day.date, "data-disabled": dateDisabled, "data-selected": !dateDisabled && selected, "data-inrange": isBetweenStartAndHover || isBetweenStartAndEnd, key: day.date },
                        React.createElement("span", null, day.day)));
                })));
            }));
        };
        _this.renderHeader = function (boardIndex, year, month) {
            var otherBoardYear = _this.state["year" + (boardIndex ^ 1)];
            var otherBoardMonth = _this.state["month" + (boardIndex ^ 1)];
            var otherBoardDate = dayjs(otherBoardYear + "-" + otherBoardMonth + "-1");
            var curBoardDate = dayjs(year + "-" + month + "-1");
            var decreaseYearDisable = false, increaseYearDisable = false, decreaseMonthDisable = false, increaseMonthDisable = false;
            if (boardIndex) { // boardIndex == 1
                if (!curBoardDate.add(-1, 'year').isAfter(otherBoardDate)) {
                    decreaseYearDisable = true;
                }
                if (!curBoardDate.add(-1, 'month').isAfter(otherBoardDate)) {
                    decreaseMonthDisable = true;
                }
            }
            else { // boardIndex == 0
                if (!curBoardDate.add(1, 'year').isBefore(otherBoardDate)) {
                    increaseYearDisable = true;
                }
                if (!curBoardDate.add(1, 'month').isBefore(otherBoardDate)) {
                    increaseMonthDisable = true;
                }
            }
            return React.createElement("div", { className: 'header' },
                React.createElement("p", null,
                    React.createElement("span", { "data-disabled": decreaseYearDisable, onClick: function () { !decreaseYearDisable && _this.handleChangeMonthBoardClick(-1, "year" + boardIndex); } },
                        React.createElement("img", { src: CaretDownSolidImage })),
                    React.createElement("span", null, year + " \u5E74"),
                    React.createElement("span", { "data-disabled": increaseYearDisable, onClick: function () { !increaseYearDisable && _this.handleChangeMonthBoardClick(1, "year" + boardIndex); } },
                        React.createElement("img", { src: CaretDownSolidImage }))),
                React.createElement("p", null,
                    React.createElement("span", { "data-disabled": decreaseMonthDisable, onClick: function () { !decreaseMonthDisable && _this.handleChangeMonthBoardClick(-1, "month" + boardIndex); } },
                        React.createElement("img", { src: CaretDownSolidImage })),
                    React.createElement("span", null, month + 1 + " \u6708"),
                    React.createElement("span", { "data-disabled": increaseMonthDisable, onClick: function () { !increaseMonthDisable && _this.handleChangeMonthBoardClick(1, "month" + boardIndex); } },
                        React.createElement("img", { src: CaretDownSolidImage }))));
        };
        var today = dayjs().format('YYYY-MM-DD');
        var _a = _this.props, selectedStartDate = _a.selectedStartDate, selectedEndDate = _a.selectedEndDate;
        // 日期面板 右侧
        var year1 = _this.getYear(selectedEndDate || today);
        var month1 = _this.getMonth(selectedEndDate || today);
        // 日期面板 左侧
        var year0 = selectedStartDate ? _this.getYear(selectedStartDate) : year1 - (month1 === 0 ? 1 : 0);
        var month0 = selectedStartDate ? _this.getMonth(selectedStartDate) : (month1 + 11) % MonthsNumber;
        // 两个面板的月份不可以一样
        if (year0 === year1 && month0 === month1) {
            month1 = (month0 + 1) % MonthsNumber;
            year1 = year0 + (month0 === 11 ? 1 : 0);
        }
        _this.state = {
            today: today,
            year0: year0,
            month0: month0,
            year1: year1,
            month1: month1,
            selectedStartDate: selectedStartDate,
            selectedEndDate: selectedEndDate,
            hoverdDate: ''
        };
        return _this;
    }
    RangePicker.prototype.componentDidUpdate = function (prevProps) {
        var _a = this.props, selectedStartDate = _a.selectedStartDate, selectedEndDate = _a.selectedEndDate, visibleState = _a.visibleState;
        var prevSelectedStartDate = prevProps.selectedStartDate, prevSelectedEndDate = prevProps.selectedEndDate, preVisibleState = prevProps.visibleState;
        if (selectedStartDate !== prevSelectedStartDate || selectedEndDate !== prevSelectedEndDate || (visibleState && !preVisibleState)) {
            this.setState({
                selectedEndDate: selectedEndDate,
                selectedStartDate: selectedStartDate
            });
        }
    };
    RangePicker.prototype.getYear = function (date) {
        return dayjs(date).year();
    };
    RangePicker.prototype.getMonth = function (date) {
        return dayjs(date).month();
    };
    RangePicker.prototype.handleChangeMonthBoardClick = function (value, type) {
        var currentState = this.state;
        var nextState = {};
        if (type.match('year')) {
            // 年份修改
            nextState[type] = currentState[type] + value;
            this.setState(nextState);
        }
        else {
            // 月份修改
            var month = currentState[type];
            var yearType = type.replace('month', 'year');
            var year = currentState[yearType];
            month += value;
            if (month > 11) {
                year++;
                month = 0;
            }
            if (month < 0) {
                year--;
                month = 11;
            }
            nextState[type] = month;
            nextState[yearType] = year;
        }
        this.setState(nextState);
    };
    RangePicker.prototype.handleSelected = function (day) {
        var _a = this.state, selectedStartDate = _a.selectedStartDate, selectedEndDate = _a.selectedEndDate;
        var handleSelected = this.props.handleSelected;
        if ((!selectedStartDate && !selectedEndDate) || (selectedStartDate && selectedEndDate)) {
            this.setState({
                selectedStartDate: day.date,
                selectedEndDate: ''
            });
        }
        else if (selectedStartDate && !selectedEndDate) {
            // 新选择的日期可能会在之前日期的前面，此时要交换 state 中 start 和 end 的位置
            if (dayjs(day.date).isBefore(selectedStartDate)) {
                this.setState({
                    selectedStartDate: day.date,
                    selectedEndDate: selectedStartDate,
                });
                handleSelected(day.date, selectedStartDate);
            }
            else {
                this.setState({
                    selectedEndDate: day.date,
                });
                handleSelected(selectedStartDate, day.date);
            }
        }
    };
    RangePicker.prototype.handleMouseOver = function (day) {
        this.setState({
            hoverdDate: day.date
        });
    };
    RangePicker.prototype.render = function () {
        // const { selected, today } = this.state
        var _a = this.state, year0 = _a.year0, month0 = _a.month0, year1 = _a.year1, month1 = _a.month1;
        var daysOnFirstBoard = chunk(daysInMonth(year0)[month0], 7);
        var daysOnSecondBoard = chunk(daysInMonth(year1)[month1], 7);
        return (React.createElement(StyledRangePickerWrapper, null,
            React.createElement("div", { className: 'month-wrapper' },
                this.renderHeader(0, year0, month0),
                React.createElement("table", { cellSpacing: 0 },
                    this.renderTableHead(),
                    this.renderTableBody(daysOnFirstBoard))),
            React.createElement("div", { className: 'month-wrapper' },
                this.renderHeader(1, year1, month1),
                React.createElement("table", { cellSpacing: 0 },
                    this.renderTableHead(),
                    this.renderTableBody(daysOnSecondBoard)))));
    };
    return RangePicker;
}(React.Component));
export default RangePicker;
export var StyledRangePickerWrapper = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: row;\n  width: 460px;\n  height: 255px;\n  background: white;\n  color: rgba(0,0,0,.65);\n  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);\n  .month-wrapper {\n    display: flex;\n    flex-direction: column;\n    width: 50%;\n    height: 100%;\n    padding: 0 10px 10px;\n    box-sizing: border-box;\n    font-size: 12px;\n    \n    .header {\n      height: 35px;\n      line-height: 40px;\n      display: flex;\n      flex-direction: row;\n      justify-content: space-around;\n      p {\n        display: flex;\n        flex-direction: row;\n        margin: 0;\n        span {\n          img {\n            width: 20px;\n            transform: rotate(90deg);\n            position: relative;\n            top: 5px;\n            path {\n              fill: #a5a5a5;\n            }\n          }\n        }\n        span[data-disabled=true] {\n          cursor: not-allowed;\n        }\n        span:nth-child(2) {\n          margin: 0 5px;\n        }\n        span:last-child {\n          img {\n            transform: rotate(-90deg);\n            left: -1px;\n          }\n        }\n      }\n    }\n\n    table {\n      span {\n        width: 22px;\n        height: 22px;\n        line-height: 22px;\n        display: inline-block;\n        text-align: center;\n        border-radius: 2px;\n        margin: 3px;\n      }\n      th {\n        span {\n          color: #a5a5a5;\n        }\n      }\n      td {\n        span:hover {\n          background: rgba(109, 160, 227, 0.2);\n          color: #6da0e3;\n          cursor: pointer;\n        }\n      }\n      td:nth-child(6) {\n        color: #8ab3e9\n      }\n      td[data-disabled=true] {\n        color: #a5a5a5!important;\n        span:hover {\n          background: white;\n          color: #a5a5a5;\n          cursor: not-allowed;\n        }\n      }\n      td[data-selected=true] {\n        span {\n          background: #6da0e3;\n          color: white;\n        }\n        span:hover {\n          background: #6da0e3;\n          color: white;\n        }\n      }\n      td[data-inrange=true] {\n        span {\n          background: rgba(109, 160, 227, 0.2);\n          color: #6da0e3;\n        }\n      }\n    }\n  }\n"], ["\n  display: flex;\n  flex-direction: row;\n  width: 460px;\n  height: 255px;\n  background: white;\n  color: rgba(0,0,0,.65);\n  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);\n  .month-wrapper {\n    display: flex;\n    flex-direction: column;\n    width: 50%;\n    height: 100%;\n    padding: 0 10px 10px;\n    box-sizing: border-box;\n    font-size: 12px;\n    \n    .header {\n      height: 35px;\n      line-height: 40px;\n      display: flex;\n      flex-direction: row;\n      justify-content: space-around;\n      p {\n        display: flex;\n        flex-direction: row;\n        margin: 0;\n        span {\n          img {\n            width: 20px;\n            transform: rotate(90deg);\n            position: relative;\n            top: 5px;\n            path {\n              fill: #a5a5a5;\n            }\n          }\n        }\n        span[data-disabled=true] {\n          cursor: not-allowed;\n        }\n        span:nth-child(2) {\n          margin: 0 5px;\n        }\n        span:last-child {\n          img {\n            transform: rotate(-90deg);\n            left: -1px;\n          }\n        }\n      }\n    }\n\n    table {\n      span {\n        width: 22px;\n        height: 22px;\n        line-height: 22px;\n        display: inline-block;\n        text-align: center;\n        border-radius: 2px;\n        margin: 3px;\n      }\n      th {\n        span {\n          color: #a5a5a5;\n        }\n      }\n      td {\n        span:hover {\n          background: rgba(109, 160, 227, 0.2);\n          color: #6da0e3;\n          cursor: pointer;\n        }\n      }\n      td:nth-child(6) {\n        color: #8ab3e9\n      }\n      td[data-disabled=true] {\n        color: #a5a5a5!important;\n        span:hover {\n          background: white;\n          color: #a5a5a5;\n          cursor: not-allowed;\n        }\n      }\n      td[data-selected=true] {\n        span {\n          background: #6da0e3;\n          color: white;\n        }\n        span:hover {\n          background: #6da0e3;\n          color: white;\n        }\n      }\n      td[data-inrange=true] {\n        span {\n          background: rgba(109, 160, 227, 0.2);\n          color: #6da0e3;\n        }\n      }\n    }\n  }\n"])));
var templateObject_1;
