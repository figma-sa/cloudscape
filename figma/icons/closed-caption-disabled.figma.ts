// url=<CLOSED_CAPTION_DISABLED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'closed-caption-unavailable';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-closed-caption-unavailable',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
