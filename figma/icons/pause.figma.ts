// url=<PAUSE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'pause';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-pause',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
