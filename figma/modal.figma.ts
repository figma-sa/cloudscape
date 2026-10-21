// url=<MODAL>
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

const size = instance.getEnum('Size', {
  'Small (320px)': 'small',
  'Medium (600px)': 'medium',
  'Large (820px)': 'large',
  Max: 'max',
});

const titleLayer = instance.findText('Modal title');
const header = titleLayer.type === 'TEXT' ? titleLayer.textContent : '';

const content = instance.getInstanceSwap('Content');
let children = '';
if (content && content.type === 'INSTANCE' && content.name !== 'Content placeholder') {
  const rendered = content.executeTemplate();
  const example = rendered && rendered.example;
  if (example && (!Array.isArray(example) || example.length > 0)) {
    children = example;
  }
}
if (!children && content && content.type === 'INSTANCE') {
  const layers = content.findLayers(layer => layer.type === 'TEXT');
  const layer = layers[0];
  if (layer && layer.type === 'TEXT' && layer.textContent && layer.textContent !== 'SWAP WITH CONTENT') {
    children = layer.textContent;
  }
}

const connectedFooter = instance.findConnectedInstance('modal-footer');
const footerInstance =
  connectedFooter && connectedFooter.type === 'INSTANCE' ? connectedFooter : instance.findInstance('Footer');

let footerCode = '';
let footerFromTemplate = false;
if (footerInstance && footerInstance.type === 'INSTANCE' && footerInstance.visible !== false) {
  const rendered = footerInstance.executeTemplate();
  const example = rendered && rendered.example;
  if (example && (!Array.isArray(example) || example.length > 0)) {
    footerCode = example;
    footerFromTemplate = true;
  }
}

if (!footerCode && footerInstance && footerInstance.type === 'INSTANCE' && footerInstance.visible !== false) {
  const link = footerInstance.findInstance('Link button (Atom)');
  const primary = footerInstance.findInstance('Primary button (Atom)');

  let linkText = '';
  let linkIcon = '';
  if (link && link.type === 'INSTANCE') {
    link.getEnum('Type', { Default: 'default' });
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

  footerCode = figma.code`
    <Box float="right">
      <SpaceBetween direction="horizontal" size="xs">
        ${linkButton}
        ${primaryButton}
      </SpaceBetween>
    </Box>
  `;
}

const imports = ["import Modal from '@cloudscape-design/components/modal'"];
if (footerCode && !footerFromTemplate) {
  imports.push(
    "import Box from '@cloudscape-design/components/box'",
    "import Button from '@cloudscape-design/components/button'",
    "import SpaceBetween from '@cloudscape-design/components/space-between'"
  );
}

const footerProp = footerCode ? figma.code`footer={${footerCode}}` : '';

export default {
  example: figma.code`
    <Modal visible size="${size}" header="${quote(header)}" ${footerProp}>
      ${children}
    </Modal>
  `,
  imports,
  id: 'modal',
  metadata: {
    nestable: true,
    props: {
      size,
      header,
    },
  },
};
