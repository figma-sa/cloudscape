// url=<BACKWARD_10_SECONDS_16>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'backward-10-seconds';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-backward-10-seconds',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
