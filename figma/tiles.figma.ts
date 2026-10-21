// url=<TILES>
// source=src/tiles/index.tsx
// component=Tiles
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const count = instance.getEnum('Count', {
  '2': '2',
  '3': '3',
  '4+': '4+',
});

const readTile = (tile, index) => {
  const rendered = tile.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  if (props && (props.label || props.value)) {
    return {
      label: props.label || '',
      value: props.value || props.label || `option-${index + 1}`,
      description: props.description || '',
      selected: props.selected === 'true',
      disabled: props.disabled === 'true',
      readOnly: props.readOnly === 'true',
    };
  }

  const state = tile.getEnum('State', {
    Default: 'default',
    Selected: 'selected',
    Disabled: 'disabled',
    'Read-only': 'read-only',
  });
  const showDescription = tile.getEnum('Description', { Off: false, On: true });
  tile.getBoolean('Image');
  const radio = tile.findInstance('Radio (Atom)');
  const labelLayer = radio && radio.type === 'INSTANCE' ? radio.findText('✏️ Label') : tile.findText('✏️ Label');
  const descriptionLayer =
    radio && radio.type === 'INSTANCE' ? radio.findText('✏️ Description') : tile.findText('✏️ Description');
  const label = labelLayer && labelLayer.type === 'TEXT' ? labelLayer.textContent : '';
  return {
    label,
    value: label || `option-${index + 1}`,
    description:
      showDescription && descriptionLayer && descriptionLayer.type === 'TEXT' ? descriptionLayer.textContent : '',
    selected: state === 'selected',
    disabled: state === 'disabled',
    readOnly: state === 'read-only',
  };
};

const limit = count === '2' || count === '3' ? Number(count) : 8;
const tiles = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Tile (Atom)')
  .filter(node => node.visible !== false)
  .slice(0, limit);

const usedValues = {};
const records = tiles.map((tile, index) => {
  const record = readTile(tile, index);
  const base = record.value || `option-${index + 1}`;
  const seen = usedValues[base] || 0;
  usedValues[base] = seen + 1;
  record.value = seen === 0 ? base : `${base}-${seen + 1}`;
  return record;
});

const selected = records.find(record => record.selected);
const readOnly = records.some(record => record.readOnly);
const columns = count === '3' ? 2 : count === '4+' ? 4 : 0;

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
    <Tiles
      value={${selected ? `"${quote(selected.value)}"` : 'null'}}
      ${columns ? figma.code`columns={${columns}}` : ''}
      ${readOnly ? 'readOnly' : ''}
      items={[
        ${items}
      ]}
    />
  `,
  imports: ["import Tiles from '@cloudscape-design/components/tiles'"],
  id: 'tiles',
  metadata: {
    nestable: true,
    props: {
      count,
      value: selected ? selected.value : '',
    },
  },
};
