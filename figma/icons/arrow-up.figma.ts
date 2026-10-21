// url=<ARROW_UP>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'arrow-up';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-arrow-up',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
