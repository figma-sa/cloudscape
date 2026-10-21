// url=<UNDO>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'undo';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-undo',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
