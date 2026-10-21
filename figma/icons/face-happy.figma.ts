// url=<FACE_HAPPY>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'face-happy';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-face-happy',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
