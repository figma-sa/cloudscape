// url=<FILE_OPEN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'file-open';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-file-open',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
