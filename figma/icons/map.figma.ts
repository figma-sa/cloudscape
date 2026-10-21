// url=<MAP>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'map';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-map',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
