// url=<BUTTON_DROPDOWN_SECTION>
// source=src/button-dropdown/index.tsx
// component=ButtonDropdown
import figma from 'figma';

const instance = figma.selectedInstance;

const sectionType = instance.getEnum('Type', {
  Default: 'default',
  Grouped: 'grouped',
});

const itemCount = instance.getEnum('Items', {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
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

const itemEntries = instance
  .findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Item'))
  .filter(entry => entry.visible !== false)
  .slice(0, itemCount);

const collected = [];
if (sectionType === 'grouped') {
  const groupLayer = instance.findInstance('Group');
  const header = readItem(groupLayer) || {
    itemType: 'group',
    text: '',
    disabled: false,
    iconName: '',
    checked: false,
  };
  collected.push({
    ...header,
    itemType: header.itemType === 'expandable' ? 'expandable' : 'group',
    children: itemEntries.map(readItem).filter(Boolean),
  });
} else {
  let group = null;
  itemEntries.forEach(entry => {
    const item = readItem(entry);
    if (!item) {
      return;
    }
    if (item.itemType === 'group' || item.itemType === 'expandable') {
      group = { ...item, children: [] };
      collected.push(group);
    } else if (group) {
      group.children.push(item);
    } else {
      collected.push(item);
    }
  });
}

const menuItems = collected.slice(0, 5);
const hasExpandable = menuItems.some(item => item.itemType === 'expandable');
const groupText = sectionType === 'grouped' && menuItems[0] ? menuItems[0].text : '';

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
      ]}
    />
  `,
  imports: ["import ButtonDropdown from '@cloudscape-design/components/button-dropdown'"],
  id: 'button-dropdown-section',
  metadata: {
    nestable: true,
    props: {
      type: sectionType,
      group: groupText,
    },
  },
};
