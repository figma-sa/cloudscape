// url=<ARROW_RIGHT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'arrow-right';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-arrow-right',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
