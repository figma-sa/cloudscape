// url=<TOGGLE>
// source=src/toggle/index.tsx
// component=Toggle
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const checked = instance.getEnum('Selected', {
  Off: false,
  On: true,
});

const enabled = instance.getEnum('Enabled', {
  True: true,
  False: false,
});

const readOnly = instance.getEnum('Read-only', {
  True: true,
  False: false,
});

const showLabel = instance.getBoolean('Label');
const showDescription = instance.getBoolean('Description');
const descriptionText = instance.getString('Description text');

const labelLayer = instance.findText('Label text');
const label = labelLayer.type === 'TEXT' && labelLayer.visible !== false ? labelLayer.textContent : '';
const description = showDescription ? descriptionText : '';
const disabled = enabled === false;

const control = figma.code`
  <Toggle
    checked={${checked ? 'true' : 'false'}}
    ${disabled ? 'disabled' : ''}
    ${readOnly ? 'readOnly' : ''}
    ${description ? figma.code`description="${quote(description)}"` : ''}
  >
    ${showLabel ? label : ''}
  </Toggle>
`;

export default {
  example: control,
  imports: ["import Toggle from '@cloudscape-design/components/toggle'"],
  id: 'toggle',
  metadata: {
    nestable: true,
    props: {
      checked: checked ? 'true' : '',
      label: showLabel ? label : '',
      description,
      disabled: disabled ? 'true' : '',
      readOnly: readOnly ? 'true' : '',
    },
  },
};
