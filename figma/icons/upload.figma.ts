// url=<UPLOAD>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'upload';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-upload',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
