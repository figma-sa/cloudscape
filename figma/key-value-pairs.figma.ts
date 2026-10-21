// url=<KEY_VALUE_PAIRS>
// source=src/key-value-pairs/index.tsx
// component=KeyValuePairs
import figma from 'figma';

const instance = figma.selectedInstance;

const columnCount = instance.getEnum('Columns', {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
});

const rowCount = instance.getEnum('Rows', {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
});

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const pairSnippet = pair => {
  const key = pair.getString('Key text') || '';
  const keyLayer = pair.findText('✏️ Key');
  const label = key || (keyLayer.type === 'TEXT' ? keyLayer.textContent : '');
  const showInfo = pair.getBoolean('Info link');

  const infoLink = pair.findInstance('Link (Atom)');
  let infoLabel = 'Info';
  if (infoLink && infoLink.type === 'INSTANCE') {
    const layers = infoLink.findLayers(layer => layer.type === 'TEXT');
    const layer = layers[0];
    if (layer && layer.type === 'TEXT' && layer.textContent) {
      infoLabel = layer.textContent;
    }
  }

  const connectedValue = pair.findConnectedInstance('value');
  const valueInstance =
    connectedValue && connectedValue.type === 'INSTANCE' ? connectedValue : pair.findInstance('Value');

  let valueText = '';
  if (valueInstance && valueInstance.type === 'INSTANCE') {
    const valueLayer = valueInstance.findText('✏️ Value');
    valueText = valueLayer.type === 'TEXT' ? valueLayer.textContent : '';
  }

  let valueCode = figma.code`"${quote(valueText)}"`;
  if (valueInstance && valueInstance.type === 'INSTANCE') {
    const rendered = valueInstance.executeTemplate();
    const example = rendered && rendered.example;
    if (example && (!Array.isArray(example) || example.length > 0)) {
      valueCode = figma.code`{${example}}`;
    }
  }

  return {
    showInfo,
    snippet: figma.code`
      {
        label: "${quote(label)}",
        value: ${valueCode},
        ${showInfo ? figma.code`info: <Link variant="info" href="#">${infoLabel}</Link>,` : ''}
      },
    `,
  };
};

const columnSnippet = column => {
  const rows = column.getEnum('Row', {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
  });
  const showTitle = column.getBoolean('Show column title');
  const titleInstance = column.findInstance('Column title');
  let title = '';
  if (titleInstance && titleInstance.type === 'INSTANCE') {
    titleInstance.getEnum('variant', { 'Heading 3': 'heading-3' });
    const titleLayer = titleInstance.findText('Label');
    title = titleLayer.type === 'TEXT' ? titleLayer.textContent : '';
  }

  const pairs = column
    .findLayers(node => node.type === 'INSTANCE' && node.name === 'Key value pair (Atom)')
    .filter(pair => pair.visible !== false)
    .slice(0, rows || rowCount || 1)
    .map(pairSnippet);

  const p0 = pairs[0] ? pairs[0].snippet : '';
  const p1 = pairs[1] ? pairs[1].snippet : '';
  const p2 = pairs[2] ? pairs[2].snippet : '';
  const p3 = pairs[3] ? pairs[3].snippet : '';
  const p4 = pairs[4] ? pairs[4].snippet : '';

  return {
    showInfo: pairs.some(pair => pair.showInfo),
    snippet: figma.code`
      {
        type: "group",
        ${showTitle ? figma.code`title: "${quote(title)}",` : ''}
        items: [
          ${p0}
          ${p1}
          ${p2}
          ${p3}
          ${p4}
        ],
      },
    `,
  };
};

const columns = instance
  .findLayers(node => node.type === 'INSTANCE' && /^Column \d+$/.test(node.name))
  .filter(column => column.visible !== false)
  .slice(0, columnCount || 1)
  .map(columnSnippet);

const c0 = columns[0] ? columns[0].snippet : '';
const c1 = columns[1] ? columns[1].snippet : '';
const c2 = columns[2] ? columns[2].snippet : '';
const c3 = columns[3] ? columns[3].snippet : '';

const imports = ["import KeyValuePairs from '@cloudscape-design/components/key-value-pairs'"];
if (columns.some(column => column.showInfo)) {
  imports.push("import Link from '@cloudscape-design/components/link'");
}

export default {
  example: figma.code`
    <KeyValuePairs
      columns={${columnCount || 1}}
      items={[
        ${c0}
        ${c1}
        ${c2}
        ${c3}
      ]}
    />
  `,
  imports,
  id: 'key-value-pairs',
  metadata: {
    nestable: true,
    props: {
      columns: String(columnCount || 1),
      rows: String(rowCount || 1),
    },
  },
};
