// url=<CONTACT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'contact';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-contact',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
