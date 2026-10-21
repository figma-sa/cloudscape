// url=<NORMAL_BUTTON_DROPDOWN>
// source=src/button-dropdown/index.tsx
// component=ButtonDropdown
import figma from 'figma';

const instance = figma.selectedInstance;

// Open is the menu's visual state. ButtonDropdown has no expanded prop.
const open = instance.getEnum('Open', {
  True: true,
  False: false,
});

const type = instance.getEnum('Type', {
  Default: 'default',
  'Main action': 'main',
});

const button = instance.findInstance('Normal button (Atom)');
let label = '';
if (button && button.type === 'INSTANCE') {
  label = button.getString('Text') || '';
  if (!label) {
    const textLayer = button.findText('NormalButton');
    label = textLayer.type === 'TEXT' ? textLayer.textContent : '';
  }
}

const readItem = item => {
  if (!item || item.type !== 'INSTANCE') {
    return null;
  }

  const props = item.executeTemplate().metadata?.props;
  if (props && props.itemType) {
    return {
      itemType: props.itemType,
      text: props.text || '',
      disabled: props.disabled === 'true',
      checked: props.checked === 'true',
      iconName: props.iconName || '',
    };
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
  const state = item.getEnum('State', {
    Default: 'default',
    Hover: 'default',
    Disabled: 'disabled',
    'Disabled with reason': 'disabled',
  });
  const textLayers = item.findLayers(node => node.type === 'TEXT' && node.visible !== false);
  const textLayer = textLayers[0];
  let iconName = '';
  if (item.getBoolean('Icon')) {
    const glyphs = item.findLayers(
      node =>
        node.type === 'INSTANCE' &&
        node.name !== 'check' &&
        node.name !== 'caret-filled-right' &&
        node.visible !== false
    );
    const glyph = glyphs[0];
    if (glyph && glyph.type === 'INSTANCE' && glyph.name && glyph.name !== 'Icon') {
      iconName = glyph.name;
    }
  }

  return {
    itemType,
    text: textLayer && textLayer.type === 'TEXT' ? textLayer.textContent : '',
    disabled: state === 'disabled',
    checked: itemType === 'checkbox' && item.getBoolean('Selected'),
    iconName,
  };
};

const readSection = section => {
  if (!section || section.type !== 'INSTANCE') {
    return [];
  }

  const props = section.executeTemplate().metadata?.props || {};
  const sectionType =
    props.type ||
    section.getEnum('Type', {
      Default: 'default',
      Grouped: 'grouped',
    });
  const itemCount = section.getEnum('Items', {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
  });
  const itemEntries = section
    .findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Item'))
    .filter(entry => entry.visible !== false)
    .slice(0, itemCount);
  const items = itemEntries.map(readItem).filter(Boolean);

  if (sectionType === 'grouped') {
    const groupLayer = section.findInstance('Group');
    const header = readItem(groupLayer) || {
      itemType: 'group',
      text: props.group || '',
      disabled: false,
      checked: false,
      iconName: '',
    };
    return [
      {
        ...header,
        itemType: header.itemType === 'expandable' ? 'expandable' : 'group',
        children: items,
      },
    ];
  }

  const collected = [];
  let group = null;
  items.forEach(item => {
    if (item.itemType === 'group' || item.itemType === 'expandable') {
      group = { ...item, children: [] };
      collected.push(group);
    } else if (group) {
      group.children.push(item);
    } else {
      collected.push(item);
    }
  });
  return collected;
};

const menu = open ? instance.findInstance('Elements / Dropdown (Button dropdown)') : null;
let menuItems = [];
if (menu && menu.type === 'INSTANCE') {
  const sectionCount = menu.getEnum('Sections', {
    '1': 1,
    '2': 2,
    '3': 3,
  });
  const connected = menu.findConnectedInstances(node => node.codeConnectId() === 'button-dropdown-section');
  const sectionLayers =
    connected && connected.length
      ? connected
      : menu.findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Section'));
  const sections = sectionLayers.filter(section => section.visible !== false).slice(0, sectionCount);
  sections.forEach(section => {
    menuItems = menuItems.concat(readSection(section));
  });
}
menuItems = menuItems.slice(0, 8);

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

const itemsBlock = open
  ? figma.code`items={[
      ${n0}
      ${n1}
      ${n2}
      ${n3}
      ${n4}
      ${n5}
      ${n6}
      ${n7}
    ]}`
  : figma.code`items={[]}`;

const example =
  type === 'main'
    ? figma.code`
        <ButtonDropdown
          variant="normal"
          ${itemsBlock}
          ${hasExpandable ? 'expandableGroups' : ''}
          mainAction={{ text: "${label}" }}
        />
      `
    : figma.code`
        <ButtonDropdown
          variant="normal"
          ${itemsBlock}
          ${hasExpandable ? 'expandableGroups' : ''}
        >
          ${label}
        </ButtonDropdown>
      `;

export default {
  example,
  imports: ["import ButtonDropdown from '@cloudscape-design/components/button-dropdown'"],
  id: 'normal-button-dropdown',
  metadata: {
    nestable: true,
    props: { text: label },
  },
};
