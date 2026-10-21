// url=<REFRESH>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'refresh';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-refresh',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
