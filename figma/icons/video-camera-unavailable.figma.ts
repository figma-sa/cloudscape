// url=<VIDEO_CAMERA_UNAVAILABLE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'video-camera-unavailable';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-video-camera-unavailable',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
