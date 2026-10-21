// url=<MENU>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'menu';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-menu',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
