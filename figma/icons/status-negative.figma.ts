// url=<STATUS_NEGATIVE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'status-negative';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-status-negative',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
