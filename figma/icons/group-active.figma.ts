// url=<GROUP_ACTIVE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'group-active';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-group-active',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
