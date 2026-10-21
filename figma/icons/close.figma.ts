// url=<CLOSE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'close';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-close',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
