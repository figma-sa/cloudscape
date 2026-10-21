// url=<STATUS_STOPPED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'status-stopped';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-status-stopped',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
