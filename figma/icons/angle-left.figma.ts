// url=<ANGLE_LEFT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'angle-left';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-angle-left',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
