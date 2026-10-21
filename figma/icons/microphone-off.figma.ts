// url=<MICROPHONE_OFF>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'microphone-off';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-microphone-off',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
