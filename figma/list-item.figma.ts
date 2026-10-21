// url=<LIST_ITEM>
// source=src/list/index.tsx
// component=List
import figma from 'figma';

const instance = figma.selectedInstance;

const withIcon = instance.getBoolean('With icon');
const sortable = instance.getBoolean('Sortable');
const withAction = instance.getBoolean('With action');
const withSecondary = instance.getBoolean('With secondary content');

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

const texts = instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Text content');
const content = textOf(texts[0]);
const secondary = withSecondary ? textOf(texts[1]) : '';

let iconCode = '';
if (withIcon) {
  let itemIcon = instance.findInstance('IconWrapper', { path: ['Icon wrapper'] });
  if (!itemIcon || itemIcon.type !== 'INSTANCE') {
    const wrappers = instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'IconWrapper');
    itemIcon = wrappers[1] || null;
  }
  if (itemIcon && itemIcon.type === 'INSTANCE') {
    itemIcon.getEnum('Size', { '16 - normal': 'normal' });
    const rendered = itemIcon.executeTemplate();
    const example = rendered && rendered.example;
    if (example && (!Array.isArray(example) || example.length > 0)) {
      iconCode = example;
    } else {
      const swapped = itemIcon.getInstanceSwap('Icon');
      let raw = '';
      if (swapped && swapped.type === 'INSTANCE') {
        const iconTemplate = swapped.executeTemplate();
        raw = iconTemplate.metadata?.props?.name || (swapped.name !== 'Icon' ? swapped.name : '');
      }
      const name = iconAliases[raw] || raw;
      if (name) {
        iconCode = figma.code`<Icon name="${quote(name)}" />`;
      }
    }
  }
}

let actionIcon = '';
if (withAction) {
  const action = instance.findInstance('Icon button (Atom)');
  if (action && action.type === 'INSTANCE') {
    action.getEnum('Type', { Icon: 'icon' });
    action.getEnum('State', { Default: 'default', Hover: 'hover' });
    const icon = action.getInstanceSwap('Icon');
    let raw = '';
    if (icon && icon.type === 'INSTANCE') {
      const rendered = icon.executeTemplate();
      raw = rendered.metadata?.props?.name || (icon.name !== 'Icon' ? icon.name : '');
    }
    actionIcon = iconAliases[raw] || raw;
  }
}

const imports = ["import List from '@cloudscape-design/components/list'"];
if (withIcon) {
  imports.push("import Icon from '@cloudscape-design/components/icon'");
}
if (withAction) {
  imports.push("import Button from '@cloudscape-design/components/button'");
}

export default {
  example: figma.code`
    <List
      ${sortable ? 'sortable' : ''}
      items={[{ id: "item-1" }]}
      renderItem={() => ({
        id: "item-1",
        content: "${quote(content)}",
        ${secondary ? figma.code`secondaryContent: "${quote(secondary)}",` : ''}
        ${iconCode ? figma.code`icon: ${iconCode},` : ''}
        ${
          withAction
            ? figma.code`actions: <Button variant="inline-icon" ${actionIcon ? figma.code`iconName="${quote(actionIcon)}"` : ''} />,`
            : ''
        }
      })}
    />
  `,
  imports,
  id: 'list-item',
  metadata: {
    nestable: true,
    props: {
      content,
      secondary,
      sortable: sortable ? 'true' : '',
    },
  },
};
