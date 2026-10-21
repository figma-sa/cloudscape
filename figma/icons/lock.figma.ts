// url=<LOCK>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'lock-private';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-lock-private',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
