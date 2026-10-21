// url=<TAB>
// source=src/tabs/index.tsx
// component=Tabs
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const state = instance.getEnum('State', {
  Default: 'default',
  Active: 'active',
  Disabled: 'disabled',
});

const type = instance.getEnum('Type', {
  Default: 'default',
  'With actions': 'with-actions',
});

const dismissible = instance.getBoolean('Dismissible');
const showDropdown = instance.getBoolean('Icon dropdown');
const withActions = type === 'with-actions';

const textLayer = instance.findText('✏️ Tab name');
const label = textLayer.type === 'TEXT' ? textLayer.textContent : '';

let iconButtons = instance.findConnectedInstances(node => node.codeConnectId() === 'icon-button');
if (!iconButtons || iconButtons.length === 0) {
  iconButtons = instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Icon button (Atom)');
}

const dropdown = withActions && showDropdown ? iconButtons[0] : null;
let actionCode;
if (dropdown && dropdown.type === 'INSTANCE') {
  actionCode = dropdown.executeTemplate().example;
}

const showDismiss = withActions && dismissible;

export default {
  example: figma.code`
    <Tabs
      ${state === 'active' ? 'activeTabId="tab"' : ''}
      tabs={[
        {
          id: "tab",
          label: "${quote(label)}",
          ${state === 'disabled' ? 'disabled: true,' : ''}
          ${showDismiss ? 'dismissible: true,' : ''}
          ${actionCode ? figma.code`action: (${actionCode}),` : ''}
        },
      ]}
    />
  `,
  imports: ["import Tabs from '@cloudscape-design/components/tabs'"],
  id: 'tab',
  metadata: {
    nestable: true,
    props: {
      label,
      active: state === 'active' ? 'true' : '',
      disabled: state === 'disabled' ? 'true' : '',
      dismissible: showDismiss ? 'true' : '',
      action: withActions && showDropdown ? 'true' : '',
    },
  },
};
