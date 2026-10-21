// url=<ZOOM_IN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'zoom-in';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-zoom-in',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
