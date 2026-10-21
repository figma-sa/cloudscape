// url=<ANGLE_DOWN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'angle-down';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-angle-down',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
