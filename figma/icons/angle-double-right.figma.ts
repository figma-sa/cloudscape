// url=<ANGLE_DOUBLE_RIGHT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'angle-right-double';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-angle-right-double',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
