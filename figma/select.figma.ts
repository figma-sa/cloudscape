// url=<SELECT>
// source=src/select/index.tsx
// component=Select
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

// Open is the dropdown's visual state. Select has no open property.
instance.getEnum('Open', { True: true, False: false });

const type = instance.getEnum('Type', {
  Simple: 'simple',
  Groups: 'groups',
  Icon: 'icon',
  Description: 'description',
  Features: 'features',
  'With auto filtering': 'auto',
});

const state = instance.getEnum('State', {
  Default: 'default',
  Disabled: 'disabled',
  Error: 'error',
});

const content = instance.getEnum('Content', {
  Placeholder: 'placeholder',
  Value: 'value',
});

const showFilterLabel = instance.getBoolean('Filter-label');

const readText = (node, name) => {
  const layer = node.findText(name);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const iconNameFrom = node => {
  const connected = node.findConnectedInstance('icon');
  const iconWrap =
    connected && connected.type === 'INSTANCE'
      ? connected
      : node.findInstance('IconWrapper') || node.findInstance('Icon');
  if (!iconWrap || iconWrap.type !== 'INSTANCE' || iconWrap.visible === false) {
    return '';
  }
  iconWrap.getEnum('Size', {
    '16 - normal': 'normal',
    '32 - big': 'big',
  });
  const swapped = iconWrap.getInstanceSwap('Icon');
  if (!swapped || swapped.type !== 'INSTANCE') {
    return '';
  }
  const rendered = swapped.executeTemplate();
  const raw = rendered.metadata?.props?.name || (swapped.name !== 'Icon' ? swapped.name : '');
  return iconAliases[raw] || raw;
};

const trigger = instance.findInstance('Elements / Trigger (Select)');
let placeholder = '';
let triggerOption = null;
if (trigger && trigger.type === 'INSTANCE') {
  const showDescription = trigger.getBoolean('Description');
  const showTags = trigger.getBoolean('With tags');
  const showLabel = trigger.getBoolean('With Label');
  trigger.getEnum('Opened', { Off: 'off', On: 'on' });
  trigger.getEnum('State', { Default: 'default', Error: 'error', Disabled: 'disabled' });
  const triggerType = trigger.getEnum('Type', {
    Simple: 'simple',
    'Small icon': 'small-icon',
    'Big icon': 'big-icon',
  });
  trigger.getEnum('Content', { Placeholder: 'placeholder', Value: 'value' });

  const text = readText(trigger, '✏️ Input text');
  if (content === 'placeholder') {
    placeholder = text;
  } else {
    const tags = showTags
      ? trigger
          .findLayers(node => node.type === 'TEXT' && /^tag\d*$/i.test(node.name))
          .filter(node => node.visible !== false)
          .map(node => node.textContent)
          .filter(Boolean)
      : [];
    triggerOption = {
      itemType: 'simple',
      selected: true,
      disabled: false,
      label: text,
      value: text || 'option',
      description: showDescription ? readText(trigger, '✏️ Description text') : '',
      labelTag: showLabel ? readText(trigger, 'Label') : '',
      tags,
      iconName: triggerType !== 'simple' ? iconNameFrom(trigger) : '',
      children: [],
      showOption: showDescription || showTags || showLabel || triggerType !== 'simple',
    };
  }
}

let inlineLabel = '';
const filterLabel = instance.findInstance('.Select label');
if (filterLabel && filterLabel.type === 'INSTANCE' && showFilterLabel && filterLabel.visible !== false) {
  filterLabel.getEnum('Type', { Default: 'default', Disabled: 'disabled' });
  inlineLabel = readText(filterLabel, '✏️ Input text');
}

const readItem = (item, index) => {
  const itemType = item.getEnum('Type', {
    Group: 'group',
    Simple: 'simple',
    Icon: 'icon',
    Description: 'description',
    Features: 'features',
  });
  const selected = item.getEnum('Selected', { True: true, False: false });
  const enabled = item.getEnum('Enabled', { True: true, False: false });
  item.getBoolean('Indented');
  const withTags = item.getBoolean('With tags');
  const withLabel = item.getBoolean('With label');
  const label = readText(item, '✏️ Item') || readText(item, '✏️ Input text');
  return {
    itemType,
    selected: selected === true,
    disabled: enabled === false,
    label,
    value: label || `option-${index + 1}`,
    description: itemType === 'description' || itemType === 'features' ? readText(item, '✏️ Description text') : '',
    labelTag: withLabel ? readText(item, 'Label') : '',
    tags: withTags ? ['tag1', 'Tag2', 'Tag3'].map(name => readText(item, name)).filter(Boolean) : [],
    iconName: itemType === 'icon' || itemType === 'features' ? iconNameFrom(item) : '',
    children: [],
  };
};

const dropdown = instance.findInstance('Elements / Dropdown (Select)');
let filteringPlaceholder = '';
const records = [];
if (dropdown && dropdown.type === 'INSTANCE' && dropdown.visible !== false) {
  dropdown.getEnum('Type', {
    Default: 'default',
    Groups: 'groups',
    Icon: 'icon',
    Description: 'description',
    Features: 'features',
    'With auto filtering': 'auto',
  });
  const filterInput = dropdown.findInstance('Input (Atom)');
  if (filterInput && filterInput.type === 'INSTANCE') {
    filterInput.getBoolean('Show number control');
    filterInput.getBoolean('Search');
    const filterContent = filterInput.getEnum('Content', { Placeholder: 'placeholder', Value: 'value' });
    filterInput.getEnum('State', {
      Default: 'default',
      'Read only': 'read-only',
      Disabled: 'disabled',
      Error: 'error',
      Warning: 'warning',
      Focus: 'focus',
    });
    if (filterContent === 'placeholder') {
      filteringPlaceholder = readText(filterInput, '✏️ Input text');
    }
  }

  const items = dropdown
    .findLayers(node => node.type === 'INSTANCE' && /^Item \d+$/.test(node.name))
    .filter(node => node.visible !== false)
    .slice(0, 10);

  let currentGroup = null;
  items.forEach((item, index) => {
    const record = readItem(item, index);
    if (record.itemType === 'group') {
      currentGroup = record;
      records.push(record);
    } else if (currentGroup) {
      currentGroup.children.push(record);
    } else {
      currentGroup = null;
      records.push(record);
    }
  });
}

const usedValues = {};
const uniquify = (record, index) => {
  const base = record.value || `option-${index + 1}`;
  const seen = usedValues[base] || 0;
  usedValues[base] = seen + 1;
  record.value = seen === 0 ? base : `${base}-${seen + 1}`;
};

records.forEach((record, index) => {
  uniquify(record, index);
  record.children.forEach((child, childIndex) => uniquify(child, childIndex));
});

const optionRecords = records.length ? records : triggerOption ? [triggerOption] : [];

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

const optionsCode = optionRecords
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

let selected = null;
records.forEach(record => {
  const options = record.itemType === 'group' ? record.children : [record];
  options.forEach(option => {
    if (option.selected && !selected) {
      selected = option;
    }
  });
});
if (!selected && content === 'value' && triggerOption) {
  selected = triggerOption;
}

const showOptionTrigger =
  Boolean(triggerOption && triggerOption.showOption) ||
  type === 'description' ||
  type === 'features' ||
  type === 'icon';

export default {
  example: figma.code`
    <Select
      selectedOption={${selected ? optionSnippet(selected) : 'null'}}
      options={[
        ${optionsCode}
      ]}
      ${placeholder ? figma.code`placeholder="${quote(placeholder)}"` : ''}
      ${inlineLabel ? figma.code`inlineLabelText="${quote(inlineLabel)}"` : ''}
      ${showOptionTrigger ? 'triggerVariant="option"' : ''}
      ${type === 'auto' ? 'filteringType="auto"' : ''}
      ${filteringPlaceholder ? figma.code`filteringPlaceholder="${quote(filteringPlaceholder)}"` : ''}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'error' ? 'invalid' : ''}
    />
  `,
  imports: ["import Select from '@cloudscape-design/components/select'"],
  id: 'select',
  metadata: {
    nestable: true,
    props: {
      type,
      state,
      content,
      placeholder,
    },
  },
};
