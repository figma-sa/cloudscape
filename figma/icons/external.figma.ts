// url=<EXTERNAL>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'external';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-external',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
