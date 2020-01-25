import React from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { PureComponent } from 'react';

const titleOptions = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
const plainOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const OUTPUT_FORMAT = 'YYYY-MM-DD';
export const DISPLAY_FORMAT = 'MM-DD';

export interface AdScheduleModel {
  date: string;
  round: number;
}

export interface RoundCheckboxState {
  checkedMap: Record<string, Set<string>>;
  prevCheckedDate: string;
}

export interface RoundCheckboxProps {
  availableRounds: Record<string, boolean>;
  dateRange?: dayjs.Dayjs[];
  defaultValue?: AdScheduleModel[];
  onChange?(data: Record<string, string[]>): void;
}

export class CheckList extends PureComponent<
  RoundCheckboxProps,
  RoundCheckboxState
> {
  // 日期范围
  private dates: string[];

  constructor(props: RoundCheckboxProps) {
    super(props);
    this.dates = this.loadDateRange(props.dateRange);
    const checkedMap = this.loadDefaultValue(props.defaultValue);
    this.dates.forEach(
      (date) => (checkedMap[date] = checkedMap[date] || new Set()),
    );
    this.state = { checkedMap, prevCheckedDate: '' };
  }

  private loadDefaultValue(
    defaults: AdScheduleModel[] | undefined,
  ): Record<string, Set<string>> {
    if (!defaults) {
      return {};
    }
    return defaults.reduce(
      (map, { date, round }) => {
        map[date] = map[date] || new Set();
        map[date].add(round + '');
        return map;
      },
      {} as Record<string, Set<string>>,
    );
  }

  componentWillReceiveProps(next: RoundCheckboxProps) {
    if (next.dateRange !== this.props.dateRange) {
      this.dates = this.loadDateRange(next.dateRange);
    }
  }

  private loadDateRange(range: dayjs.Dayjs[] | undefined): string[] {
    if (!range || !range[0] || !range[1]) {
      return [];
    }
    const dates: string[] = [];
    for (
      let k = range[0].clone();
      !k.isAfter(range[1], 'd');
      k = k.add(1, 'd')
    ) {
      dates.push(k.format(OUTPUT_FORMAT));
    }
    return dates;
  }

  onCheckboxClick = (date: string, round: string, checked: boolean) => {
    const { checkedMap } = this.state;
    const rounds = checkedMap[date] || new Set();
    if (checked) {
      rounds.add(round);
    } else {
      rounds.delete(round);
    }
    this.setState({
      checkedMap: {
        ...this.state.checkedMap,
        [date]: rounds,
      },
    });
  };

  // todos 未完善
  selectRow = (date: string, event: React.MouseEvent) => {
    const { checkedMap, prevCheckedDate } = this.state;
    // shift
    if (event.metaKey && prevCheckedDate) {
      const checked = {} as  Record<string, Set<string>>
      this.dates.forEach((date0: string) => {
        if (dayjs(date0).isBetween(prevCheckedDate, date, "day", '[]')) {
          checked[date0] = new Set(plainOptions)
        }
      })
      this.setState({
        checkedMap: {
          ...this.state.checkedMap,
          ...checked
        }
      })
    // no shift
    } else {
      const currentSelected = checkedMap[date] || new Set();
      this.setState({
        prevCheckedDate: date,
        checkedMap: {
          ...this.state.checkedMap,
          [date]:
            currentSelected.size === plainOptions.length
              ? new Set()
              : new Set(plainOptions),
        },
      });
    }
  };

  render() {
    if (this.dates.length === 0) {
      return null;
    }
    const { checkedMap } = this.state;
    return (
      <Root>
        <div className="row title">
          <label className="label"></label>
          {titleOptions.map((title) => {
            return <span>{title}</span>;
          })}
        </div>
        {this.dates.map((date) => (
          <div className="row" key={date}>
            <label
              className={`label select-row ${!!checkedMap[date] && checkedMap[date].size && 'selected'}`}
              onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                event.preventDefault();
                this.selectRow(date, event);
                return false;
              }}
            >
              {date}
            </label>
            {plainOptions.map((round) => (
              <Checkbox
                key={round}
                checked={checkedMap[date] && checkedMap[date].has(round)}
                disabled={false}
                onCheckboxClick={(checked: boolean) =>
                  this.onCheckboxClick(date, round, checked)
                }
              >
                {round}
              </Checkbox>
            ))}
          </div>
        ))}
        <div className="row">
          <label className="label">&nbsp;</label>
          <span className="select-all">全选</span>
        </div>
        <div className="box" />
      </Root>
    );
  }
}

const Root = styled.div`
  position: relative;
  margin-left: 5px;
  > .row {
    margin-left: 20px;
    &.title {
      span {
        font-size: 13px;
        cursor: default;
        color: #a5a5a5;
        width: 22px;
        height: 22px;
        line-height: 22px;
        display: inline-block;
        text-align: center;
        border-radius: 2px;
        margin: 3px;
      }
    }
    > .label {
      &.select-row {
        cursor: pointer;
        &:hover,&.selected {
          color: #6da0e3;
        }
      }
      font-size: 13px;
      color: #a5a5a5;
      display: inline-block;
      width: 110px;
    }
    > .select-all {
      font-size: 13px;
      display: inline-block;
      margin-left: 10px;
      cursor: pointer;
      &:hover {
        color: #6da0e3;
      }
    }
  }

  > .box {
    position: absolute;
    border: 1px solid rgba(24, 144, 255, 0.8);
    background: rgba(24, 144, 255, 0.3);
    display: none;
  }
`;

// LightCheckbox
interface CheckboxProps {
  disabled: boolean;
  checked: boolean;
  children: any;
  onCheckboxClick: (checked: boolean) => void
}

const Checkbox = (props: CheckboxProps) => {
  const { children, disabled, checked } = props;
  const onCheckboxClick = () => {
    props.onCheckboxClick(!checked)
  }
  return <StyledSpan 
    className={`${disabled && 'disabled'} ${checked && 'checked'}`}
    onClick={onCheckboxClick}
  >{children}</StyledSpan>
}

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
    background: #6da0e3
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
`
// 这里的 padding-right 就是为了适配 10 这个数字看起来稍微有些不居中的问题
