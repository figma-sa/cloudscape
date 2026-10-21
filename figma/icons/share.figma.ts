// url=<SHARE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'share';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-share',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
