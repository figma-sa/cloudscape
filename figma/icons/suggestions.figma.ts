// url=<SUGGESTIONS>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'suggestions';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-suggestions',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
