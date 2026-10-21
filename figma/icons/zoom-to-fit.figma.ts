// url=<ZOOM_TO_FIT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'zoom-to-fit';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-zoom-to-fit',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
