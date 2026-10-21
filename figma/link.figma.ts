// url=<LINK>
// source=src/link/index.tsx
// component=Link
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  primary: 'primary',
  secondary: 'secondary',
  Info: 'info',
  Button: 'button',
});

const external = instance.getBoolean('External link');

const textLayer = instance.findText('✏️ Link text');
const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';

const variant = type === 'button' ? '' : type;

export default {
  example: figma.code`
    <Link
      ${variant ? figma.code`variant="${variant}"` : ''}
      ${external ? 'external' : ''}
      ${type === 'button' ? '' : 'href="#"'}
    >
      ${text}
    </Link>
  `,
  imports: ["import Link from '@cloudscape-design/components/link'"],
  id: 'link',
  metadata: {
    nestable: true,
    props: {
      variant: variant || 'button',
      external: external ? 'true' : '',
      text,
    },
  },
};
