// url=<LOCATION_PIN>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const name = 'location-pin';

export default {
  example: figma.code`<Icon name="${name}" />`,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon-location-pin',
  metadata: {
    nestable: true,
    props: {
      name,
    },
  },
};
