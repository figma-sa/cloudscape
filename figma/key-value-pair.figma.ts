// url=<KEY_VALUE_PAIR>
// source=src/key-value-pairs/index.tsx
// component=KeyValuePairs
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const key = instance.getString('Key text') || '';
const keyLayer = instance.findText('✏️ Key');
const label = key || (keyLayer.type === 'TEXT' ? keyLayer.textContent : '');

const showInfo = instance.getBoolean('Info link');
const infoLink = instance.findInstance('Link (Atom)');
let infoLabel = 'Info';
if (infoLink && infoLink.type === 'INSTANCE') {
  const layers = infoLink.findLayers(layer => layer.type === 'TEXT');
  const layer = layers[0];
  if (layer && layer.type === 'TEXT' && layer.textContent) {
    infoLabel = layer.textContent;
  }
}

const connectedValue = instance.findConnectedInstance('value');
const valueInstance =
  connectedValue && connectedValue.type === 'INSTANCE' ? connectedValue : instance.findInstance('Value');

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

const info = showInfo ? figma.code`info: <Link variant="info" href="#">${infoLabel}</Link>,` : '';

const imports = ["import KeyValuePairs from '@cloudscape-design/components/key-value-pairs'"];
if (showInfo) {
  imports.push("import Link from '@cloudscape-design/components/link'");
}

export default {
  example: figma.code`
    <KeyValuePairs
      items={[
        {
          label: "${quote(label)}",
          value: ${valueCode},
          ${info}
        },
      ]}
    />
  `,
  imports,
  id: 'key-value-pair',
  metadata: {
    nestable: true,
    props: {
      label,
      info: showInfo ? 'true' : '',
    },
  },
};
