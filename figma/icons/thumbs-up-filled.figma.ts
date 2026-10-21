// url=<THUMBS_UP_FILLED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'thumbs-up-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-thumbs-up-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
