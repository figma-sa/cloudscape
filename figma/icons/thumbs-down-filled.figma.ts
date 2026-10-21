// url=<THUMBS_DOWN_FILLED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'thumbs-down-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-thumbs-down-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
