// url=<EXPAND>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'expand';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-expand',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
