// url=<FORWARD_10_SECONDS_16>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'forward-10-seconds';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-forward-10-seconds',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
