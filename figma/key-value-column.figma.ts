// url=<KEY_VALUE_COLUMN>
// source=src/key-value-pairs/index.tsx
// component=KeyValuePairs
import figma from 'figma';

const instance = figma.selectedInstance;

const rowCount = instance.getEnum('Row', {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
});

const showTitle = instance.getBoolean('Show column title');

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const titleInstance = instance.findInstance('Column title');
let title = '';
if (titleInstance && titleInstance.type === 'INSTANCE') {
  titleInstance.getEnum('variant', { 'Heading 3': 'heading-3' });
  const titleLayer = titleInstance.findText('Label');
  title = titleLayer.type === 'TEXT' ? titleLayer.textContent : '';
}

const pairs = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Key value pair (Atom)')
  .filter(pair => pair.visible !== false)
  .slice(0, rowCount || 1);

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

  return figma.code`
    {
      label: "${quote(label)}",
      value: ${valueCode},
      ${showInfo ? figma.code`info: <Link variant="info" href="#">${infoLabel}</Link>,` : ''}
    },
  `;
};

const p0 = pairs[0] ? pairSnippet(pairs[0]) : '';
const p1 = pairs[1] ? pairSnippet(pairs[1]) : '';
const p2 = pairs[2] ? pairSnippet(pairs[2]) : '';
const p3 = pairs[3] ? pairSnippet(pairs[3]) : '';
const p4 = pairs[4] ? pairSnippet(pairs[4]) : '';

const items = showTitle
  ? figma.code`
      {
        type: "group",
        title: "${quote(title)}",
        items: [
          ${p0}
          ${p1}
          ${p2}
          ${p3}
          ${p4}
        ],
      },
    `
  : figma.code`
      ${p0}
      ${p1}
      ${p2}
      ${p3}
      ${p4}
    `;

const anyInfo = pairs.some(pair => pair.getBoolean('Info link'));
const imports = ["import KeyValuePairs from '@cloudscape-design/components/key-value-pairs'"];
if (anyInfo) {
  imports.push("import Link from '@cloudscape-design/components/link'");
}

export default {
  example: figma.code`
    <KeyValuePairs
      items={[
        ${items}
      ]}
    />
  `,
  imports,
  id: 'key-value-column',
  metadata: {
    nestable: true,
    props: {
      title: showTitle ? title : '',
      rows: String(rowCount || 1),
    },
  },
};
