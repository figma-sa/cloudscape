// url=<FULL_SCREEN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'full-screen';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-full-screen',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
