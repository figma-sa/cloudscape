// url=<MULTISELECT_ITEM>
// source=src/multiselect/index.tsx
// component=Multiselect
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

const itemType = instance.getEnum('Type', {
  Group: 'group',
  Simple: 'simple',
  Icon: 'icon',
  Description: 'description',
  Features: 'features',
});

const selected = instance.getEnum('Selected', {
  True: 'true',
  Partial: 'partial',
  False: 'false',
});

const enabled = instance.getEnum('Enabled', {
  True: true,
  False: false,
});

const indented = instance.getBoolean('Indented');
const withTags = instance.getBoolean('With tags');
const withLabel = instance.getBoolean('With Label');

const checkbox = instance.findLayers(
  node =>
    node.type === 'INSTANCE' &&
    (node.name === 'Checkbox' || node.name === 'Checkbox only / Enabled' || node.name === 'Checkbox only / Disabled')
)[0];
if (checkbox && checkbox.type === 'INSTANCE') {
  checkbox.getEnum('State', {
    Default: 'default',
    Selected: 'selected',
    Indeterminate: 'indeterminate',
  });
}

const readText = name => {
  const layer = instance.findText(name);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const label = readText('✏️ Item') || readText('✏️ Input text');
const value = label || 'option';
const description = itemType === 'description' || itemType === 'features' ? readText('✏️ Description text') : '';
const labelTag = withLabel ? readText('Label') : '';
const tags = withTags ? ['tag1', 'Tag2', 'Tag3'].map(readText).filter(Boolean) : [];

let iconName = '';
if (itemType === 'icon' || itemType === 'features') {
  const connected = instance.findConnectedInstance('icon');
  const iconWrap = connected && connected.type === 'INSTANCE' ? connected : instance.findInstance('IconWrapper');
  if (iconWrap && iconWrap.type === 'INSTANCE') {
    iconWrap.getEnum('Size', {
      '16 - normal': 'normal',
      '32 - big': 'big',
    });
    const swapped = iconWrap.getInstanceSwap('Icon');
    if (swapped && swapped.type === 'INSTANCE') {
      const rendered = swapped.executeTemplate();
      const raw = rendered.metadata?.props?.name || (swapped.name !== 'Icon' ? swapped.name : '');
      iconName = iconAliases[raw] || raw;
    }
  }
}

const disabled = enabled === false;
const isSelected = selected === 'true' && itemType !== 'group';

const fields = [`label: "${quote(label)}"`];
if (itemType === 'group') {
  fields.push('options: []');
} else {
  fields.push(`value: "${quote(value)}"`);
}
if (description) {
  fields.push(`description: "${quote(description)}"`);
}
if (labelTag) {
  fields.push(`labelTag: "${quote(labelTag)}"`);
}
if (iconName) {
  fields.push(`iconName: "${quote(iconName)}"`);
}
if (tags.length) {
  fields.push(`tags: [${tags.map(tag => `"${quote(tag)}"`).join(', ')}]`);
}
if (disabled) {
  fields.push('disabled: true');
}

const selectedCode = isSelected ? `{ label: "${quote(label)}", value: "${quote(value)}" }` : '';

export default {
  example: figma.code`
    <Multiselect
      selectedOptions={[${selectedCode}]}
      options={[
        { ${fields.join(', ')} },
      ]}
    />
  `,
  imports: ["import Multiselect from '@cloudscape-design/components/multiselect'"],
  id: 'multiselect-item',
  metadata: {
    nestable: true,
    props: {
      type: itemType,
      label,
      value: itemType === 'group' ? '' : value,
      description,
      labelTag,
      tags: tags.join(','),
      iconName,
      selected: selected === 'false' ? '' : selected,
      disabled: disabled ? 'true' : '',
      indented: indented ? 'true' : '',
    },
  },
};
