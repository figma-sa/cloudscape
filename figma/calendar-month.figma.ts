// url=<CALENDAR_MONTH>
// source=src/calendar/index.tsx
// component=Calendar
import figma from 'figma';

const instance = figma.selectedInstance;

const state = instance.getEnum('State', {
  Default: 'default',
  Disabled: 'disabled',
  'This month': 'this-month',
  Hover: 'hover',
  Selected: 'selected',
});

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

const textLayers = instance.findLayers(node => node.type === 'TEXT');
const monthLayer = textLayers[0];
const month = monthLayer && monthLayer.type === 'TEXT' ? monthLayer.textContent : '';
const monthNumber = monthNumbers[month.trim().toLowerCase()] || '';
const date = monthNumber ? `2024-${monthNumber}` : '';

export default {
  example: figma.code`
    <Calendar
      granularity="month"
      value="${state === 'selected' ? date : ''}"
      ${state === 'disabled' ? 'isDateEnabled={() => false}' : ''}
    />
  `,
  imports: ["import Calendar from '@cloudscape-design/components/calendar'"],
  id: 'calendar-month',
  metadata: {
    nestable: true,
    props: {
      month,
      state,
      date,
    },
  },
};
