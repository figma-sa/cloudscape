// url=<ARROW_DOWN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'arrow-down';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-arrow-down',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
