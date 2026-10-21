// url=<FOLDER_OPEN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'folder-open';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-folder-open',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
