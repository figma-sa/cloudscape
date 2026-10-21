// url=<GEN_AI_SMALL>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'gen-ai-token';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-gen-ai-token',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
