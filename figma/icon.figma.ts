// url=<ICON>
// source=src/icon/index.tsx
// component=Icon
import figma from 'figma';

const instance = figma.selectedInstance;

const size = instance.getEnum('Size', {
  '16 - normal': 'normal',
  '20 - medium': 'medium',
  '32 - big': 'big',
  '48 - large': 'large',
});

const icon = instance.getInstanceSwap('Icon');
let name;
if (icon && icon.type === 'INSTANCE') {
  const iconTemplate = icon.executeTemplate();
  name = iconTemplate.metadata?.props?.name ?? icon.name;
}

export default {
  example: figma.code`
    <Icon
      ${name ? figma.code`name="${name}"` : ''}
      size="${size}"
    />
  `,
  imports: ["import Icon from '@cloudscape-design/components/icon'"],
  id: 'icon',
  metadata: { nestable: true, props: { name } },
};
