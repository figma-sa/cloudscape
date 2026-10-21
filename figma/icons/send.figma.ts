// url=<SEND>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'send';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-send',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
