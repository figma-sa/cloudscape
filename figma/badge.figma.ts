// url=<BADGE>
// source=src/badge/index.tsx
// component=Badge
import figma from 'figma';

const instance = figma.selectedInstance;

const color = instance.getEnum('Color', {
  Blue: 'blue',
  Green: 'green',
  Grey: 'grey',
  Red: 'red',
  'Critical severity': 'severity-critical',
  'High severity': 'severity-high',
  'Medium severity': 'severity-medium',
  'Low severity': 'severity-low',
  'Neutral severity': 'severity-neutral',
});

const labelLayer = instance.findText('Badge text');
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : instance.getString('Badge text');

export default {
  example: figma.code`<Badge color="${color}">${label}</Badge>`,
  imports: ["import Badge from '@cloudscape-design/components/badge'"],
  id: 'badge',
  metadata: {
    nestable: true,
    props: { color, text: label },
  },
};
