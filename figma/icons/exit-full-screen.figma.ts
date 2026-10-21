// url=<EXIT_FULL_SCREEN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'exit-full-screen';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-exit-full-screen',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
