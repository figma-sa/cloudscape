// url=<KEY>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'key';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-key',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
