// url=<LIST_VIEW>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'list-view';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-list-view',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
