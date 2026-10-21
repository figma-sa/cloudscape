// url=<BUTTON>
// source=src/button/index.tsx
// component=Button
import figma from 'figma';

const instance = figma.selectedInstance;

const label = instance.getString('Text');

const type = instance.getEnum('Type', {
  'External link': 'external',
  'Text only': 'text',
  'Text + icon': 'icon',
  Dropdown: 'dropdown',
  'Dropdown+Main': 'dropdown-main',
});

// Hover is a visual state with the same snippet as Default.
const disabled = instance.getEnum('State', {
  Default: false,
  Hover: false,
  Disabled: true,
});

let iconName;
if (type === 'icon') {
  const connectedIcon = instance.findConnectedInstance('icon');
  const icon = connectedIcon && connectedIcon.type === 'INSTANCE' ? connectedIcon : instance.getInstanceSwap('Icon');
  if (icon && icon.type === 'INSTANCE') {
    const iconTemplate = icon.executeTemplate();
    iconName = iconTemplate.metadata?.props?.name ?? icon.name;
  }
}

const isSplit = type === 'dropdown-main';
const isDropdown = type === 'dropdown' || isSplit;

const buttonExample = figma.code`
  <Button
    variant="normal"
    ${type === 'external' ? 'external' : ''}
    ${disabled ? 'disabled' : ''}
    ${iconName ? figma.code`iconName="${iconName}"` : ''}
  >
    ${label}
  </Button>
`;

const dropdownExample = isSplit
  ? figma.code`
      <ButtonDropdown
        variant="normal"
        items={[]}
        ${disabled ? 'disabled' : ''}
        mainAction={{ text: "${label}" }}
      />
    `
  : figma.code`
      <ButtonDropdown
        variant="normal"
        items={[]}
        ${disabled ? 'disabled' : ''}
      >
        ${label}
      </ButtonDropdown>
    `;

export default {
  example: isDropdown ? dropdownExample : buttonExample,
  imports: [
    isDropdown
      ? "import ButtonDropdown from '@cloudscape-design/components/button-dropdown'"
      : "import Button from '@cloudscape-design/components/button'",
  ],
  id: 'normal-button',
  metadata: { nestable: true },
};
