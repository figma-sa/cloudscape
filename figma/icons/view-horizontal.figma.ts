// url=<VIEW_HORIZONTAL>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'view-horizontal';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-view-horizontal',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
