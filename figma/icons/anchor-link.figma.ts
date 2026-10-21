// url=<ANCHOR_LINK>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'anchor-link';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-anchor-link',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
