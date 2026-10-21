// url=<SUGGESTIONS_GEN_AI>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'suggestions-gen-ai';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-suggestions-gen-ai',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
