// url=<TREE_ITEM>
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

const indent = instance.getEnum('Indent', {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
});

const showIcon = instance.getBoolean('Icon');
const showActions = instance.getBoolean('Actions');
const showSecondary = instance.getBoolean('Secondary content');

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

const iconNameOf = icon => {
  if (!icon || icon.type !== 'INSTANCE') {
    return '';
  }
  const rendered = icon.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  const raw = (props && props.name) || (icon.name && icon.name !== 'Icon' ? icon.name : '');
  return iconAliases[raw] || raw;
};

const content = textOf(instance.findInstance('Text content'));
const secondary = showSecondary ? textOf(instance.findInstance('Secondary contenet')) : '';

const expandableNode = instance.findInstance('Elements/Expandable state');
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
  let itemIcon = instance.findInstance('IconWrapper', { path: ['Icon wrapper'] });
  if (!itemIcon || itemIcon.type !== 'INSTANCE' || itemIcon.visible === false) {
    const wrappers = instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'IconWrapper');
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
  const action = instance.findInstance('Icon button (Atom)');
  if (action && action.type === 'INSTANCE' && action.visible !== false) {
    action.getEnum('Type', { Inline: 'inline' });
    action.getEnum('State', { Default: 'default', Hover: 'hover' });
    actionIcon = iconNameOf(action.getInstanceSwap('Icon'));
  }
}

const hasChildren = expandable === 'collapsed' || expandable === 'expanded';
const expanded = expandable === 'expanded';

const imports = ["import TreeView from '@cloudscape-design/components/tree-view'"];
if (iconName) {
  imports.push("import Icon from '@cloudscape-design/components/icon'");
}
if (actionIcon) {
  imports.push("import Button from '@cloudscape-design/components/button'");
}

export default {
  example: figma.code`
    <TreeView
      items={[{
        id: "item-1",
        content: "${quote(content)}",
        ${secondary ? figma.code`secondaryContent: "${quote(secondary)}",` : ''}
        ${iconName ? figma.code`iconName: "${quote(iconName)}",` : ''}
        ${actionIcon ? figma.code`actionIcon: "${quote(actionIcon)}",` : ''}
        ${hasChildren ? 'children: [{ id: "item-1-child" }],' : ''}
      }]}
      ${expanded ? 'expandedItems={["item-1"]}' : ''}
      getItemId={item => item.id}
      getItemChildren={item => item.children}
      renderItem={item => ({
        content: item.content || "",
        ${secondary ? 'secondaryContent: item.secondaryContent,' : ''}
        ${iconName ? 'icon: item.iconName ? <Icon name={item.iconName} /> : undefined,' : ''}
        ${actionIcon ? 'actions: item.actionIcon ? <Button variant="inline-icon" iconName={item.actionIcon} /> : undefined,' : ''}
      })}
    />
  `,
  imports,
  id: 'tree-item',
  metadata: {
    nestable: true,
    props: {
      indent: indent || '0',
      expandable: expandable || 'none',
      content,
      secondary,
      iconName,
      actionIcon,
    },
  },
};
