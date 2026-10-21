// url=<ANGLE_UP>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'angle-up';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-angle-up',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
