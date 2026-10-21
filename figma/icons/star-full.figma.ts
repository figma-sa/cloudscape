// url=<STAR_FULL>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'star-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-star-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
