// url=<CALENDAR_DAY>
// source=src/calendar/index.tsx
// component=Calendar
import figma from 'figma';

const instance = figma.selectedInstance;

const state = instance.getEnum('State', {
  Default: 'default',
  Hover: 'hover',
  Selected: 'selected',
  Today: 'today',
  Disabled: 'disabled',
  Range: 'range',
  Weekend: 'weekend',
});

const position = instance.getEnum('Position', {
  Start: 'start',
  End: 'end',
  Any: 'any',
  Middle: 'middle',
});

const dayLayer = instance.findText('✏️ Day');
const day = dayLayer.type === 'TEXT' ? dayLayer.textContent : '';
const dayNumber = Number(day);
const isoDay =
  Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 31 ? String(dayNumber).padStart(2, '0') : '';
const date = isoDay ? `2024-01-${isoDay}` : '';

const example =
  state === 'range'
    ? figma.code`
        <DateRangePicker
          value={${
            date
              ? figma.code`{
                  type: "absolute",
                  startDate: "${date}",
                  endDate: "${date}",
                }`
              : 'null'
          }}
          dateOnly
          relativeOptions={[]}
        />
      `
    : figma.code`
        <Calendar
          value="${state === 'selected' ? date : ''}"
          ${state === 'disabled' ? 'isDateEnabled={() => false}' : ''}
        />
      `;

export default {
  example,
  imports: [
    state === 'range'
      ? "import DateRangePicker from '@cloudscape-design/components/date-range-picker'"
      : "import Calendar from '@cloudscape-design/components/calendar'",
  ],
  id: 'calendar-day',
  metadata: {
    nestable: true,
    props: {
      day,
      state,
      position,
      date,
    },
  },
};
