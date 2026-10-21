// url=<INSERT_ROW>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'insert-row';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-insert-row',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
