// url=<STATUS_PENDING>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'status-pending';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-status-pending',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
