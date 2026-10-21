// url=<ZOOM_OUT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'zoom-out';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-zoom-out',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
