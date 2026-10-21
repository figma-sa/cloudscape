// url=<SEGMENTED_CONTROL>
// source=src/segmented-control/index.tsx
// component=SegmentedControl
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const iconAliases = {
  ellipses: 'ellipsis',
  'caret-filled-up': 'caret-up-filled',
  'caret-filled-down': 'caret-down-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

instance.getEnum('Type', {
  'Text+Icon': 'text-icon',
  Text: 'text',
  Icon: 'icon',
});

const showMiddle = instance.getBoolean('Show middle');

const readSegment = (node, id, textName) => {
  const state = node.getEnum('State', {
    Default: 'default',
    Selected: 'selected',
    Disabled: 'disabled',
  });
  const showIcon = node.getBoolean('Show icon');
  const showText = node.getBoolean('Show text');
  const textLayer = node.findText(textName);
  const text = node.getString('Text') || (textLayer.type === 'TEXT' ? textLayer.textContent : '');

  let iconName = '';
  if (showIcon) {
    const swapped = node.getInstanceSwap('Icon');
    if (swapped && swapped.type === 'INSTANCE') {
      const rendered = swapped.executeTemplate();
      const raw = rendered.metadata?.props?.name || (swapped.name !== 'Icon' ? swapped.name : '');
      iconName = iconAliases[raw] || raw;
    }
  }

  return {
    id,
    state,
    text: showText ? text : '',
    iconName,
    iconAlt: !showText && iconName ? text || id : '',
    disabled: state === 'disabled',
  };
};

const slots = [
  ['left', 'Elements / Left (Segmented control)', 'Left'],
  ['middle', 'Elements / Middle (Segmented control)', 'Middle'],
  ['right', 'Elements / Right (Segmented control)', 'Right'],
];

const segments = [];
slots.forEach(([id, name, textName]) => {
  const node = instance.findInstance(name);
  if (!node || node.type !== 'INSTANCE' || node.visible === false) {
    return;
  }
  if (id === 'middle' && !showMiddle) {
    return;
  }
  segments.push(readSegment(node, id, textName));
});

const selected = segments.find(segment => segment.state === 'selected');

const options = segments
  .map(segment => {
    const fields = [`id: "${quote(segment.id)}"`];
    if (segment.text) {
      fields.push(`text: "${quote(segment.text)}"`);
    }
    if (segment.iconName) {
      fields.push(`iconName: "${quote(segment.iconName)}"`);
    }
    if (segment.iconAlt) {
      fields.push(`iconAlt: "${quote(segment.iconAlt)}"`);
    }
    if (segment.disabled) {
      fields.push('disabled: true');
    }
    return `{ ${fields.join(', ')} }`;
  })
  .join(',\n');

export default {
  example: figma.code`
    <SegmentedControl
      selectedId={${selected ? `"${quote(selected.id)}"` : 'null'}}
      options={[
        ${options}
      ]}
    />
  `,
  imports: ["import SegmentedControl from '@cloudscape-design/components/segmented-control'"],
  id: 'segmented-control',
  metadata: {
    nestable: true,
    props: {
      selectedId: selected ? selected.id : '',
    },
  },
};
