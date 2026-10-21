// url=<DRAG_INDICATOR>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'drag-indicator';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-drag-indicator',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
