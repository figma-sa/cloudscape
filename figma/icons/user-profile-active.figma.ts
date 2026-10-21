// url=<USER_PROFILE_ACTIVE>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'user-profile-active';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-user-profile-active',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
