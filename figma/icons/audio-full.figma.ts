// url=<AUDIO_FULL>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'audio-full';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-audio-full',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
