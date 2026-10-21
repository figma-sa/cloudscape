// url=<VIDEO_OFF>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'video-off';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-video-off',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
