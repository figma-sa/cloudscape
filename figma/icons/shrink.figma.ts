// url=<SHRINK>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'shrink';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-shrink',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
