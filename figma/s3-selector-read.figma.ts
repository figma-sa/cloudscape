// url=<S3_SELECTOR_READ>
// source=src/s3-resource-selector/index.tsx
// component=S3ResourceSelector
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const textOf = (node, name) => {
  if (!node || !node.findText) {
    return '';
  }
  const layer = node.findText(name, { traverseInstances: true });
  return layer && layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const joinSections = (sections, separator) => {
  const present = sections.filter(Boolean);
  if (!present.length) {
    return '';
  }
  return present.reduce((combined, section, index) => {
    if (index === 0) {
      return section;
    }
    return figma.code`${combined}${separator}${section}`;
  });
};

const readUriControl = control => {
  if (!control || control.type !== 'INSTANCE') {
    return { text: '', content: 'placeholder', state: 'default' };
  }
  const trigger = control.findInstance('Elements / Trigger (Autosuggest)');
  const node = trigger && trigger.type === 'INSTANCE' ? trigger : control;
  if (node.name !== 'Input (Atom)' && node.name !== 'Elements / Trigger (Autosuggest)') {
    return { text: textOf(node, '✏️ Input text'), content: 'placeholder', state: 'default' };
  }
  if (node.name === 'Input (Atom)') {
    node.getBoolean('Show number control');
    node.getBoolean('Search');
  }
  if (node.name === 'Elements / Trigger (Autosuggest)') {
    node.getBoolean('Close icon');
  }
  const content = node.getEnum('Content', {
    Placeholder: 'placeholder',
    Value: 'value',
  });
  const state = node.getEnum('State', {
    Default: 'default',
    'Read only': 'read-only',
    Disabled: 'disabled',
    Error: 'error',
    Warning: 'warning',
    Focus: 'focus',
  });
  return { text: textOf(node, '✏️ Input text'), content, state };
};

const isVisibleInstance = node => node && node.type === 'INSTANCE' && node.visible !== false;

const readVersion = field => {
  if (!field || field.type !== 'INSTANCE') {
    return { label: '', placeholder: '', value: '' };
  }
  field.getBoolean('Description');
  field.getBoolean('Optional');
  field.getBoolean('Info');
  field.getBoolean('Constraints');
  field.getBoolean('Files uploaded');
  field.getBoolean('Error message');
  field.getEnum('Type', { Default: 'default' });
  const select = field.findInstance('Select (Atom)');
  if (!isVisibleInstance(select)) {
    return { label: textOf(field, 'Label'), placeholder: '', value: '' };
  }
  select.getEnum('Open', { True: true, False: false });
  select.getEnum('Type', {
    Simple: 'simple',
    Groups: 'groups',
    Icon: 'icon',
    Description: 'description',
    Features: 'features',
    'With auto filtering': 'auto',
  });
  select.getEnum('State', {
    Default: 'default',
    Disabled: 'disabled',
    Error: 'error',
  });
  select.getBoolean('Filter-label');
  const content = select.getEnum('Content', {
    Placeholder: 'placeholder',
    Value: 'value',
  });
  const trigger = select.findInstance('Elements / Trigger (Select)');
  if (trigger && trigger.type === 'INSTANCE') {
    trigger.getBoolean('Description');
    trigger.getBoolean('With tags');
    trigger.getBoolean('With Label');
    trigger.getEnum('Opened', { Off: 'off', On: 'on' });
    trigger.getEnum('State', { Default: 'default', Error: 'error', Disabled: 'disabled' });
    trigger.getEnum('Type', { Simple: 'simple', 'Small icon': 'small-icon', 'Big icon': 'big-icon' });
    trigger.getEnum('Content', { Placeholder: 'placeholder', Value: 'value' });
  }
  const text = textOf(trigger && trigger.type === 'INSTANCE' ? trigger : select, '✏️ Input text');
  return {
    label: textOf(field, 'Label'),
    placeholder: content === 'placeholder' ? text : '',
    value: content === 'value' ? text : '',
  };
};

const readField = field => {
  if (isVisibleInstance(field.findInstance('Select (Atom)'))) {
    return null;
  }
  field.getBoolean('Description');
  field.getBoolean('Optional');
  field.getBoolean('Info');
  field.getBoolean('Constraints');
  field.getBoolean('Files uploaded');
  const showError = field.getBoolean('Error message');
  field.getEnum('Type', { Default: 'default' });
  const swapped = field.getInstanceSwap('Input type');
  const control =
    swapped && swapped.type === 'INSTANCE'
      ? swapped
      : field.findInstance('Autosuggest (Atom)') || field.findInstance('Input (Atom)');
  const uri = readUriControl(control);
  return {
    label: textOf(field, 'Label'),
    invalid: showError || uri.state === 'error',
    placeholder: uri.content === 'placeholder' ? uri.text : '',
    value: uri.content === 'value' ? uri.text : '',
  };
};

const readButton = button => {
  const type = button.getEnum('Type', {
    'External link': 'external',
    'Text only': 'text',
    'Text + icon': 'icon',
    Dropdown: 'dropdown',
    'Dropdown+Main': 'dropdown-main',
  });
  const state = button.getEnum('State', {
    Default: 'default',
    Hover: 'hover',
    Disabled: 'disabled',
  });
  button.getEnum('Open', { False: false, True: true });
  return {
    type,
    disabled: state === 'disabled',
    text: button.getString('Text') || textOf(button, 'NormalButton'),
  };
};

instance.getEnum('Resource state', {
  'Not selected': 'empty',
  Selected: 'selected',
});

const divider = instance.findInstance('Divider');
if (divider && divider.type === 'INSTANCE' && divider.visible !== false) {
  divider.getEnum('Type', { Vertical: 'vertical' });
}

const fieldNodes = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Form field')
  .filter(node => node.visible !== false);
const versionField = readVersion(fieldNodes.find(field => isVisibleInstance(field.findInstance('Select (Atom)'))));
const uriField = fieldNodes.map(readField).find(Boolean) || { label: '', invalid: false, placeholder: '', value: '' };

const buttons = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Normal button (Atom)')
  .filter(node => node.visible !== false)
  .map(readButton);
const viewButton = buttons.find(button => button.type === 'external') || buttons[0];
const browseButton = buttons.find(button => button !== viewButton) || null;

const versionsCode = versionField.value
  ? figma.code`() => Promise.resolve([{ VersionId: "${quote(versionField.value)}", LastModified: "${quote(versionField.value)}" }])`
  : figma.code`() => Promise.resolve([])`;

const strings = [
  uriField.label ? figma.code`inContextUriLabel: "${quote(uriField.label)}"` : '',
  versionField.label ? figma.code`inContextVersionSelectLabel: "${quote(versionField.label)}"` : '',
  versionField.placeholder ? figma.code`inContextSelectPlaceholder: "${quote(versionField.placeholder)}"` : '',
  viewButton && viewButton.text ? figma.code`inContextViewButton: "${quote(viewButton.text)}"` : '',
  browseButton && browseButton.text ? figma.code`inContextBrowseButton: "${quote(browseButton.text)}"` : '',
];

export default {
  example: figma.code`
    <S3ResourceSelector
      resource={{ uri: "${quote(uriField.value)}"${versionField.value ? figma.code`, versionId: "${quote(versionField.value)}"` : ''} }}
      selectableItemsTypes={['objects', 'versions']}
      ${uriField.placeholder ? figma.code`inputPlaceholder="${quote(uriField.placeholder)}"` : ''}
      ${viewButton && !viewButton.disabled ? 'viewHref="#"' : ''}
      ${uriField.invalid ? 'invalid' : ''}
      ${
        strings.some(Boolean)
          ? figma.code`i18nStrings={{
        ${joinSections(strings, ',\n        ')}
      }}`
          : ''
      }
      fetchBuckets={() => Promise.resolve([])}
      fetchObjects={() => Promise.resolve([])}
      fetchVersions={${versionsCode}}
      onChange={() => {}}
    />
  `,
  imports: ["import S3ResourceSelector from '@cloudscape-design/components/s3-resource-selector'"],
  id: 's3-selector-read',
  metadata: {
    nestable: true,
    props: {
      mode: 'read',
      uri: uriField.value,
      versionId: versionField.value,
    },
  },
};
