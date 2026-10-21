// url=<TILE>
// source=src/tiles/index.tsx
// component=Tiles
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const state = instance.getEnum('State', {
  Default: 'default',
  Selected: 'selected',
  Disabled: 'disabled',
  'Read-only': 'read-only',
});

const showDescription = instance.getEnum('Description', {
  Off: false,
  On: true,
});

const showImage = instance.getBoolean('Image');

const connectedRadio = instance.findConnectedInstance('radio');
const radio =
  connectedRadio && connectedRadio.type === 'INSTANCE' ? connectedRadio : instance.findInstance('Radio (Atom)');

let label = '';
let description = '';
if (radio && radio.type === 'INSTANCE') {
  radio.getEnum('Enabled', { True: true, False: false });
  radio.getEnum('Selected', { True: true, False: false });
  radio.getEnum('Read-only', { True: true, False: false });
  radio.getBoolean('Description');

  const rendered = radio.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  const labelLayer = radio.findText('✏️ Label');
  const descriptionLayer = radio.findText('✏️ Description');
  label = props && props.label ? props.label : labelLayer.type === 'TEXT' ? labelLayer.textContent : '';
  description =
    props && props.description
      ? props.description
      : descriptionLayer.type === 'TEXT'
        ? descriptionLayer.textContent
        : '';
}

const selected = state === 'selected';
const disabled = state === 'disabled';
const readOnly = state === 'read-only';
const value = label || 'option';
const descriptionText = showDescription ? description : '';

export default {
  example: figma.code`
    <Tiles
      value={${selected ? `"${quote(value)}"` : 'null'}}
      ${readOnly ? 'readOnly' : ''}
      items={[
        {
          value: "${quote(value)}",
          label: "${quote(label)}",
          ${descriptionText ? figma.code`description: "${quote(descriptionText)}",` : ''}
          ${disabled ? 'disabled: true,' : ''}
        },
      ]}
    />
  `,
  imports: ["import Tiles from '@cloudscape-design/components/tiles'"],
  id: 'tile',
  metadata: {
    nestable: true,
    props: {
      label,
      value,
      description: descriptionText,
      selected: selected ? 'true' : '',
      disabled: disabled ? 'true' : '',
      readOnly: readOnly ? 'true' : '',
      image: showImage ? 'true' : '',
    },
  },
};
