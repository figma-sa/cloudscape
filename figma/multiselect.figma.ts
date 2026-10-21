// url=<MULTISELECT>
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

// Open is the dropdown's visual state. Multiselect has no open property.
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
  'Read-only': 'read-only',
});

const content = instance.getEnum('Content', {
  Placeholder: 'placeholder',
  Values: 'values',
});

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
  if (!iconWrap || iconWrap.type !== 'INSTANCE') {
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
if (trigger && trigger.type === 'INSTANCE') {
  trigger.getBoolean('Description');
  trigger.getBoolean('With tags');
  trigger.getBoolean('With Label');
  trigger.getEnum('Opened', { Off: 'off', On: 'on' });
  trigger.getEnum('State', { Default: 'default', Error: 'error', Disabled: 'disabled' });
  trigger.getEnum('Type', { Simple: 'simple' });
  trigger.getEnum('Content', { Placeholder: 'placeholder', Value: 'value' });
  if (content === 'placeholder') {
    placeholder = readText(trigger, '✏️ Input text');
  }
}

const readDropdownItem = (item, index) => {
  const rendered = item.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  if (props && (props.label || props.type)) {
    return {
      itemType: props.type || 'simple',
      selected: props.selected === 'true',
      disabled: props.disabled === 'true',
      label: props.label || '',
      value: props.value || props.label || `option-${index + 1}`,
      description: props.description || '',
      labelTag: props.labelTag || '',
      tags: props.tags ? String(props.tags).split(',').filter(Boolean) : [],
      iconName: props.iconName || '',
      children: [],
    };
  }

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
  item.getBoolean('Indented');
  const withTags = item.getBoolean('With tags');
  const withLabel = item.getBoolean('With Label');
  const checkbox = item.findLayers(
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

const connectedDropdown = instance.findConnectedInstance('multiselect-dropdown');
const dropdown =
  connectedDropdown && connectedDropdown.type === 'INSTANCE'
    ? connectedDropdown
    : instance.findInstance('Elements / Dropdown (Multiselect)');

let filteringPlaceholder = '';
const records = [];
if (dropdown && dropdown.type === 'INSTANCE' && dropdown.visible !== false) {
  const filterInput = dropdown.findInstance('Input (Atom)');
  if (filterInput && filterInput.type === 'INSTANCE') {
    filterInput.getBoolean('Show number control');
    filterInput.getBoolean('Search');
    const filterContent = filterInput.getEnum('Content', {
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
    const record = readDropdownItem(item, index);
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

const tokens = instance
  .findLayers(node => node.type === 'INSTANCE' && /^Token \d+$/.test(node.name))
  .filter(node => node.visible !== false)
  .slice(0, 10);

const tokenRecords = tokens.map((token, index) => {
  token.getEnum('Type', { Small: 'small', Large: 'large' });
  token.getEnum('State', { Default: 'default', 'Read-only': 'read-only' });
  const showIcon = token.getBoolean('Icon');
  const showDescription = token.getBoolean('Description');
  const showTags = token.getBoolean('Tags');
  const showLabel = token.getBoolean('Label tag');
  const label = readText(token, '✏️ Item');
  const tags = showTags
    ? token
        .findLayers(node => node.type === 'TEXT' && /^tag\d*$/i.test(node.name))
        .filter(node => node.visible !== false)
        .map(node => node.textContent)
        .filter(Boolean)
    : [];
  return {
    itemType: 'simple',
    selected: true,
    disabled: false,
    label,
    value: label || `option-${index + 1}`,
    description: showDescription ? readText(token, '✏️ Description') : '',
    labelTag: showLabel ? readText(token, '✏️ Label tag') : '',
    tags,
    iconName: showIcon ? iconNameFrom(token) : '',
    children: [],
  };
});

const optionRecords = records.length ? records : tokenRecords;

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

const selected = [];
if (records.length) {
  records.forEach(record => {
    const options = record.itemType === 'group' ? record.children : [record];
    options.forEach(option => {
      if (option.selected) {
        selected.push(`{ label: "${quote(option.label)}", value: "${quote(option.value)}" }`);
      }
    });
  });
} else if (content === 'values') {
  tokenRecords.forEach(option => {
    selected.push(`{ label: "${quote(option.label)}", value: "${quote(option.value)}" }`);
  });
}

export default {
  example: figma.code`
    <Multiselect
      selectedOptions={[${selected.join(', ')}]}
      options={[
        ${optionsCode}
      ]}
      ${placeholder ? figma.code`placeholder="${quote(placeholder)}"` : ''}
      ${type === 'auto' ? 'filteringType="auto"' : ''}
      ${filteringPlaceholder ? figma.code`filteringPlaceholder="${quote(filteringPlaceholder)}"` : ''}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'error' ? 'invalid' : ''}
      ${state === 'read-only' ? 'readOnly' : ''}
    />
  `,
  imports: ["import Multiselect from '@cloudscape-design/components/multiselect'"],
  id: 'multiselect',
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
