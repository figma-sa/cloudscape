// url=<STATUS_INDICATOR>
// source=src/status-indicator/index.tsx
// component=StatusIndicator
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  error: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
  stopped: 'stopped',
  pending: 'pending',
  'in progress': 'in-progress',
  loading: 'loading',
});

const textLayer = instance.findText('Text');
const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';

export default {
  example: figma.code`<StatusIndicator type="${type}">${text}</StatusIndicator>`,
  imports: ["import StatusIndicator from '@cloudscape-design/components/status-indicator'"],
  id: 'status-indicator',
  metadata: {
    nestable: true,
    props: {
      type,
      text,
    },
  },
};
