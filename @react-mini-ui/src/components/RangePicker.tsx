import dayjs from 'dayjs'
import { chunk } from 'lodash';
import * as React from 'react'
import styled from 'styled-components';
import IconsArrowCaretDownSolid from '../icons/arrow/caret_down_solid.svg';

interface IDay {
  day: number,
  date: string,
  disable: boolean,
}

interface IMonth {
  [index: number]: IDay
}

// interface IYears {
//   [index: number]: IMonth
// }

interface IProps {
  selectedStartDate: string,
  selectedEndDate: string,
  handleSelected: (startTime: string, endTime: string) => void
  disableDate?: (date: string) => boolean
  visibleState: boolean
}

interface IState {
  today: string,
  year0: number,
  month0: number,
  year1: number,
  month1: number,
  selectedStartDate: string,
  selectedEndDate: string,
  hoverdDate: string,
}

const cache: {
  [index: number]: any[]
} = {}

const MonthsNumber = 12

function daysInMonth(year: number):any[] {
  // 是否有缓存
  if (cache[year]) { return cache[year] }
  // 每月天数
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29
  } 

  const daysOfYear = daysInMonth.map((num, index) => {
    let pre = daysInMonth[(index + 11) % MonthsNumber] // 前一个月
    let next = daysInMonth[(index + 1) % MonthsNumber] // 后一个月

    const thisMonth = []
    // 获取礼拜几
    let day = new Date(year, index, 1).getDay()
    day = day || 7

    while (--day > 0) {
      // 上个月的末尾几天
      const i = pre--
      thisMonth.unshift({
        day: i,
        date: `${index ? year : year - 1}-${index || 12}-${i}`,
        disable: true
      }) 
    }
    // 本月的日期
    for (let i = 1; i <= num; i++) {
      thisMonth.push({
        day: i,
        date: `${year}-${index + 1}-${i}`,
        disable: false
      }) 
    }
    // 下个月的前几天
    for (let i = 1; i <= next; i++) { 
      thisMonth.push({
        day: i,
        date: index + 2 > 12 ? `${year + 1}-1-${i}`: `${year}-${index+2}-${i}`,
        disable: true
      }) 
    }
    // 凑够 42 天，即 7 天 * 6 周
    thisMonth.length = 42
    return thisMonth
  })
  // 缓存
  cache[year] = daysOfYear
  return daysOfYear
}

export default class RangePicker extends React.Component<IProps, IState> {
  constructor(props:any) {
    super(props)
    const today = dayjs().format('YYYY-MM-DD');
    const { selectedStartDate, selectedEndDate } = this.props;
    // 日期面板 右侧
    let year1 = this.getYear(selectedEndDate || today);
    let month1 = this.getMonth(selectedEndDate || today);
    // 日期面板 左侧
    const year0 = selectedStartDate ? this.getYear(selectedStartDate) : year1 - (month1 === 0 ? 1 : 0);
    const month0 = selectedStartDate ? this.getMonth(selectedStartDate) : (month1 + 11) % MonthsNumber;
    // 两个面板的月份不可以一样
    if (year0 === year1 && month0 === month1) {
      month1 = (month0 + 1) % MonthsNumber;
      year1 = year0 + (month0 === 11 ? 1 : 0);
    }
    this.state = {
      today,
      year0,
      month0,
      year1,
      month1,
      selectedStartDate,
      selectedEndDate,
      hoverdDate: ''
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { selectedStartDate, selectedEndDate, visibleState } = this.props;
    const { selectedStartDate: prevSelectedStartDate, selectedEndDate: prevSelectedEndDate, visibleState: preVisibleState } = prevProps;
    if (selectedStartDate !== prevSelectedStartDate || selectedEndDate !== prevSelectedEndDate || (visibleState && !preVisibleState)) {
      this.setState({
        selectedEndDate,
        selectedStartDate
      })
    }
  }

  public getYear(date: string):number {
    return dayjs(date).year()
  }

  public getMonth(date: string):number {
    return dayjs(date).month()
  }

  public handleChangeMonthBoardClick(value: number, type: string) {
    const currentState = this.state as any;
    const nextState = {} as any;
    if (type.match('year')) {
      // 年份修改
      nextState[type] = currentState[type] + value
      this.setState(nextState)
    } else {
      // 月份修改
      let month = currentState[type];
      const yearType = type.replace('month', 'year');
      let year = currentState[yearType];
      month += value
      if (month > 11) { 
        year++
        month = 0
      }
      if (month < 0 ) { 
        year--
        month = 11
      }
      nextState[type] = month;
      nextState[yearType] = year;
    }
    this.setState(nextState)
  }

  public handleSelected(day: IDay) {
    const { selectedStartDate, selectedEndDate } = this.state;
    const { handleSelected } = this.props;
    if ((!selectedStartDate && !selectedEndDate) || (selectedStartDate && selectedEndDate)) {
      this.setState({
        selectedStartDate: day.date,
        selectedEndDate: ''
      })
    } else if (selectedStartDate && !selectedEndDate) {
      // 新选择的日期可能会在之前日期的前面，此时要交换 state 中 start 和 end 的位置
      if (dayjs(day.date).isBefore(selectedStartDate)) {
        this.setState({
          selectedStartDate: day.date,
          selectedEndDate: selectedStartDate,
        })
        handleSelected(day.date, selectedStartDate)
      } else {
        this.setState({
          selectedEndDate: day.date,
        })
        handleSelected(selectedStartDate, day.date)
      }
    }
  }

  public handleMouseOver(day: IDay) {
    this.setState({
      hoverdDate: day.date
    })
  }

  public renderTableHead = () => {
    const headerDays = [('一'), ('二'), ('三'), ('四'), ('五'), ('六'), ('日')]
    return <thead>
      <tr>
        {
          headerDays.map((day: string) => {
            return (
              <th key={day}>
                <span>
                  {day}
                </span>
              </th>
            )
          })  
        }
      </tr>
    </thead>
  }

  public renderTableBody = (days: IMonth[]) => {
    const { selectedStartDate, selectedEndDate, hoverdDate } = this.state;
    const showRangeBetweenStartAndHover = selectedStartDate && !selectedEndDate && hoverdDate;
    const showRangeBetweenStartAndEnd = selectedStartDate && selectedEndDate;
    const { disableDate } = this.props
    return <tbody>
      {
        days.map((daysArr, i) => {
          return (
            <tr key={i}>
              {
                (daysArr as any).map((day: IDay) => {
                  const { date } = day;
                  // dayjs 格式数据
                  const dayjsOfDate = dayjs(date);
                  const dayjsOfStart = dayjs(selectedStartDate);
                  const dayjsOfEnd = dayjs(selectedEndDate);
                  const dayjsOfHover = dayjs(hoverdDate);
                  // 是否被选中
                  const selected = dayjs(date).isSame(dayjs(selectedStartDate)) || dayjs(date).isSame(dayjs(selectedEndDate));
                  // 是否处于合适范围内，需要加上浅蓝色背景
                  const isBetweenStartAndHover = showRangeBetweenStartAndHover && !day.disable &&
                                  ((dayjsOfDate.isAfter(dayjsOfStart) && dayjsOfDate.isBefore(dayjsOfHover)) || 
                                  (dayjsOfDate.isBefore(dayjsOfStart) && dayjsOfDate.isAfter(dayjsOfHover)))
                  const isBetweenStartAndEnd = showRangeBetweenStartAndEnd && !day.disable && dayjsOfDate.isAfter(dayjsOfStart) && dayjsOfDate.isBefore(dayjsOfEnd);
                  const disabledByProps = disableDate ? disableDate(date) : false;
                  const dateDisabled = disabledByProps || day.disable;
                  return (
                    <td 
                      onClick={() => { !dateDisabled && this.handleSelected(day) } }
                      onMouseOver={() => { !dateDisabled && this.handleMouseOver(day)} }
                      data-date={day.date}
                      data-disabled={dateDisabled}
                      data-selected={!dateDisabled && selected}
                      data-inrange={isBetweenStartAndHover || isBetweenStartAndEnd}
                      key={day.date}
                    >
                      <span>
                        {day.day}
                      </span>
                    </td>
                  )
                })
              }
            </tr>
          )
        })
      }
    </tbody>
  }

  renderHeader = (boardIndex: number, year: number, month: number) => {
    const otherBoardYear = (this.state as any)[`year${boardIndex^1}`]
    const otherBoardMonth = (this.state as any)[`month${boardIndex^1}`]
    const otherBoardDate = dayjs(`${otherBoardYear}-${otherBoardMonth}-1`)
    const curBoardDate = dayjs(`${year}-${month}-1`)
    let decreaseYearDisable = false, increaseYearDisable = false,
        decreaseMonthDisable = false, increaseMonthDisable = false
    if (boardIndex) { // boardIndex == 1
      if (!curBoardDate.add(-1, 'year').isAfter(otherBoardDate)) {
        decreaseYearDisable = true
      }
      if (!curBoardDate.add(-1, 'month').isAfter(otherBoardDate)) {
        decreaseMonthDisable = true
      }
    } else { // boardIndex == 0
      if (!curBoardDate.add(1, 'year').isBefore(otherBoardDate)) {
        increaseYearDisable = true
      }
      if (!curBoardDate.add(1, 'month').isBefore(otherBoardDate)) {
        increaseMonthDisable = true
      }
    }
    return <header>
      <p>
        <span data-disabled={decreaseYearDisable} onClick={() => { !decreaseYearDisable && this.handleChangeMonthBoardClick(-1, `year${boardIndex}`) }}>
          <IconsArrowCaretDownSolid/>
        </span>
        <span>{`${year} 年`}</span>
        <span data-disabled={increaseYearDisable} onClick={() => { !increaseYearDisable && this.handleChangeMonthBoardClick(1, `year${boardIndex}`) }}>
          <IconsArrowCaretDownSolid/>
        </span>
      </p>
      <p>
        <span data-disabled={decreaseMonthDisable} onClick={() => { !decreaseMonthDisable && this.handleChangeMonthBoardClick(-1, `month${boardIndex}`) }}>
          <IconsArrowCaretDownSolid/>
        </span>
        <span>{`${month + 1} 月`}</span>
        <span data-disabled={increaseMonthDisable} onClick={() => { !increaseMonthDisable && this.handleChangeMonthBoardClick(1, `month${boardIndex}`) }}>
          <IconsArrowCaretDownSolid/>
        </span>
      </p>
    </header>
  }

  public render() {
    // const { selected, today } = this.state
    const { year0, month0, year1, month1 } = this.state
    const daysOnFirstBoard: IMonth[] = chunk(daysInMonth(year0)[month0], 7);
    const daysOnSecondBoard: IMonth[] = chunk(daysInMonth(year1)[month1], 7);
    return (
      <StyledRangePickerWrapper>
        <div className='month-wrapper'>
          { this.renderHeader(0, year0, month0) }
          <table cellSpacing={0}>
            { this.renderTableHead() }
            { this.renderTableBody(daysOnFirstBoard) }
          </table>
        </div>
        <div className='month-wrapper'>
          { this.renderHeader(1, year1, month1) }
          <table cellSpacing={0}>
            { this.renderTableHead() }
            { this.renderTableBody(daysOnSecondBoard) }
          </table>
        </div>
      </StyledRangePickerWrapper>
    )
  }
}


export const StyledRangePickerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 460px;
  height: 240px;
  background: white;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  .month-wrapper {
    display: flex;
    flex-direction: column;
    width: 50%;
    height: 100%;
    padding: 0 10px 10px;
    box-sizing: border-box;
    font-size: 12px;
    
    header {
      height: 35px;
      line-height: 40px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      p {
        display: flex;
        flex-direction: row;
        span {
          svg {
            width: 20px;
            transform: rotate(90deg);
            position: relative;
            top: 5px;
            path {
              fill: #a5a5a5;
            }
          }
        }
        span[data-disabled=true] {
          cursor: not-allowed;
        }
        span:nth-child(2) {
          margin: 0 5px;
        }
        span:last-child {
          svg {
            transform: rotate(-90deg);
            left: -1px;
          }
        }
      }
    }

    table {
      span {
        width: 22px;
        height: 22px;
        line-height: 22px;
        display: inline-block;
        text-align: center;
        border-radius: 2px;
        margin: 3px;
      }
      th {
        span {
          color: #a5a5a5;
        }
      }
      td {
        span:hover {
          background: rgba(109, 160, 227, 0.2);
          color: #6da0e3;
          cursor: pointer;
        }
      }
      td:nth-child(6) {
        color: #8ab3e9
      }
      td[data-disabled=true] {
        color: #a5a5a5!important;
        span:hover {
          background: white;
          color: #a5a5a5;
          cursor: not-allowed;
        }
      }
      td[data-selected=true] {
        span {
          background: #6da0e3;
          color: white;
        }
        span:hover {
          background: #6da0e3;
          color: white;
        }
      }
      td[data-inrange=true] {
        span {
          background: rgba(109, 160, 227, 0.2);
          color: #6da0e3;
        }
      }
    }
  }
`
