// url=<USER_PROFILE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'user-profile';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-user-profile',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
