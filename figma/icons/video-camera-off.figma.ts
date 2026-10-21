// url=<VIDEO_CAMERA_OFF>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'video-camera-off';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-video-camera-off',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
