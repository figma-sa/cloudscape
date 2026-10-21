// url=<REDO>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'redo';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-redo',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
