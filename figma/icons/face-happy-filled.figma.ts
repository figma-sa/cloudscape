// url=<FACE_HAPPY_FILLED>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'face-happy-filled';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-face-happy-filled',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
