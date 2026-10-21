// url=<BUTTON_DROPDOWN_MENU>
// source=src/button-dropdown/index.tsx
// component=ButtonDropdown
import figma from 'figma';

const instance = figma.selectedInstance;

const sectionCount = instance.getEnum('Sections', {
  '1': 1,
  '2': 2,
  '3': 3,
});

const readItem = item => {
  if (!item || item.type !== 'INSTANCE') {
    return null;
  }

  const itemType = item.getEnum('Type', {
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
  const state = item.getEnum('State', {
    Default: 'default',
    Hover: 'default',
    Disabled: 'disabled',
    'Disabled with reason': 'disabled',
  });

  const textLayers = item.findLayers(node => node.type === 'TEXT' && node.visible !== false);
  const textLayer = textLayers[0];
  const text = textLayer && textLayer.type === 'TEXT' ? textLayer.textContent : '';

  let iconName = '';
  if (item.getBoolean('Icon')) {
    const glyphs = item.findLayers(node => node.type === 'INSTANCE' && node.name !== 'check' && node.visible !== false);
    const glyph = glyphs[0];
    if (glyph && glyph.type === 'INSTANCE' && glyph.name && glyph.name !== 'Icon') {
      iconName = glyph.name;
    }
  }

  return {
    itemType,
    text,
    disabled: state === 'disabled',
    checked: itemType === 'checkbox' && item.getBoolean('Selected'),
    iconName,
  };
};

const sections = instance
  .findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Section'))
  .filter(section => section.visible !== false)
  .slice(0, sectionCount);

const collected = [];
sections.forEach(section => {
  const itemCount = section.getEnum('Items', {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
  });
  const entries = section
    .findLayers(node => node.type === 'INSTANCE' && (String(node.name).startsWith('Item') || node.name === 'Group'))
    .filter(entry => entry.visible !== false);

  let group = null;
  let seenItems = 0;
  entries.forEach(entry => {
    const item = readItem(entry);
    if (!item) {
      return;
    }
    if (item.itemType === 'group' || item.itemType === 'expandable') {
      group = { ...item, children: [] };
      collected.push(group);
      return;
    }
    if (seenItems >= itemCount) {
      return;
    }
    seenItems += 1;
    if (group) {
      group.children.push(item);
    } else {
      collected.push(item);
    }
  });
});

const menuItems = collected.slice(0, 15);
const hasExpandable = menuItems.some(item => item.itemType === 'expandable');

const actionSnippet = (item, id) =>
  item.itemType === 'checkbox'
    ? figma.code`
        {
          itemType: "checkbox",
          id: "${id}",
          text: "${item.text}",
          checked: ${item.checked ? 'true' : 'false'},
          ${item.disabled ? 'disabled: true,' : ''}
          ${item.iconName ? figma.code`iconName: "${item.iconName}",` : ''}
        },
      `
    : figma.code`
        {
          id: "${id}",
          text: "${item.text}",
          ${item.disabled ? 'disabled: true,' : ''}
          ${item.iconName ? figma.code`iconName: "${item.iconName}",` : ''}
        },
      `;

const snippetFor = (item, id) => {
  if (!item) {
    return '';
  }
  if (!item.children) {
    return actionSnippet(item, id);
  }
  const children = item.children.slice(0, 5);
  const c0 = children[0] ? actionSnippet(children[0], `${id}-1`) : '';
  const c1 = children[1] ? actionSnippet(children[1], `${id}-2`) : '';
  const c2 = children[2] ? actionSnippet(children[2], `${id}-3`) : '';
  const c3 = children[3] ? actionSnippet(children[3], `${id}-4`) : '';
  const c4 = children[4] ? actionSnippet(children[4], `${id}-5`) : '';
  return figma.code`
    {
      id: "${id}",
      text: "${item.text}",
      ${item.itemType === 'expandable' ? 'expandable: true,' : ''}
      ${item.disabled ? 'disabled: true,' : ''}
      items: [
        ${c0}
        ${c1}
        ${c2}
        ${c3}
        ${c4}
      ],
    },
  `;
};

const n0 = menuItems[0] ? snippetFor(menuItems[0], 'item-1') : '';
const n1 = menuItems[1] ? snippetFor(menuItems[1], 'item-2') : '';
const n2 = menuItems[2] ? snippetFor(menuItems[2], 'item-3') : '';
const n3 = menuItems[3] ? snippetFor(menuItems[3], 'item-4') : '';
const n4 = menuItems[4] ? snippetFor(menuItems[4], 'item-5') : '';
const n5 = menuItems[5] ? snippetFor(menuItems[5], 'item-6') : '';
const n6 = menuItems[6] ? snippetFor(menuItems[6], 'item-7') : '';
const n7 = menuItems[7] ? snippetFor(menuItems[7], 'item-8') : '';
const n8 = menuItems[8] ? snippetFor(menuItems[8], 'item-9') : '';
const n9 = menuItems[9] ? snippetFor(menuItems[9], 'item-10') : '';
const n10 = menuItems[10] ? snippetFor(menuItems[10], 'item-11') : '';
const n11 = menuItems[11] ? snippetFor(menuItems[11], 'item-12') : '';
const n12 = menuItems[12] ? snippetFor(menuItems[12], 'item-13') : '';
const n13 = menuItems[13] ? snippetFor(menuItems[13], 'item-14') : '';
const n14 = menuItems[14] ? snippetFor(menuItems[14], 'item-15') : '';

export default {
  example: figma.code`
    <ButtonDropdown
      ${hasExpandable ? 'expandableGroups' : ''}
      items={[
        ${n0}
        ${n1}
        ${n2}
        ${n3}
        ${n4}
        ${n5}
        ${n6}
        ${n7}
        ${n8}
        ${n9}
        ${n10}
        ${n11}
        ${n12}
        ${n13}
        ${n14}
      ]}
    />
  `,
  imports: ["import ButtonDropdown from '@cloudscape-design/components/button-dropdown'"],
  id: 'button-dropdown-menu',
  metadata: { nestable: true },
};
