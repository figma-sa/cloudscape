// url=<BUTTON_GROUP_BUTTON>
// source=src/button-group/index.tsx
// component=ButtonGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const showPopover = instance.getBoolean('Show Popover');
const showDivider = instance.getBoolean('Show Divider');
const showDropdown = instance.getBoolean('Show Dropdown');

const iconAliases = {
  ellipses: 'ellipsis',
  'caret-filled-up': 'caret-up-filled',
  'caret-filled-down': 'caret-down-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

const iconButton = instance.findInstance('Icon button (Atom)');
let iconName = '';
if (iconButton && iconButton.type === 'INSTANCE') {
  // Hover matches Default. This icon button only has those two states.
  iconButton.getEnum('State', {
    Default: 'default',
    Hover: 'default',
  });
  const icon = iconButton.getInstanceSwap('Icon');
  if (icon && icon.type === 'INSTANCE') {
    const rendered = icon.executeTemplate();
    const raw = rendered.metadata?.props?.name || (icon.name !== 'Icon' ? icon.name : '');
    iconName = iconAliases[raw] || raw;
  }
}

const popover = instance.findInstance('Popover (Atom)');
let popoverText = '';
if (popover && popover.type === 'INSTANCE') {
  const textLayers = popover.findLayers(node => node.type === 'TEXT', { traverseInstances: true });
  const textLayer = textLayers.filter(layer => layer.visible !== false)[0] || textLayers[0];
  popoverText = textLayer && textLayer.type === 'TEXT' ? textLayer.textContent : '';
}

const text = popoverText || iconName || 'Button';

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
  const textLayers = item.findLayers(node => node.type === 'TEXT' && node.visible !== false);
  const textLayer = textLayers[0];
  return {
    itemType: 'action',
    text: textLayer && textLayer.type === 'TEXT' ? textLayer.textContent : '',
    disabled: false,
    checked: false,
    iconName: '',
  };
};

const menu = showDropdown ? instance.findInstance('Elements / Dropdown (Button dropdown)') : null;
let menuItems = [];
if (menu && menu.type === 'INSTANCE') {
  const sections = menu
    .findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Section'))
    .filter(section => section.visible !== false)
    .slice(0, 1);
  sections.forEach(section => {
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
    const entries = section
      .findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Item'))
      .filter(entry => entry.visible !== false)
      .slice(0, itemCount);
    const items = entries.map(readItem).filter(Boolean);
    if (sectionType === 'grouped') {
      const header = readItem(section.findInstance('Group')) || {
        itemType: 'group',
        text: props.group || '',
        disabled: false,
        checked: false,
        iconName: '',
      };
      menuItems.push({
        ...header,
        itemType: header.itemType === 'expandable' ? 'expandable' : 'group',
        children: items,
      });
    } else {
      items.forEach(item => menuItems.push(item));
    }
  });
}
menuItems = menuItems.slice(0, 5);

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

const menuSnippet = (item, id) => {
  if (!item || !item.children) {
    return item ? actionSnippet(item, id) : '';
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

const d0 = menuItems[0] ? menuSnippet(menuItems[0], 'item-1') : '';
const d1 = menuItems[1] ? menuSnippet(menuItems[1], 'item-2') : '';
const d2 = menuItems[2] ? menuSnippet(menuItems[2], 'item-3') : '';
const d3 = menuItems[3] ? menuSnippet(menuItems[3], 'item-4') : '';
const d4 = menuItems[4] ? menuSnippet(menuItems[4], 'item-5') : '';

const buttonItem = showDropdown
  ? figma.code`
      {
        type: "menu-dropdown",
        id: "button-1",
        text: "${text}",
        ${iconName ? figma.code`iconName: "${iconName}",` : ''}
        items: [
          ${d0}
          ${d1}
          ${d2}
          ${d3}
          ${d4}
        ],
      },
    `
  : figma.code`
      {
        type: "icon-button",
        id: "button-1",
        text: "${text}",
        ${iconName ? figma.code`iconName: "${iconName}",` : ''}
        ${showPopover && popoverText ? figma.code`popoverFeedback: "${popoverText}",` : ''}
      },
    `;

export default {
  example: figma.code`
    <ButtonGroup
      variant="icon"
      items={[
        ${buttonItem}
      ]}
    />
  `,
  imports: ["import ButtonGroup from '@cloudscape-design/components/button-group'"],
  id: 'button-group-button',
  metadata: {
    nestable: true,
    props: {
      type: showDropdown ? 'menu-dropdown' : 'icon-button',
      text,
      iconName,
      popover: showPopover ? popoverText : '',
      divider: showDivider ? 'true' : '',
    },
  },
};
