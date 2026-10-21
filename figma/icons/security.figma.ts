// url=<SECURITY>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'security';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-security',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
