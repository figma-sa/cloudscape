// url=<ACTION_STRIPE>
// source=src/space-between/index.tsx
// component=SpaceBetween
import figma from 'figma';

const instance = figma.selectedInstance;

const showRefresh = instance.getBoolean('Refresh');
const showActions = instance.getBoolean('Actions');
const showButton1 = instance.getBoolean('Button 1');
const showButton2 = instance.getBoolean('Button 2');
const showButton3 = instance.getBoolean('Button 3');
const showPrimary = instance.getBoolean('Primary');

const buttonExample = button => {
  if (!button || button.type !== 'INSTANCE') {
    return '';
  }
  return button.executeTemplate().example;
};

const iconButton = showRefresh ? instance.findInstance('Icon button (Atom)') : null;
let refreshCode = '';
if (iconButton && iconButton.type === 'INSTANCE') {
  const icon = iconButton.getInstanceSwap('Icon');
  let iconName = '';
  if (icon && icon.type === 'INSTANCE') {
    iconName = icon.executeTemplate().metadata?.props?.name || (icon.name !== 'Icon' ? icon.name : '');
  }
  refreshCode = figma.code`<Button${iconName ? figma.code` iconName="${iconName}"` : ''} />`;
}

const dropdown = showActions ? instance.findInstance('Normal button dropdown (Atom)') : null;
let actionsCode = '';
if (dropdown && dropdown.type === 'INSTANCE') {
  const connected = dropdown.findConnectedInstance('normal-button');
  const inner = connected && connected.type === 'INSTANCE' ? connected : dropdown.findInstance('Normal button (Atom)');
  actionsCode = buttonExample(inner);
}

const normalButtons = instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Normal button (Atom)');
const button3Code = showButton3 ? buttonExample(normalButtons[0]) : '';
const button2Code = showButton2 ? buttonExample(normalButtons[1]) : '';
const button1Code = showButton1 ? buttonExample(normalButtons[2]) : '';

const primary = showPrimary ? instance.findInstance('Primary button (Atom)') : null;
let primaryCode = '';
if (primary && primary.type === 'INSTANCE') {
  const textLayer = primary.findText('PrimaryButton');
  const label = textLayer && textLayer.type === 'TEXT' ? textLayer.textContent : '';
  primaryCode = figma.code`<Button variant="primary">${label}</Button>`;
}

const imports = [
  "import SpaceBetween from '@cloudscape-design/components/space-between'",
  "import Button from '@cloudscape-design/components/button'",
];
if (showActions) {
  imports.push("import ButtonDropdown from '@cloudscape-design/components/button-dropdown'");
}

export default {
  example: figma.code`
    <SpaceBetween direction="horizontal" size="xs">
      ${refreshCode}
      ${actionsCode}
      ${button3Code}
      ${button2Code}
      ${button1Code}
      ${primaryCode}
    </SpaceBetween>
  `,
  imports,
  id: 'action-stripe',
  metadata: { nestable: true },
};
