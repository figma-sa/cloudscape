// url=<CARET_FILLED_LEFT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'caret-left-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-caret-left-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
