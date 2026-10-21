// url=<MULTISELECT_DROPDOWN>
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

const type = instance.getEnum('Type', {
  Default: 'default',
  Groups: 'groups',
  Icon: 'icon',
  Description: 'description',
  Features: 'features',
  'With auto filtering': 'auto',
});

const filterInput = instance.findInstance('Input (Atom)');
let filteringPlaceholder = '';
if (filterInput && filterInput.type === 'INSTANCE') {
  filterInput.getBoolean('Show number control');
  filterInput.getBoolean('Search');
  const content = filterInput.getEnum('Content', {
    Placeholder: 'placeholder',
    Value: 'value',
  });
  filterInput.getEnum('State', {
    Default: 'default',
    'Read only': 'read-only',
    Disabled: 'disabled',
    Error: 'error',
    Warning: 'warning',
    Focus: 'focus',
  });
  if (content === 'placeholder') {
    const layer = filterInput.findText('✏️ Input text');
    filteringPlaceholder = layer.type === 'TEXT' ? layer.textContent : '';
  }
}

const readText = (node, name) => {
  const layer = node.findText(name);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const items = instance
  .findLayers(node => node.type === 'INSTANCE' && /^Item \d+$/.test(node.name))
  .filter(node => node.visible !== false)
  .slice(0, 10);

const usedValues = {};
const records = [];
let currentGroup = null;

items.forEach((item, index) => {
  const itemType = item.getEnum('Type', {
    Group: 'group',
    Simple: 'simple',
    Icon: 'icon',
    Description: 'description',
    Features: 'features',
  });
  const selected = item.getEnum('Selected', {
    True: true,
    False: false,
    Partial: 'partial',
  });
  const enabled = item.getEnum('Enabled', {
    True: true,
    False: false,
  });
  const indented = item.getBoolean('Indented');
  const withTags = item.getBoolean('With tags');
  const withLabel = item.getBoolean('With Label');

  const checkbox = item.findInstance('Checkbox') || item.findInstance('Checkbox only / Enabled');
  if (checkbox && checkbox.type === 'INSTANCE') {
    checkbox.getEnum('State', { Default: 'default', Selected: 'selected' });
  }

  const label = readText(item, '✏️ Item') || readText(item, '✏️ Input text');
  const description =
    itemType === 'description' || itemType === 'features' ? readText(item, '✏️ Description text') : '';
  const labelTag = withLabel ? readText(item, 'Label') : '';
  const tags = withTags ? ['tag1', 'Tag2', 'Tag3'].map(name => readText(item, name)).filter(Boolean) : [];

  let iconName = '';
  if (itemType === 'icon' || itemType === 'features') {
    const connected = item.findConnectedInstance('icon');
    const iconWrap = connected && connected.type === 'INSTANCE' ? connected : item.findInstance('IconWrapper');
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

  const base = label || `option-${index + 1}`;
  const seen = usedValues[base] || 0;
  usedValues[base] = seen + 1;
  const value = seen === 0 ? base : `${base}-${seen + 1}`;

  const record = {
    itemType,
    selected: selected === true,
    disabled: enabled === false,
    indented,
    label,
    value,
    description,
    labelTag,
    tags,
    iconName,
    children: [],
  };

  if (itemType === 'group') {
    currentGroup = record;
    records.push(record);
  } else if (currentGroup) {
    currentGroup.children.push(record);
  } else {
    currentGroup = null;
    records.push(record);
  }
});

const optionSnippet = record => {
  const fields = [`label: "${quote(record.label)}"`, `value: "${quote(record.value)}"`];
  if (record.description) {
    fields.push(`description: "${quote(record.description)}"`);
  }
  if (record.labelTag) {
    fields.push(`labelTag: "${quote(record.labelTag)}"`);
  }
  if (record.iconName) {
    fields.push(`iconName: "${quote(record.iconName)}"`);
  }
  if (record.tags.length) {
    fields.push(`tags: [${record.tags.map(tag => `"${quote(tag)}"`).join(', ')}]`);
  }
  if (record.disabled) {
    fields.push('disabled: true');
  }
  return `{ ${fields.join(', ')} }`;
};

const optionsCode = records
  .map(record => {
    if (record.itemType !== 'group') {
      return optionSnippet(record);
    }
    const fields = [`label: "${quote(record.label)}"`];
    if (record.disabled) {
      fields.push('disabled: true');
    }
    fields.push(`options: [${record.children.map(optionSnippet).join(', ')}]`);
    return `{ ${fields.join(', ')} }`;
  })
  .join(',\n');

const selected = [];
records.forEach(record => {
  const options = record.itemType === 'group' ? record.children : [record];
  options.forEach(option => {
    if (option.selected) {
      selected.push(`{ label: "${quote(option.label)}", value: "${quote(option.value)}" }`);
    }
  });
});

export default {
  example: figma.code`
    <Multiselect
      selectedOptions={[${selected.join(', ')}]}
      options={[
        ${optionsCode}
      ]}
      ${type === 'auto' ? 'filteringType="auto"' : ''}
      ${filteringPlaceholder ? figma.code`filteringPlaceholder="${quote(filteringPlaceholder)}"` : ''}
    />
  `,
  imports: ["import Multiselect from '@cloudscape-design/components/multiselect'"],
  id: 'multiselect-dropdown',
  metadata: {
    nestable: true,
    props: {
      type,
      selected: String(selected.length),
    },
  },
};
