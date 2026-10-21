// url=<FOLDER>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'folder';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-folder',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
