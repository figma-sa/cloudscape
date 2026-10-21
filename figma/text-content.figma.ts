// url=<TEXT_CONTENT>
// source=src/box/index.tsx
// component=Box
import figma from 'figma';

const instance = figma.selectedInstance;

const style = instance.getEnum('variant', {
  'Paragraph Regular': 'p',
  'Paragraph Bold': 'p-bold',
  'Paragraph Small': 'small',
  'Heading 1': 'h1',
  'Heading 2': 'h2',
  'Heading 3': 'h3',
  'Heading 4': 'h4',
  'Heading 5': 'h5',
  'Display Large Bold': 'display-bold',
  'Display Large Light': 'display-light',
  'Code Keyboard': 'keyboard',
  Code: 'code',
});

const layerName = {
  p: 'Label',
  'p-bold': 'Label',
  small: 'Label',
  h1: 'Label',
  h2: 'Label',
  h3: 'Label',
  h4: 'Label',
  h5: 'Label',
  'display-bold': 'Display Large Bold',
  'display-light': 'Display Large Light',
  keyboard: 'Code Keyboard',
  code: 'Code',
}[style];

const textLayer = instance.findText(layerName);
const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';

const variant = {
  p: 'p',
  'p-bold': 'p',
  small: 'small',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  'display-light': 'awsui-value-large',
  keyboard: 'awsui-inline-code',
  code: 'code',
}[style];

export default {
  example: figma.code`
    <Box
      ${variant ? figma.code`variant="${variant}"` : ''}
      ${style === 'display-bold' ? 'fontSize="display-l"' : ''}
      ${style === 'p-bold' || style === 'display-bold' ? 'fontWeight="bold"' : ''}
    >
      ${text}
    </Box>
  `,
  imports: ["import Box from '@cloudscape-design/components/box'"],
  id: 'text-content',
  metadata: {
    nestable: true,
    props: {
      style,
      text,
    },
  },
};
