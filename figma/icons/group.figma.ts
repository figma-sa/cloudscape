// url=<GROUP>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'group';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-group',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
