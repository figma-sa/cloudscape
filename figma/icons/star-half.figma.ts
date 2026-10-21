// url=<STAR_HALF>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'star-half';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-star-half',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
