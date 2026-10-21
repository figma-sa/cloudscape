// url=<COMPONENT_CALENDAR>
// source=src/calendar/index.tsx
// component=Calendar
import figma from 'figma';

const instance = figma.selectedInstance;

const granularity = instance.getEnum('Granularity', {
  Day: 'day',
  Month: 'month',
});

const header = instance.getString('Header') || '';
const yearMatch = header.match(/\d{4}/);
const year = yearMatch ? yearMatch[0] : '';
const monthNumbers = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  sept: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};
const monthToken = header.toLowerCase().match(/jan|feb|mar|apr|may|jun|jul|aug|sept|sep|oct|nov|dec/);
const headerMonth = monthToken ? monthNumbers[monthToken[0]] : '';

const weekdayStart = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};
const weekdayLabels = instance.findLayers(node => {
  if (node.type !== 'TEXT') {
    return false;
  }
  const key = String(node.textContent || node.name || '')
    .trim()
    .toLowerCase()
    .slice(0, 3);
  return weekdayStart[key] !== undefined;
});
const firstWeekday = weekdayLabels[0];
const firstWeekdayKey =
  firstWeekday && firstWeekday.type === 'TEXT'
    ? String(firstWeekday.textContent || '')
        .trim()
        .toLowerCase()
        .slice(0, 3)
    : '';
const startOfWeek = granularity === 'day' && firstWeekdayKey ? weekdayStart[firstWeekdayKey] : undefined;

const readDay = day => {
  const props = day.executeTemplate().metadata?.props;
  if (props && props.state) {
    return props;
  }
  const state = day.getEnum('State', {
    Default: 'default',
    Hover: 'hover',
    Selected: 'selected',
    Today: 'today',
    Disabled: 'disabled',
    Range: 'range',
    Weekend: 'weekend',
  });
  const position = day.getEnum('Position', {
    Start: 'start',
    End: 'end',
    Any: 'any',
    Middle: 'middle',
  });
  const dayLayer = day.findText('✏️ Day');
  const dayText = dayLayer.type === 'TEXT' ? dayLayer.textContent : '';
  const dayNumber = Number(dayText);
  const isoDay =
    Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 31 ? String(dayNumber).padStart(2, '0') : '';
  return {
    day: dayText,
    state,
    position,
    date: isoDay ? `2024-01-${isoDay}` : '',
  };
};

const withHeader = iso => {
  if (!iso) {
    return '';
  }
  const parts = iso.split('-');
  const nextYear = year || parts[0];
  const nextMonth = headerMonth || parts[1];
  return parts[2] ? `${nextYear}-${nextMonth}-${parts[2]}` : `${nextYear}-${nextMonth}`;
};

let selectedDate = '';
let rangeStart = '';
let rangeEnd = '';
const disabledDays = [];
const disabledMonths = [];

if (granularity === 'day') {
  const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'calendar-day');
  const dayLayers =
    connected && connected.length
      ? connected
      : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements/Day');
  dayLayers
    .filter(day => day.visible !== false)
    .forEach(day => {
      const props = readDay(day);
      const date = withHeader(props.date);
      const dayNumber = Number(props.day);
      if (props.state === 'selected' && date) {
        selectedDate = date;
      }
      if (props.state === 'disabled' && Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
        if (!disabledDays.includes(dayNumber)) {
          disabledDays.push(dayNumber);
        }
      }
      if (props.state === 'range' && date) {
        if (props.position === 'start') {
          rangeStart = date;
        }
        if (props.position === 'end') {
          rangeEnd = date;
        }
      }
    });
} else {
  const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'calendar-month');
  const monthLayers =
    connected && connected.length
      ? connected
      : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements');
  monthLayers
    .filter(month => month.visible !== false)
    .forEach(month => {
      const props = month.executeTemplate().metadata?.props || {};
      const date = withHeader(props.date || '');
      if (props.state === 'selected' && date) {
        selectedDate = date;
      }
      if (props.state === 'disabled' && date) {
        const monthIndex = Number(date.split('-')[1]) - 1;
        if (monthIndex >= 0 && monthIndex <= 11 && !disabledMonths.includes(monthIndex)) {
          disabledMonths.push(monthIndex);
        }
      }
    });
}

const isRange = Boolean(rangeStart || rangeEnd);
const value = selectedDate;
const disabledDaysList = disabledDays.join(', ');
const disabledMonthsList = disabledMonths.join(', ');

const example = isRange
  ? figma.code`
      <DateRangePicker
        granularity="day"
        dateOnly
        relativeOptions={[]}
        value={{
          type: "absolute",
          startDate: "${rangeStart || rangeEnd}",
          endDate: "${rangeEnd || rangeStart}",
        }}
      />
    `
  : figma.code`
      <Calendar
        granularity="${granularity}"
        value="${value}"
        ${startOfWeek !== undefined ? figma.code`startOfWeek={${startOfWeek}}` : ''}
        ${
          disabledDays.length ? figma.code`isDateEnabled={date => ![${disabledDaysList}].includes(date.getDate())}` : ''
        }
        ${
          disabledMonths.length
            ? figma.code`isDateEnabled={date => ![${disabledMonthsList}].includes(date.getMonth())}`
            : ''
        }
      />
    `;

export default {
  example,
  imports: [
    isRange
      ? "import DateRangePicker from '@cloudscape-design/components/date-range-picker'"
      : "import Calendar from '@cloudscape-design/components/calendar'",
  ],
  id: 'calendar',
  metadata: { nestable: true },
};
