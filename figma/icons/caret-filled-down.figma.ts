// url=<CARET_FILLED_DOWN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'caret-down-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-caret-down-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
