// url=<VIEW_VERTICAL>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'view-vertical';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-view-vertical',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
