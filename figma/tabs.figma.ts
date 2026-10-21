// url=<TABS>
// source=src/tabs/index.tsx
// component=Tabs
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const count = instance.getEnum('Count', {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
});

const variant = instance.getEnum('Container', {
  Off: 'default',
  On: 'container',
});

const contentInstance = instance.getInstanceSwap('Content');
let contentCode = '';
if (
  contentInstance &&
  contentInstance.type === 'INSTANCE' &&
  contentInstance.visible !== false &&
  contentInstance.name !== 'Content placeholder'
) {
  const rendered = contentInstance.executeTemplate();
  const example = rendered && rendered.example;
  if (example && (!Array.isArray(example) || example.length > 0)) {
    contentCode = example;
  }
}

const connectedTabs = instance.findConnectedInstances(node => node.codeConnectId() === 'tab');
const tabLayers = (
  connectedTabs && connectedTabs.length
    ? connectedTabs
    : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Tab (Atom)')
)
  .filter(node => node.visible !== false)
  .slice(0, count || 7);

const readAction = tab => {
  let iconButtons = tab.findConnectedInstances(node => node.codeConnectId() === 'icon-button');
  if (!iconButtons || iconButtons.length === 0) {
    iconButtons = tab.findLayers(node => node.type === 'INSTANCE' && node.name === 'Icon button (Atom)');
  }
  const dropdown = iconButtons && iconButtons[0];
  if (!dropdown || dropdown.type !== 'INSTANCE' || dropdown.visible === false) {
    return '';
  }
  const rendered = dropdown.executeTemplate();
  const example = rendered && rendered.example;
  return example && (!Array.isArray(example) || example.length > 0) ? example : '';
};

const readTab = tab => {
  if (!tab || tab.type !== 'INSTANCE') {
    return { label: '', active: '', disabled: '', dismissible: '', actionCode: '' };
  }

  const rendered = tab.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  if (props && props.label) {
    return {
      label: props.label,
      active: props.active || '',
      disabled: props.disabled || '',
      dismissible: props.dismissible || '',
      actionCode: props.action === 'true' ? readAction(tab) : '',
    };
  }

  const state = tab.getEnum('State', {
    Default: 'default',
    Active: 'active',
    Disabled: 'disabled',
  });
  const type = tab.getEnum('Type', {
    Default: 'default',
    'With actions': 'with-actions',
  });
  const withActions = type === 'with-actions';
  const textLayer = tab.findText('✏️ Tab name');
  return {
    label: textLayer.type === 'TEXT' ? textLayer.textContent : '',
    active: state === 'active' ? 'true' : '',
    disabled: state === 'disabled' ? 'true' : '',
    dismissible: withActions && tab.getBoolean('Dismissible') ? 'true' : '',
    actionCode: withActions && tab.getBoolean('Icon dropdown') ? readAction(tab) : '',
  };
};

const records = tabLayers.map(readTab);
const activeIndex = records.findIndex(record => record.active === 'true');
const contentIndex = contentCode ? (activeIndex >= 0 ? activeIndex : 0) : -1;
const activeId = activeIndex >= 0 ? `tab-${activeIndex + 1}` : '';

const tabSnippet = (id, record, includeContent) => figma.code`
  {
    id: "${id}",
    label: "${quote(record.label)}",
    ${record.disabled === 'true' ? 'disabled: true,' : ''}
    ${record.dismissible === 'true' ? 'dismissible: true,' : ''}
    ${record.actionCode ? figma.code`action: (${record.actionCode}),` : ''}
    ${includeContent ? figma.code`content: (${contentCode}),` : ''}
  },
`;

const snippets = records.map((record, index) => tabSnippet(`tab-${index + 1}`, record, index === contentIndex));

export default {
  example: figma.code`
    <Tabs
      variant="${variant}"
      ${activeId ? figma.code`activeTabId="${activeId}"` : ''}
      tabs={[
        ${snippets[0]}
        ${snippets[1] || ''}
        ${snippets[2] || ''}
        ${snippets[3] || ''}
        ${snippets[4] || ''}
        ${snippets[5] || ''}
        ${snippets[6] || ''}
      ]}
    />
  `,
  imports: ["import Tabs from '@cloudscape-design/components/tabs'"],
  id: 'tabs',
  metadata: {
    nestable: true,
    props: {
      count: String(count),
      variant,
      activeTabId: activeId,
    },
  },
};
