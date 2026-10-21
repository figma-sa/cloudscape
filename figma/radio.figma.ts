// url=<RADIO>
// source=src/radio-group/index.tsx
// component=RadioGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const enabled = instance.getEnum('Enabled', {
  True: true,
  False: false,
});

const selected = instance.getEnum('Selected', {
  True: true,
  False: false,
});

const readOnly = instance.getEnum('Read-only', {
  True: true,
  False: false,
});

const showDescription = instance.getBoolean('Description');

const circle =
  instance.findInstance('Radio button / Enabled (Atom)') ||
  instance.findInstance('Radio button / Disabled (Atom)') ||
  instance.findInstance('Radio button / Read-only (Atom)');
if (circle && circle.type === 'INSTANCE') {
  circle.getEnum('Selected', { True: true, False: false });
}

const labelLayer = instance.findText('✏️ Label');
const label = labelLayer.type === 'TEXT' ? labelLayer.textContent : '';
const value = label || 'option';

const descriptionLayer = instance.findText('✏️ Description');
const description =
  showDescription && descriptionLayer.type === 'TEXT' && descriptionLayer.visible !== false
    ? descriptionLayer.textContent
    : '';

const disabled = enabled === false;

export default {
  example: figma.code`
    <RadioGroup
      value={${selected ? `"${quote(value)}"` : 'null'}}
      ${readOnly ? 'readOnly' : ''}
      items={[
        {
          value: "${quote(value)}",
          label: "${quote(label)}",
          ${description ? figma.code`description: "${quote(description)}",` : ''}
          ${disabled ? 'disabled: true,' : ''}
        },
      ]}
    />
  `,
  imports: ["import RadioGroup from '@cloudscape-design/components/radio-group'"],
  id: 'radio',
  metadata: {
    nestable: true,
    props: {
      label,
      value,
      description,
      selected: selected ? 'true' : '',
      disabled: disabled ? 'true' : '',
      readOnly: readOnly ? 'true' : '',
    },
  },
};
