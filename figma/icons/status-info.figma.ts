// url=<STATUS_INFO>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'status-info';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-status-info',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
