// url=<RADIO_GROUP>
// source=src/radio-group/index.tsx
// component=RadioGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const count = Number(
  instance.getEnum('Count', {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
  })
);

const readText = (node, name) => {
  const layer = node.findText(name);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const readRadio = (radio, index) => {
  const rendered = radio.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  if (props && (props.label || props.value)) {
    return {
      label: props.label || '',
      value: props.value || props.label || `option-${index + 1}`,
      description: props.description || '',
      disabled: props.disabled === 'true',
      selected: props.selected === 'true',
      readOnly: props.readOnly === 'true',
    };
  }

  const enabled = radio.getEnum('Enabled', { True: true, False: false });
  const selected = radio.getEnum('Selected', { True: true, False: false });
  const readOnly = radio.getEnum('Read-only', { True: true, False: false });
  const showDescription = radio.getBoolean('Description');
  const circle =
    radio.findInstance('Radio button / Enabled (Atom)') ||
    radio.findInstance('Radio button / Disabled (Atom)') ||
    radio.findInstance('Radio button / Read-only (Atom)');
  if (circle && circle.type === 'INSTANCE') {
    circle.getEnum('Selected', { True: true, False: false });
  }

  const label = readText(radio, '✏️ Label');
  return {
    label,
    value: label || `option-${index + 1}`,
    description: showDescription ? readText(radio, '✏️ Description') : '',
    disabled: enabled === false,
    selected: selected === true,
    readOnly: readOnly === true,
  };
};

const radios = instance
  .findLayers(node => node.type === 'INSTANCE' && /^Radio \d+$/.test(node.name))
  .filter(node => node.visible !== false)
  .slice(0, count || 5);

const usedValues = {};
const records = radios.map((radio, index) => {
  const record = readRadio(radio, index);
  const base = record.value || `option-${index + 1}`;
  const seen = usedValues[base] || 0;
  usedValues[base] = seen + 1;
  record.value = seen === 0 ? base : `${base}-${seen + 1}`;
  return record;
});

const selected = records.find(record => record.selected);
const readOnly = records.some(record => record.readOnly);

const items = records
  .map(record => {
    const fields = [`value: "${quote(record.value)}"`, `label: "${quote(record.label)}"`];
    if (record.description) {
      fields.push(`description: "${quote(record.description)}"`);
    }
    if (record.disabled) {
      fields.push('disabled: true');
    }
    return `{ ${fields.join(', ')} }`;
  })
  .join(',\n');

export default {
  example: figma.code`
    <RadioGroup
      value={${selected ? `"${quote(selected.value)}"` : 'null'}}
      ${readOnly ? 'readOnly' : ''}
      items={[
        ${items}
      ]}
    />
  `,
  imports: ["import RadioGroup from '@cloudscape-design/components/radio-group'"],
  id: 'radio-group',
  metadata: {
    nestable: true,
    props: {
      count: String(count),
      value: selected ? selected.value : '',
    },
  },
};
