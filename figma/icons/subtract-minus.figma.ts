// url=<SUBTRACT_MINUS>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'subtract-minus';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-subtract-minus',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
