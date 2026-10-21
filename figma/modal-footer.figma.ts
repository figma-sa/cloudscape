// url=<MODAL_FOOTER>
// source=src/modal/index.tsx
// component=Modal
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const iconAliases = {
  ellipses: 'ellipsis',
  'caret-filled-up': 'caret-up-filled',
  'caret-filled-down': 'caret-down-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

const slot = instance.getInstanceSwap('Footer content');

const link = instance.findInstance('Link button (Atom)');
const primary = instance.findInstance('Primary button (Atom)');

let linkText = '';
let linkIcon = '';
if (link && link.type === 'INSTANCE') {
  link.getEnum('Type', { Default: 'default' });
  // Hover is a visual state with the same snippet as Default.
  link.getEnum('State', { Default: 'default', Hover: 'hover' });
  linkText = link.getString('Text') || '';
  if (!linkText) {
    const layer = link.findText('LinkButton');
    linkText = layer.type === 'TEXT' ? layer.textContent : '';
  }
  if (link.getBoolean('Icon')) {
    const iconWrap = link.findInstance('Icon');
    if (iconWrap && iconWrap.type === 'INSTANCE') {
      iconWrap.getEnum('Size', { '16 - normal': 'normal' });
      const swapped = iconWrap.getInstanceSwap('Icon');
      if (swapped && swapped.type === 'INSTANCE') {
        const rendered = swapped.executeTemplate();
        const raw = rendered.metadata?.props?.name || (swapped.name !== 'Icon' ? swapped.name : '');
        linkIcon = iconAliases[raw] || raw;
      }
    }
  }
}

let primaryText = '';
if (primary && primary.type === 'INSTANCE') {
  primary.getEnum('Type', { 'Text only': 'text' });
  primary.getEnum('Open', { False: false });
  primary.getEnum('States', { Default: 'default', Hover: 'hover' });
  primaryText = primary.getString('Text') || '';
  if (!primaryText) {
    const layer = primary.findText('PrimaryButton');
    primaryText = layer.type === 'TEXT' ? layer.textContent : '';
  }
}

const linkButton =
  link && link.type === 'INSTANCE'
    ? figma.code`<Button variant="link" ${linkIcon ? figma.code`iconName="${quote(linkIcon)}"` : ''}>${linkText}</Button>`
    : '';
const primaryButton =
  primary && primary.type === 'INSTANCE' ? figma.code`<Button variant="primary">${primaryText}</Button>` : '';

let slotCode = '';
if (!linkButton && !primaryButton && slot && slot.type === 'INSTANCE') {
  const rendered = slot.executeTemplate();
  const example = rendered && rendered.example;
  if (example && (!Array.isArray(example) || example.length > 0)) {
    slotCode = example;
  }
}

const buttons = figma.code`
  <SpaceBetween direction="horizontal" size="xs">
    ${linkButton}
    ${primaryButton}
  </SpaceBetween>
`;

export default {
  example: figma.code`
    <Box float="right">
      ${slotCode || buttons}
    </Box>
  `,
  imports: slotCode
    ? ["import Box from '@cloudscape-design/components/box'"]
    : [
        "import Box from '@cloudscape-design/components/box'",
        "import SpaceBetween from '@cloudscape-design/components/space-between'",
        "import Button from '@cloudscape-design/components/button'",
      ],
  id: 'modal-footer',
  metadata: {
    nestable: true,
    props: {
      link: linkText,
      primary: primaryText,
    },
  },
};
