// url=<UPLOAD_DOWNLOAD>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'upload-download';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-upload-download',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
