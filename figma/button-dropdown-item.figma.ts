// url=<BUTTON_DROPDOWN_ITEM>
// source=src/button-dropdown/index.tsx
// component=ButtonDropdown
import figma from 'figma';

const instance = figma.selectedInstance;

const itemType = instance.getEnum('Type', {
  Item: 'action',
  Selectable: 'checkbox',
  Group: 'group',
  'Indented item': 'action',
  'Selectable indented': 'checkbox',
  'Group + Divider': 'group',
  Expandable: 'expandable',
  'Exp + Divider': 'expandable',
});

// Hover matches Default. Disabled with reason has no separate reason text layer.
const state = instance.getEnum('State', {
  Default: 'default',
  Hover: 'default',
  Disabled: 'disabled',
  'Disabled with reason': 'disabled',
});

const textLayers = instance.findLayers(node => node.type === 'TEXT' && node.visible !== false);
const textLayer = textLayers[0];
const text = textLayer && textLayer.type === 'TEXT' ? textLayer.textContent : '';

const isCheckbox = itemType === 'checkbox';
const isGroup = itemType === 'group' || itemType === 'expandable';
const disabled = state === 'disabled';
const checked = isCheckbox && instance.getBoolean('Selected');

let iconName = '';
if (instance.getBoolean('Icon')) {
  const glyphs = instance.findLayers(
    node =>
      node.type === 'INSTANCE' && node.name !== 'check' && node.name !== 'caret-filled-right' && node.visible !== false
  );
  const glyph = glyphs[0];
  if (glyph && glyph.type === 'INSTANCE' && glyph.name && glyph.name !== 'Icon') {
    iconName = glyph.name;
  }
}

const example = isGroup
  ? figma.code`
      <ButtonDropdown
        ${itemType === 'expandable' ? 'expandableGroups' : ''}
        items={[
          {
            id: "item-1",
            text: "${text}",
            ${itemType === 'expandable' ? 'expandable: true,' : ''}
            ${disabled ? 'disabled: true,' : ''}
            items: [],
          },
        ]}
      />
    `
  : isCheckbox
    ? figma.code`
        <ButtonDropdown
          items={[
            {
              itemType: "checkbox",
              id: "item-1",
              text: "${text}",
              checked: ${checked ? 'true' : 'false'},
              ${disabled ? 'disabled: true,' : ''}
              ${iconName ? figma.code`iconName: "${iconName}",` : ''}
            },
          ]}
        />
      `
    : figma.code`
        <ButtonDropdown
          items={[
            {
              id: "item-1",
              text: "${text}",
              ${disabled ? 'disabled: true,' : ''}
              ${iconName ? figma.code`iconName: "${iconName}",` : ''}
            },
          ]}
        />
      `;

export default {
  example,
  imports: ["import ButtonDropdown from '@cloudscape-design/components/button-dropdown'"],
  id: 'button-dropdown-item',
  metadata: {
    nestable: true,
    props: {
      text,
      itemType,
      disabled: disabled ? 'true' : '',
      checked: checked ? 'true' : '',
      iconName,
    },
  },
};
