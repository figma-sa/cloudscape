// url=<FACE_SAD_FILLED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'face-sad-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-face-sad-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
