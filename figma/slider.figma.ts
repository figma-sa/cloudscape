// url=<SLIDER>
// source=src/slider/index.tsx
// component=Slider
import figma from 'figma';

const instance = figma.selectedInstance;

const value = instance.getEnum('Percentage', {
  '0': '0',
  '25': '25',
  '50': '50',
  '75': '75',
  '100': '100',
});

const state = instance.getEnum('State', {
  Default: 'default',
  Disabled: 'disabled',
  Error: 'error',
  'Read-only': 'read-only',
});

const ticks = instance.getBoolean('Ticks');
const fillLine = instance.getBoolean('Fill line');

const numberFrom = (node, fallback) => {
  const text = node && node.type === 'TEXT' ? node.textContent : '';
  const match = String(text).match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : fallback;
};

const min = numberFrom(instance.findText('0'), '0');
const max = numberFrom(instance.findText('100'), '100');

export default {
  example: figma.code`
    <Slider
      min={${min}}
      max={${max}}
      value={${value}}
      ${ticks ? 'tickMarks step={25}' : ''}
      ${fillLine ? '' : 'hideFillLine'}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'error' ? 'invalid' : ''}
      ${state === 'read-only' ? 'readOnly' : ''}
    />
  `,
  imports: ["import Slider from '@cloudscape-design/components/slider'"],
  id: 'slider',
  metadata: {
    nestable: true,
    props: {
      value,
      state,
    },
  },
};
