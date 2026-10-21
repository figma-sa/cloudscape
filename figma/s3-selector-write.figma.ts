// url=<S3_SELECTOR_WRITE>
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

const readField = field => {
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

const fields = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Form field')
  .filter(node => node.visible !== false)
  .map(readField);
const uriField = fields[0] || { label: '', invalid: false, placeholder: '', value: '' };

const buttons = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Normal button (Atom)')
  .filter(node => node.visible !== false)
  .map(readButton);
const viewButton = buttons.find(button => button.type === 'external') || buttons[0];
const browseButton = buttons.find(button => button !== viewButton) || null;

const strings = [
  uriField.label ? figma.code`inContextUriLabel: "${quote(uriField.label)}"` : '',
  viewButton && viewButton.text ? figma.code`inContextViewButton: "${quote(viewButton.text)}"` : '',
  browseButton && browseButton.text ? figma.code`inContextBrowseButton: "${quote(browseButton.text)}"` : '',
];

export default {
  example: figma.code`
    <S3ResourceSelector
      resource={{ uri: "${quote(uriField.value)}" }}
      selectableItemsTypes={['buckets', 'objects']}
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
      fetchVersions={() => Promise.resolve([])}
      onChange={() => {}}
    />
  `,
  imports: ["import S3ResourceSelector from '@cloudscape-design/components/s3-resource-selector'"],
  id: 's3-selector-write',
  metadata: {
    nestable: true,
    props: {
      mode: 'write',
      uri: uriField.value,
    },
  },
};
