// url=<ADD>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'add-plus';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-add-plus',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
