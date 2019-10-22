import dayjs from 'dayjs'
import { chunk } from 'lodash';
import * as React from 'react'
import styled from 'styled-components';
import IconsArrowCaretDownSolid from '../../icons/caret_down_solid.svg';

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
  handleClick: (type: string, date:string) => void
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
    for (let i = 1; i <= next; i++) { thisMonth.push({
      day: i,
      date: index + 2 > 12 ? `${year + 1}-1-${i}`: `${year}-${index+2}-${i}`,
      disable: true
    }) }
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
    // 日期面板1
    const year0 = this.getYear(selectedStartDate || today);
    const month0 = this.getMonth(selectedStartDate || today);
    // 日期面板2
    const year1 = selectedEndDate ? 
                    this.getYear(selectedEndDate) : 
                    month0 === 11 ? year0 + 1 : year0;
    const month1 = selectedEndDate ? 
                    this.getMonth(selectedEndDate) : 
                    (month0 + 1) % MonthsNumber
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

  public getYear(date: string):number {
    return dayjs(date).year()
  }

  public getMonth(date: string):number {
    return dayjs(date).month()
  }

  public handleChangeDateClick(value: number, type: string) {
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
      } else {
        this.setState({
          selectedEndDate: day.date,
        })
      }
    }
  }

  public handleMouseOver(day: IDay) {
    this.setState({
      hoverdDate: day.date
    })
  }

  public renderTableHead = () => {
    const headerDays = ['一', '二', '三', '四', '五', '六', '日'];
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
                  const selected = date === selectedStartDate || date === selectedEndDate;
                  // 是否处于合适范围内，需要加上浅蓝色北京
                  const isBetweenStartAndHover = showRangeBetweenStartAndHover && !day.disable &&
                                  ((dayjsOfDate.isAfter(dayjsOfStart) && dayjsOfDate.isBefore(dayjsOfHover)) || 
                                  (dayjsOfDate.isBefore(dayjsOfStart) && dayjsOfDate.isAfter(dayjsOfHover)))
                  const isBetweenStartAndEnd = showRangeBetweenStartAndEnd && !day.disable && dayjsOfDate.isAfter(dayjsOfStart) && dayjsOfDate.isBefore(dayjsOfEnd)
                  return (
                    <td 
                      onClick={() => { !day.disable && this.handleSelected(day) } }
                      onMouseOver={() => { !day.disable && this.handleMouseOver(day)} }
                      data-date={day.date}
                      data-disabled={day.disable}
                      data-selected={selected}
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

  public render() {
    // const { selected, today } = this.state
    const { year0, month0, year1, month1 } = this.state
    const daysOnFirstBoard: IMonth[] = chunk(daysInMonth(year0)[month0], 7);
    const daysOnSecondBoard: IMonth[] = chunk(daysInMonth(year1)[month1], 7);
    if (daysOnFirstBoard.length > 0 && daysOnFirstBoard[daysOnFirstBoard.length - 1][0].disable) {
      daysOnFirstBoard.pop()
    }
    if (daysOnSecondBoard.length > 0 && daysOnSecondBoard[daysOnSecondBoard.length - 1][0].disable) {
      daysOnSecondBoard.pop()
    }
    return (
      <StyledRangePickerWrapper>
        <div className='month-wrapper'>
          <header>
            <p>
              <span onClick={() => { this.handleChangeDateClick(-1, 'year0') }}>
                <IconsArrowCaretDownSolid/>
              </span>
              <span>{`${year0} 年`}</span>
              <span onClick={() => { this.handleChangeDateClick(1, 'year0') }}>
                <IconsArrowCaretDownSolid/>
              </span>
            </p>
            <p>
              <span onClick={() => { this.handleChangeDateClick(-1, 'month0') }}>
                <IconsArrowCaretDownSolid/>
              </span>
              <span>{`${month0 + 1} 月`}</span>
              <span onClick={() => { this.handleChangeDateClick(1, 'month0') }}>
                <IconsArrowCaretDownSolid/>
              </span>
            </p>
          </header>
          <table cellSpacing={0}>
            { this.renderTableHead() }
            { this.renderTableBody(daysOnFirstBoard) }
          </table>
        </div>
        <div className='month-wrapper'>
          <header>
            <p>
              <span onClick={() => { this.handleChangeDateClick(-1, 'year1') }}>
                <IconsArrowCaretDownSolid/>
              </span>
              <span>{`${year1} 年`}</span>
              <span onClick={() => { this.handleChangeDateClick(1, 'year1') }}>
                <IconsArrowCaretDownSolid/>
              </span>
            </p>
            <p>
              <span onClick={() => { this.handleChangeDateClick(-1, 'month1') }}>
                <IconsArrowCaretDownSolid/>
              </span>
              <span>{`${month1 + 1} 月`}</span>
              <span onClick={() => { this.handleChangeDateClick(1, 'month1') }}>
                <IconsArrowCaretDownSolid/>
              </span>
            </p>
          </header>
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
    padding: 10px;
    box-sizing: border-box;
    
    header {
      height: 40px;
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
        margin: 4px;
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
