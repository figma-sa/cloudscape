// url=<DELETE_MARKER>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'delete-marker';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-delete-marker',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
