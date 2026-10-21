// url=<SPIN_BUTTON>
// source=src/input/index.tsx
// component=Input
import figma from 'figma';

const instance = figma.selectedInstance;

// Hover states are the native spinner, with the same snippet as Default.
const state = instance.getEnum('State', {
  Default: 'default',
  'Hover - decrease': 'decrease',
  'Hover - increase': 'increase',
});

export default {
  example: figma.code`<Input type="number" />`,
  imports: ["import Input from '@cloudscape-design/components/input'"],
  id: 'spin-button',
  metadata: {
    nestable: true,
    props: {
      state,
    },
  },
};
