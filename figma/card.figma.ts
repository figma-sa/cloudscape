// url=<CARD>
// source=src/cards/index.tsx
// component=Cards
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  'Multi select': 'multi',
  'Single select': 'single',
  Simple: 'simple',
});

const selected = instance.getEnum('Selected', {
  False: false,
  True: true,
});

const showActions = instance.getBoolean('In-context actions');

const titleLayer = instance.findText('Item 1');
const title = titleLayer.type === 'TEXT' ? titleLayer.textContent : '';

const iconAliases = {
  ellipses: 'ellipsis',
  'caret-filled-up': 'caret-up-filled',
  'caret-filled-down': 'caret-down-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

let actionIcon = '';
if (showActions) {
  const actionButton = instance.findInstance('Icon button (Atom)');
  if (actionButton && actionButton.type === 'INSTANCE') {
    const icon = actionButton.getInstanceSwap('Icon');
    if (icon && icon.type === 'INSTANCE') {
      const rendered = icon.executeTemplate();
      const raw = rendered.metadata?.props?.name || (icon.name !== 'Icon' ? icon.name : '');
      actionIcon = iconAliases[raw] || raw;
    }
  }
}

const readPair = pair => {
  if (!pair || pair.type !== 'INSTANCE') {
    return null;
  }
  let key = pair.getString('Key text') || '';
  if (!key) {
    const keyLayer = pair.findText('✏️ Key');
    key = keyLayer.type === 'TEXT' ? keyLayer.textContent : '';
  }
  const valueLayer = pair.findText('✏️ Value', { traverseInstances: true });
  const value = valueLayer && valueLayer.type === 'TEXT' ? valueLayer.textContent : '';
  return { key, value };
};

const pairs = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Key value pair (Atom)')
  .filter(pair => pair.visible !== false)
  .slice(0, 4)
  .map(readPair)
  .filter(pair => pair && (pair.key || pair.value));

const action = showActions
  ? figma.code`<Button variant="inline-icon" ${actionIcon ? figma.code`iconName="${actionIcon}"` : ''} />`
  : '';

const sectionSnippet = (pair, index) => figma.code`
  {
    id: "section-${index + 1}",
    header: "${pair.key}",
    content: () => ${index === 0 && action ? figma.code`<>${pair.value}${action}</>` : figma.code`"${pair.value}"`},
  },
`;

const s0 = pairs[0] ? sectionSnippet(pairs[0], 0) : '';
const s1 = pairs[1] ? sectionSnippet(pairs[1], 1) : '';
const s2 = pairs[2] ? sectionSnippet(pairs[2], 2) : '';
const s3 = pairs[3] ? sectionSnippet(pairs[3], 3) : '';

const selectionType = type === 'multi' ? 'multi' : type === 'single' ? 'single' : '';

const imports = ["import Cards from '@cloudscape-design/components/cards'"];
if (showActions) {
  imports.push("import Button from '@cloudscape-design/components/button'");
}

export default {
  example: figma.code`
    <Cards
      items={[{ name: "${title}" }]}
      ${selectionType ? figma.code`selectionType="${selectionType}"` : ''}
      ${selectionType && selected ? figma.code`selectedItems={[{ name: "${title}" }]}` : ''}
      cardDefinition={{
        header: item => item.name,
        sections: [
          ${s0}
          ${s1}
          ${s2}
          ${s3}
        ],
      }}
    />
  `,
  imports,
  id: 'card',
  metadata: {
    nestable: true,
    props: {
      title,
      selectionType,
      selected: selected ? 'true' : '',
    },
  },
};
