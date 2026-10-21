// url=<VIDEO_DISABLED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'video-unavailable';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-video-unavailable',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
