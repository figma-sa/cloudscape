// url=<CARET_FILLED_RIGHT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'caret-right-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-caret-right-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
