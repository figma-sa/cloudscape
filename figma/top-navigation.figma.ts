// url=<TOP_NAVIGATION>
// source=src/top-navigation/index.tsx
// component=TopNavigation
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const size = instance.getEnum('Size', {
  Wide: 'wide',
  Medium: 'medium',
});

instance.getEnum('Type', {
  'Non-console': 'non-console',
});

const titleLayer = instance.findText('Service name');
const title = titleLayer.type === 'TEXT' ? titleLayer.textContent : '';

const autosuggest = instance.findInstance('Autosuggest (Atom)');
const searchIcon = instance.findInstance('search');
const hasAutosuggest = autosuggest && autosuggest.type === 'INSTANCE' && autosuggest.visible !== false;
const hasSearchIcon = searchIcon && searchIcon.type === 'INSTANCE' && searchIcon.visible !== false;
const hasSearch = hasAutosuggest || hasSearchIcon;

let placeholder = '';
if (hasAutosuggest) {
  autosuggest.getEnum('Open', { False: false, True: true });
  autosuggest.getEnum('Type', { Simple: 'simple' });
  autosuggest.getEnum('State', { Default: 'default' });
  const content = autosuggest.getEnum('Content', { Placeholder: 'placeholder', Value: 'value' });
  const textLayer = autosuggest.findText('✏️ Input text', { traverseInstances: true });
  const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';
  if (content !== 'value') {
    placeholder = text;
  }
}

const linkLayer = instance.findText('Link');
const linkText = linkLayer.type === 'TEXT' && linkLayer.visible !== false ? linkLayer.textContent : '';
const external = instance.findInstance('external');
const linkExternal = external && external.type === 'INSTANCE' && external.visible !== false;

const bell = instance.findInstance('bell');
const settings = instance.findInstance('settings');
const profile = instance.findInstance('user-profile');

const divider = instance.findInstance('Divider');
if (divider && divider.type === 'INSTANCE') {
  divider.getEnum('Type', { Vertical: 'vertical' });
}

const utilities = [];
if (linkText) {
  utilities.push(`{ type: "button", text: "${quote(linkText)}", href: "#"${linkExternal ? ', external: true' : ''} }`);
}
if (bell && bell.type === 'INSTANCE' && bell.visible !== false) {
  utilities.push('{ type: "button", iconName: "bell", badge: true }');
}
if (settings && settings.type === 'INSTANCE' && settings.visible !== false) {
  utilities.push('{ type: "button", iconName: "settings" }');
}
if (profile && profile.type === 'INSTANCE' && profile.visible !== false) {
  utilities.push('{ type: "menu-dropdown", iconName: "user-profile", items: [] }');
}

const search = hasSearch
  ? figma.code`<Autosuggest value="" ${placeholder ? figma.code`placeholder="${quote(placeholder)}"` : ''} />`
  : '';

export default {
  example: figma.code`
    <TopNavigation
      identity={{
        href: "#",
        title: "${quote(title)}",
      }}
      ${search ? figma.code`search={${search}}` : ''}
      utilities={[
        ${utilities.join(',\n')}
      ]}
    />
  `,
  imports: hasSearch
    ? [
        "import TopNavigation from '@cloudscape-design/components/top-navigation'",
        "import Autosuggest from '@cloudscape-design/components/autosuggest'",
      ]
    : ["import TopNavigation from '@cloudscape-design/components/top-navigation'"],
  id: 'top-navigation',
  metadata: {
    nestable: true,
    props: {
      size,
      title,
    },
  },
};
