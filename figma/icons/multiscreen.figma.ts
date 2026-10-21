// url=<MULTISCREEN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'multiscreen';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-multiscreen',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
