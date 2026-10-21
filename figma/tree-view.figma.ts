// url=<TREE_VIEW>
// source=src/tree-view/index.tsx
// component=TreeView
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

const iconNameOf = icon => {
  if (!icon || icon.type !== 'INSTANCE') {
    return '';
  }
  const rendered = icon.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  const raw = (props && props.name) || (icon.name && icon.name !== 'Icon' ? icon.name : '');
  return iconAliases[raw] || raw;
};

const textOf = node => {
  if (!node || node.type !== 'INSTANCE' || node.visible === false) {
    return '';
  }
  node.getEnum('variant', {
    'Paragraph Regular': 'regular',
    'Paragraph Small': 'small',
  });
  const layer = node.findText('Label');
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const readLocal = item => {
  const indent = item.getEnum('Indent', {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
  });
  const showIcon = item.getBoolean('Icon');
  const showActions = item.getBoolean('Actions');
  const showSecondary = item.getBoolean('Secondary content');

  const expandableNode = item.findInstance('Elements/Expandable state');
  const expandable =
    expandableNode && expandableNode.type === 'INSTANCE'
      ? expandableNode.getEnum('Expandable state', {
          'Has children/ Collapsed': 'collapsed',
          'Has children/ Expanded': 'expanded',
          'No children': 'none',
        })
      : 'none';

  let iconName = '';
  if (showIcon) {
    let itemIcon = item.findInstance('IconWrapper', { path: ['Icon wrapper'] });
    if (!itemIcon || itemIcon.type !== 'INSTANCE' || itemIcon.visible === false) {
      const wrappers = item.findLayers(node => node.type === 'INSTANCE' && node.name === 'IconWrapper');
      itemIcon = wrappers[1] || null;
    }
    if (itemIcon && itemIcon.type === 'INSTANCE' && itemIcon.visible !== false) {
      itemIcon.getEnum('Size', {
        '16 - normal': 'normal',
      });
      iconName = iconNameOf(itemIcon.getInstanceSwap('Icon'));
    }
  }

  let actionIcon = '';
  if (showActions) {
    const action = item.findInstance('Icon button (Atom)');
    if (action && action.type === 'INSTANCE' && action.visible !== false) {
      action.getEnum('Type', { Inline: 'inline' });
      action.getEnum('State', { Default: 'default', Hover: 'hover' });
      actionIcon = iconNameOf(action.getInstanceSwap('Icon'));
    }
  }

  return {
    indent: indent || '0',
    expandable: expandable || 'none',
    content: textOf(item.findInstance('Text content')),
    secondary: showSecondary ? textOf(item.findInstance('Secondary contenet')) : '',
    iconName,
    actionIcon,
  };
};

const readItem = item => {
  const rendered = item.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  if (props && props.content) {
    return {
      indent: props.indent || '0',
      expandable: props.expandable || 'none',
      content: props.content,
      secondary: props.secondary || '',
      iconName: props.iconName || '',
      actionIcon: props.actionIcon || '',
    };
  }
  return readLocal(item);
};

const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'tree-item');
const layers = (
  connected && connected.length
    ? connected
    : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Tree item')
)
  .filter(node => node.visible !== false)
  .slice(0, 11);

const records = layers.map(readItem);

const roots = [];
const stack = [{ indent: -1, children: roots }];
records.forEach((record, index) => {
  const node = {
    id: `item-${index + 1}`,
    indent: Number(record.indent) || 0,
    content: record.content,
    secondary: record.secondary,
    iconName: record.iconName,
    actionIcon: record.actionIcon,
    expandable: record.expandable,
    children: [],
  };
  while (stack.length > 1 && stack[stack.length - 1].indent >= node.indent) {
    stack.pop();
  }
  stack[stack.length - 1].children.push(node);
  stack.push(node);
});

const expandedIds = [];
const ensureToggle = nodes => {
  nodes.forEach(node => {
    if (node.expandable === 'expanded') {
      expandedIds.push(node.id);
    }
    const realChildren = node.children.filter(child => !child.placeholder);
    if ((node.expandable === 'collapsed' || node.expandable === 'expanded') && realChildren.length === 0) {
      node.children.push({ id: `${node.id}-child`, placeholder: true, children: [] });
    }
    ensureToggle(realChildren);
  });
};
ensureToggle(roots);

const snippet = node => {
  if (node.placeholder) {
    return figma.code`{ id: "${node.id}" },`;
  }
  const kids = node.children || [];
  const children = kids.length
    ? figma.code`children: [
        ${kids[0] ? snippet(kids[0]) : ''}
        ${kids[1] ? snippet(kids[1]) : ''}
        ${kids[2] ? snippet(kids[2]) : ''}
        ${kids[3] ? snippet(kids[3]) : ''}
        ${kids[4] ? snippet(kids[4]) : ''}
        ${kids[5] ? snippet(kids[5]) : ''}
        ${kids[6] ? snippet(kids[6]) : ''}
        ${kids[7] ? snippet(kids[7]) : ''}
        ${kids[8] ? snippet(kids[8]) : ''}
        ${kids[9] ? snippet(kids[9]) : ''}
      ],`
    : '';
  return figma.code`{
    id: "${node.id}",
    content: "${quote(node.content)}",
    ${node.secondary ? figma.code`secondaryContent: "${quote(node.secondary)}",` : ''}
    ${node.iconName ? figma.code`iconName: "${quote(node.iconName)}",` : ''}
    ${node.actionIcon ? figma.code`actionIcon: "${quote(node.actionIcon)}",` : ''}
    ${children}
  },`;
};

const r0 = roots[0] ? snippet(roots[0]) : '';
const r1 = roots[1] ? snippet(roots[1]) : '';
const r2 = roots[2] ? snippet(roots[2]) : '';
const r3 = roots[3] ? snippet(roots[3]) : '';
const r4 = roots[4] ? snippet(roots[4]) : '';
const r5 = roots[5] ? snippet(roots[5]) : '';
const r6 = roots[6] ? snippet(roots[6]) : '';
const r7 = roots[7] ? snippet(roots[7]) : '';
const r8 = roots[8] ? snippet(roots[8]) : '';
const r9 = roots[9] ? snippet(roots[9]) : '';
const r10 = roots[10] ? snippet(roots[10]) : '';

const anySecondary = records.some(record => record.secondary);
const anyIcon = records.some(record => record.iconName);
const anyAction = records.some(record => record.actionIcon);
const expandedProp = expandedIds.length
  ? figma.code`expandedItems={[${expandedIds.map(id => `"${id}"`).join(', ')}]}`
  : '';

const imports = ["import TreeView from '@cloudscape-design/components/tree-view'"];
if (anyIcon) {
  imports.push("import Icon from '@cloudscape-design/components/icon'");
}
if (anyAction) {
  imports.push("import Button from '@cloudscape-design/components/button'");
}

export default {
  example: figma.code`
    <TreeView
      items={[
        ${r0}
        ${r1}
        ${r2}
        ${r3}
        ${r4}
        ${r5}
        ${r6}
        ${r7}
        ${r8}
        ${r9}
        ${r10}
      ]}
      ${expandedProp}
      getItemId={item => item.id}
      getItemChildren={item => item.children}
      renderItem={item => ({
        content: item.content || "",
        ${anySecondary ? 'secondaryContent: item.secondaryContent,' : ''}
        ${anyIcon ? 'icon: item.iconName ? <Icon name={item.iconName} /> : undefined,' : ''}
        ${anyAction ? 'actions: item.actionIcon ? <Button variant="inline-icon" iconName={item.actionIcon} /> : undefined,' : ''}
      })}
    />
  `,
  imports,
  id: 'tree-view',
  metadata: {
    nestable: true,
    props: {
      count: String(records.length),
      expanded: expandedIds.join(','),
    },
  },
};
