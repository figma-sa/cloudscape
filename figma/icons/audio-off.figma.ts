// url=<AUDIO_OFF>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'audio-off';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-audio-off',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
