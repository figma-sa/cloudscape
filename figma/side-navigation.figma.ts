// url=<SIDE_NAVIGATION>
// source=src/side-navigation/index.tsx
// component=SideNavigation
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
  'caret-filled-right': 'caret-right-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

const open = instance.getEnum('Open', { True: true, False: false });
instance.getEnum('Variant', { Standard: 'standard', Toolbar: 'toolbar' });
const showItemsControl = instance.getBoolean('Show Items control slot');

const readText = (node, name) => {
  const layer = node.findText(name);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const headerNode = instance.findInstance('Header');
let headerText = '';
if (headerNode && headerNode.type === 'INSTANCE' && headerNode.visible !== false) {
  headerNode.getBoolean('Show Divider');
  headerNode.getEnum('Version', { 'Visual refresh': 'visual-refresh' });
  headerText = readText(headerNode, '✏️ Section group');
}

const readPage = node => {
  const state = node.getEnum('State', { Default: 'default', Active: 'active' });
  const external = node.getEnum('External link', { on: true, off: false });
  const decoration = node.getEnum('Decoration', { True: true, False: false });
  const indented = Boolean(node.getBoolean('Indented') || node.getBoolean('Section indented'));
  const text = readText(node, '✏️ Page');
  let info = '';
  if (decoration) {
    const deco = node.findInstance('Decoration');
    if (deco && deco.type === 'INSTANCE') {
      deco.getEnum('Type', { New: 'new' });
      const trigger = deco.findInstance('New');
      if (trigger && trigger.type === 'INSTANCE') {
        trigger.getEnum('Type', { Text: 'text' });
        info = readText(trigger, 'Popover trigger') || 'New';
      } else {
        info = 'New';
      }
    }
  }
  return {
    kind: 'link',
    text,
    external: external === true,
    indented,
    active: state === 'active',
    info,
    items: [],
  };
};

const readGroupIcon = node => {
  const iconWrap = node.findInstance('Icon');
  if (!iconWrap || iconWrap.type !== 'INSTANCE') {
    return '';
  }
  iconWrap.getEnum('Size', { '16 - normal': 'normal' });
  const swapped = iconWrap.getInstanceSwap('Icon');
  if (!swapped || swapped.type !== 'INSTANCE') {
    return '';
  }
  const rendered = swapped.executeTemplate();
  const raw = rendered.metadata?.props?.name || (swapped.name !== 'Icon' ? swapped.name : '');
  const name = iconAliases[raw] || raw;
  if (!name || /caret|angle/.test(name)) {
    return '';
  }
  return name;
};

const itemsNode = instance.findInstance('Items');
const itemNodes =
  itemsNode && itemsNode.type === 'INSTANCE'
    ? itemsNode
        .findLayers(
          node =>
            node.type === 'INSTANCE' &&
            (node.name === 'Page' ||
              node.name === 'Link group' ||
              node.name === 'Expandable link group' ||
              node.name === 'Section group' ||
              node.name === 'Section')
        )
        .filter(node => node.visible !== false)
    : [];

const root = [];
let current = null;
let hasInfo = false;
let hasIcon = false;

itemNodes.forEach(node => {
  if (node.name === 'Page') {
    const page = readPage(node);
    if (page.info) {
      hasInfo = true;
    }
    if (page.indented && current) {
      current.items.push(page);
    } else if (current && (current.kind === 'section-group' || current.kind === 'section')) {
      current.items.push(page);
    } else {
      current = null;
      root.push(page);
    }
    return;
  }

  if (node.name === 'Link group') {
    node.getEnum('State', { Default: 'default' });
    node.getEnum('Decoration', { True: true, False: false });
    current = { kind: 'link-group', text: readText(node, '✏️ Group'), items: [], info: '' };
    root.push(current);
    return;
  }

  if (node.name === 'Expandable link group') {
    const expanded = node.getEnum('Expanded', { on: true, off: false });
    node.getBoolean('Indented');
    node.getEnum('State', { Default: 'default' });
    node.getEnum('Decoration', { True: true, False: false });
    const iconName = readGroupIcon(node);
    if (iconName) {
      hasIcon = true;
    }
    current = {
      kind: 'expandable-link-group',
      text: readText(node, '✏️ Group'),
      expanded: expanded === true,
      iconName,
      items: [],
    };
    root.push(current);
    return;
  }

  if (node.name === 'Section group') {
    const showDivider = node.getBoolean('Divider');
    const titleOn = node.getEnum('Group title', { On: true, Off: false });
    const divider = node.findInstance('Divider');
    if (divider && divider.type === 'INSTANCE') {
      divider.getEnum('Type', { Horizontal: 'horizontal' });
    }
    if (showDivider) {
      root.push({ kind: 'divider', items: [] });
    }
    current = {
      kind: 'section-group',
      text: titleOn ? readText(node, '✏️ Section group') : '',
      items: [],
    };
    root.push(current);
    return;
  }

  current = {
    kind: 'section',
    text: readText(node, '✏️ Section') || readText(node, '✏️ Section group'),
    items: [],
  };
  root.push(current);
});

let activeHref = '';
let hrefCount = 0;
const assignHref = item => {
  if (item.kind === 'link' || item.kind === 'link-group' || item.kind === 'expandable-link-group') {
    hrefCount += 1;
    item.href = `#/item-${hrefCount}`;
    if (item.active && !activeHref) {
      activeHref = item.href;
    }
  }
  (item.items || []).forEach(assignHref);
};
root.forEach(assignHref);

const itemSnippet = item => {
  if (item.kind === 'divider') {
    return '{ type: "divider" }';
  }
  if (item.kind === 'section-group') {
    return `{ type: "section-group", title: "${quote(item.text)}", items: [${item.items.map(itemSnippet).join(', ')}] }`;
  }
  if (item.kind === 'section') {
    return `{ type: "section", text: "${quote(item.text)}", items: [${item.items.map(itemSnippet).join(', ')}] }`;
  }
  if (item.kind === 'link-group' || item.kind === 'expandable-link-group') {
    const fields = [
      `type: "${item.kind}"`,
      `text: "${quote(item.text)}"`,
      `href: "${item.href}"`,
      `items: [${item.items.map(itemSnippet).join(', ')}]`,
    ];
    if (item.kind === 'expandable-link-group') {
      fields.push(`defaultExpanded: ${item.expanded ? 'true' : 'false'}`);
    }
    if (item.iconName) {
      fields.push(`icon: <Icon name="${quote(item.iconName)}" />`);
    }
    return `{ ${fields.join(', ')} }`;
  }
  const fields = [`type: "link"`, `text: "${quote(item.text)}"`, `href: "${item.href}"`];
  if (item.external) {
    fields.push('external: true');
  }
  if (item.info) {
    fields.push(`info: <Popover>${item.info}</Popover>`);
  }
  return `{ ${fields.join(', ')} }`;
};

const imports = ["import SideNavigation from '@cloudscape-design/components/side-navigation'"];
if (hasInfo) {
  imports.push("import Popover from '@cloudscape-design/components/popover'");
}
if (hasIcon) {
  imports.push("import Icon from '@cloudscape-design/components/icon'");
}

export default {
  example: figma.code`
    <SideNavigation
      ${!open ? 'collapsed' : ''}
      ${headerText ? figma.code`header={{ text: "${quote(headerText)}", href: "#" }}` : ''}
      ${activeHref ? figma.code`activeHref="${activeHref}"` : ''}
      items={[
        ${root.map(itemSnippet).join(',\n')}
      ]}
    />
  `,
  imports,
  id: 'side-navigation',
  metadata: {
    nestable: true,
    props: {
      collapsed: open ? '' : 'true',
      header: headerText,
      itemsControl: showItemsControl ? 'true' : '',
    },
  },
};
