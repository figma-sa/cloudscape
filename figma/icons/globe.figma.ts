// url=<GLOBE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'globe';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-globe',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
