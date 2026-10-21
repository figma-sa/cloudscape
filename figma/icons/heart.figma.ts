// url=<HEART>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'heart';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-heart',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
