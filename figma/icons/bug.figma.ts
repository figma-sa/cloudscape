// url=<BUG>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'bug';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-bug',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
