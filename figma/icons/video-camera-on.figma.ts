// url=<VIDEO_CAMERA_ON>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'video-camera-on';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-video-camera-on',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
