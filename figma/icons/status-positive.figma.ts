// url=<STATUS_POSITIVE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'status-positive';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-status-positive',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
