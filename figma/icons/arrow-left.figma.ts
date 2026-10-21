// url=<ARROW_LEFT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'arrow-left';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-arrow-left',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
