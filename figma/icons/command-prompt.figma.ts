// url=<COMMAND_PROMPT>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'command-prompt';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-command-prompt',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
