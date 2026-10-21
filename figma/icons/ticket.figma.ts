// url=<TICKET>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'ticket';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-ticket',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
