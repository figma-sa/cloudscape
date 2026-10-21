// url=<EDIT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'edit';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-edit',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
