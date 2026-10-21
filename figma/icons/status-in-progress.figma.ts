// url=<STATUS_IN_PROGRESS>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'status-in-progress';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-status-in-progress',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
