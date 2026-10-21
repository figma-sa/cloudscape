// url=<CARET_FILLED_UP>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'caret-up-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-caret-up-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
