// url=<LIST>
// source=src/list/index.tsx
// component=List
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
  'in progress': 'in-progress',
  add: 'add-plus',
};

const iconNameOf = icon => {
  if (!icon || icon.type !== 'INSTANCE') {
    return '';
  }
  const rendered = icon.executeTemplate();
  const raw = rendered.metadata?.props?.name || (icon.name !== 'Icon' ? icon.name : '');
  return iconAliases[raw] || raw;
};

const textOf = node => {
  if (!node || node.type !== 'INSTANCE') {
    return '';
  }
  node.getEnum('variant', {
    'Paragraph Regular': 'regular',
    'Paragraph Small': 'small',
  });
  const layer = node.findText('Label');
  return layer.type === 'TEXT' ? layer.textContent : '';
};

const readItem = item => {
  const withIcon = item.getBoolean('With icon');
  const sortable = item.getBoolean('Sortable');
  const withAction = item.getBoolean('With action');
  const withSecondary = item.getBoolean('With secondary content');

  const texts = item.findLayers(node => node.type === 'INSTANCE' && node.name === 'Text content');
  const content = textOf(texts[0]);
  const secondary = withSecondary ? textOf(texts[1]) : '';

  let iconName = '';
  if (withIcon) {
    let itemIcon = item.findInstance('IconWrapper', { path: ['Icon wrapper'] });
    if (!itemIcon || itemIcon.type !== 'INSTANCE') {
      const wrappers = item.findLayers(node => node.type === 'INSTANCE' && node.name === 'IconWrapper');
      itemIcon = wrappers[1] || null;
    }
    if (itemIcon && itemIcon.type === 'INSTANCE') {
      itemIcon.getEnum('Size', { '16 - normal': 'normal' });
      iconName = iconNameOf(itemIcon.getInstanceSwap('Icon'));
    }
  }

  let actionIcon = '';
  if (withAction) {
    const action = item.findInstance('Icon button (Atom)');
    if (action && action.type === 'INSTANCE') {
      action.getEnum('Type', { Icon: 'icon' });
      action.getEnum('State', { Default: 'default', Hover: 'hover' });
      actionIcon = iconNameOf(action.getInstanceSwap('Icon'));
    }
  }

  return { sortable, content, secondary, iconName, actionIcon };
};

const items = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'List item')
  .filter(item => item.visible !== false)
  .slice(0, 7)
  .map(readItem);

const itemSnippet = (item, index) => figma.code`
  {
    id: "item-${index + 1}",
    content: "${quote(item.content)}",
    ${item.secondary ? figma.code`secondaryContent: "${quote(item.secondary)}",` : ''}
    ${item.iconName ? figma.code`iconName: "${quote(item.iconName)}",` : ''}
    ${item.actionIcon ? figma.code`actionIcon: "${quote(item.actionIcon)}",` : ''}
  },
`;

const i0 = items[0] ? itemSnippet(items[0], 0) : '';
const i1 = items[1] ? itemSnippet(items[1], 1) : '';
const i2 = items[2] ? itemSnippet(items[2], 2) : '';
const i3 = items[3] ? itemSnippet(items[3], 3) : '';
const i4 = items[4] ? itemSnippet(items[4], 4) : '';
const i5 = items[5] ? itemSnippet(items[5], 5) : '';
const i6 = items[6] ? itemSnippet(items[6], 6) : '';

const sortable = items.some(item => item.sortable);
const anySecondary = items.some(item => item.secondary);
const anyIcon = items.some(item => item.iconName);
const anyAction = items.some(item => item.actionIcon);

const imports = ["import List from '@cloudscape-design/components/list'"];
if (anyIcon) {
  imports.push("import Icon from '@cloudscape-design/components/icon'");
}
if (anyAction) {
  imports.push("import Button from '@cloudscape-design/components/button'");
}

export default {
  example: figma.code`
    <List
      ${sortable ? 'sortable' : ''}
      items={[
        ${i0}
        ${i1}
        ${i2}
        ${i3}
        ${i4}
        ${i5}
        ${i6}
      ]}
      renderItem={item => ({
        id: item.id,
        content: item.content,
        ${anySecondary ? 'secondaryContent: item.secondaryContent,' : ''}
        ${anyIcon ? 'icon: item.iconName ? <Icon name={item.iconName} /> : undefined,' : ''}
        ${anyAction ? 'actions: item.actionIcon ? <Button variant="inline-icon" iconName={item.actionIcon} /> : undefined,' : ''}
      })}
    />
  `,
  imports,
  id: 'list',
  metadata: {
    nestable: true,
    props: {
      sortable: sortable ? 'true' : '',
    },
  },
};
