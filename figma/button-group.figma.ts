// url=<BUTTON_GROUP>
// source=src/button-group/index.tsx
// component=ButtonGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const readMenuItem = item => {
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

const readMenu = button => {
  const menu = button.findInstance('Elements / Dropdown (Button dropdown)');
  if (!menu || menu.type !== 'INSTANCE') {
    return [];
  }
  const sections = menu
    .findLayers(node => node.type === 'INSTANCE' && String(node.name).startsWith('Section'))
    .filter(section => section.visible !== false)
    .slice(0, 1);
  const collected = [];
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
    const items = entries.map(readMenuItem).filter(Boolean);
    if (sectionType === 'grouped') {
      const header = readMenuItem(section.findInstance('Group')) || {
        itemType: 'group',
        text: props.group || '',
        disabled: false,
        checked: false,
        iconName: '',
      };
      collected.push({
        ...header,
        itemType: header.itemType === 'expandable' ? 'expandable' : 'group',
        children: items,
      });
    } else {
      items.forEach(item => collected.push(item));
    }
  });
  return collected.slice(0, 5);
};

const readButton = button => {
  const props = button.executeTemplate().metadata?.props || {};
  return {
    type: props.type || (button.getBoolean('Show Dropdown') ? 'menu-dropdown' : 'icon-button'),
    text: props.text || 'Button',
    iconName: props.iconName || '',
    popover: props.popover || '',
    divider: props.divider === 'true' || (!props.type && button.getBoolean('Show Divider')),
  };
};

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

const buttonCode = (button, index) => {
  if (!button || button.type !== 'INSTANCE') {
    return '';
  }
  const props = readButton(button);
  const id = `button-${index + 1}`;
  let item;
  if (props.type === 'menu-dropdown') {
    const menuItems = readMenu(button);
    const m0 = menuItems[0] ? menuSnippet(menuItems[0], `${id}-item-1`) : '';
    const m1 = menuItems[1] ? menuSnippet(menuItems[1], `${id}-item-2`) : '';
    const m2 = menuItems[2] ? menuSnippet(menuItems[2], `${id}-item-3`) : '';
    const m3 = menuItems[3] ? menuSnippet(menuItems[3], `${id}-item-4`) : '';
    const m4 = menuItems[4] ? menuSnippet(menuItems[4], `${id}-item-5`) : '';
    item = figma.code`
      {
        type: "menu-dropdown",
        id: "${id}",
        text: "${props.text}",
        ${props.iconName ? figma.code`iconName: "${props.iconName}",` : ''}
        items: [
          ${m0}
          ${m1}
          ${m2}
          ${m3}
          ${m4}
        ],
      },
    `;
  } else {
    item = figma.code`
      {
        type: "icon-button",
        id: "${id}",
        text: "${props.text}",
        ${props.iconName ? figma.code`iconName: "${props.iconName}",` : ''}
        ${props.popover ? figma.code`popoverFeedback: "${props.popover}",` : ''}
      },
    `;
  }

  // A divider is drawn before a group that is not the first item.
  if (props.divider && index > 0) {
    return figma.code`
      {
        type: "group",
        text: "${props.text}",
        items: [
          ${item}
        ],
      },
    `;
  }
  return item;
};

const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'button-group-button');
const buttonLayers =
  connected && connected.length
    ? connected
    : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Button group button');

const buttons = buttonLayers.filter(button => button.visible !== false).slice(0, 9);

const b0 = buttons[0] ? buttonCode(buttons[0], 0) : '';
const b1 = buttons[1] ? buttonCode(buttons[1], 1) : '';
const b2 = buttons[2] ? buttonCode(buttons[2], 2) : '';
const b3 = buttons[3] ? buttonCode(buttons[3], 3) : '';
const b4 = buttons[4] ? buttonCode(buttons[4], 4) : '';
const b5 = buttons[5] ? buttonCode(buttons[5], 5) : '';
const b6 = buttons[6] ? buttonCode(buttons[6], 6) : '';
const b7 = buttons[7] ? buttonCode(buttons[7], 7) : '';
const b8 = buttons[8] ? buttonCode(buttons[8], 8) : '';

export default {
  example: figma.code`
    <ButtonGroup
      variant="icon"
      items={[
        ${b0}
        ${b1}
        ${b2}
        ${b3}
        ${b4}
        ${b5}
        ${b6}
        ${b7}
        ${b8}
      ]}
    />
  `,
  imports: ["import ButtonGroup from '@cloudscape-design/components/button-group'"],
  id: 'button-group',
  metadata: { nestable: true },
};
