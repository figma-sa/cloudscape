// url=<TOKEN>
// source=src/token/index.tsx
// component=Token
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const aliases = {
  ellipses: 'ellipsis',
  'caret-filled-up': 'caret-up-filled',
  'caret-filled-down': 'caret-down-filled',
  'caret-filled-right': 'caret-right-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

const type = instance.getEnum('Type', {
  Small: 'small',
  Large: 'large',
  'Property filter': 'property-filter',
  Inline: 'inline',
});

const state = instance.getEnum('State', {
  Default: 'default',
  Disabled: 'disabled',
  Operator: 'operator',
  'Read-only': 'read-only',
});

const showIcon = instance.getBoolean('Icon');
const showDescription = instance.getBoolean('Description');
const showTags = instance.getBoolean('Tags');
const showLabelTag = instance.getBoolean('Label tag');

const readText = name => {
  const layer = instance.findText(name);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const itemLabel = readText('✏️ Item');
let label = itemLabel;
if (type === 'property-filter') {
  const trigger = instance.findInstance('Popover trigger (Atom)');
  if (trigger && trigger.type === 'INSTANCE') {
    trigger.getEnum('Type', { Text: 'text' });
    const triggerText = trigger.findText('Popover trigger');
    if (triggerText.type === 'TEXT') {
      label = triggerText.textContent || label;
    }
  }
}

const description = type === 'large' && showDescription ? readText('✏️ Description') : '';
const labelTag = type === 'large' && showLabelTag ? readText('✏️ Label tag') : '';
const tags =
  type === 'large' && showTags
    ? [readText('✏️ Description tag 1'), readText('✏️ Description tag 2')].filter(Boolean)
    : [];

const operation = state === 'operator' ? readText('and') : '';

let iconName = '';
let iconSize = 'normal';
if (showIcon && type !== 'property-filter') {
  const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'icon');
  const icons =
    connected && connected.length
      ? connected
      : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Icon');
  for (let index = 0; index < icons.length; index += 1) {
    const icon = icons[index];
    if (!icon || icon.type !== 'INSTANCE' || icon.visible === false) {
      continue;
    }
    const size = icon.getEnum('Size', {
      '16 - normal': 'normal',
      '20 - medium': 'medium',
      '32 - big': 'big',
      '48 - large': 'large',
    });
    const swapped = icon.getInstanceSwap('Icon');
    let raw = '';
    if (swapped && swapped.type === 'INSTANCE') {
      const rendered = swapped.executeTemplate();
      const props = rendered && rendered.metadata && rendered.metadata.props;
      raw = (props && props.name) || (swapped.name && swapped.name !== 'Icon' ? swapped.name : '');
    }
    const name = aliases[raw] || raw;
    if (!name || name === 'close') {
      continue;
    }
    iconName = name;
    iconSize = size || 'normal';
    break;
  }
}

const variant = type === 'inline' ? 'inline' : 'normal';
const tagList = tags.map(tag => `"${quote(tag)}"`).join(', ');

export default {
  example: figma.code`
    <Token
      variant="${variant}"
      label="${quote(label)}"
      ${description ? figma.code`description="${quote(description)}"` : ''}
      ${labelTag ? figma.code`labelTag="${quote(labelTag)}"` : ''}
      ${tagList ? figma.code`tags={[${tagList}]}` : ''}
      ${iconName ? figma.code`icon={<Icon name="${iconName}" size="${iconSize}" />}` : ''}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'read-only' ? 'readOnly' : ''}
    />
  `,
  imports: iconName
    ? [
        "import Token from '@cloudscape-design/components/token'",
        "import Icon from '@cloudscape-design/components/icon'",
      ]
    : ["import Token from '@cloudscape-design/components/token'"],
  id: 'token',
  metadata: {
    nestable: true,
    props: {
      type,
      state,
      label,
      description,
      labelTag,
      tags: tags.join(','),
      iconName,
      operation,
    },
  },
};
