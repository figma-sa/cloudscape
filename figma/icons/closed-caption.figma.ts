// url=<CLOSED_CAPTION>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'closed-caption';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-closed-caption',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
