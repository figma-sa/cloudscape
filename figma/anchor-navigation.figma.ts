// url=<ANCHOR_NAVIGATION>
// source=src/anchor-navigation/index.tsx
// component=AnchorNavigation
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Default: 'default',
  Expandable: 'expandable',
});

const titleLayer = instance.findText('✏️ Service name');
const title = titleLayer.type === 'TEXT' ? titleLayer.textContent : '';

const expandable = type === 'expandable' ? instance.findInstance('Expandable section (Atom)') : null;
let header = '';
let expanded = true;
if (expandable && expandable.type === 'INSTANCE') {
  header = expandable.getString('Text');
  expanded = expandable.getEnum('State', {
    Expanded: true,
    Collapsed: false,
  });
}

const connectedSections = instance.findConnectedInstances(node => node.codeConnectId() === 'anchor-section');
const sectionLayers =
  connectedSections && connectedSections.length
    ? connectedSections
    : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements / Section');

const sections = sectionLayers.filter(section => section.visible !== false).slice(0, 10);

const readSection = section => {
  if (!section || section.type !== 'INSTANCE') {
    return null;
  }
  const props = section.executeTemplate().metadata?.props || {};
  let text = props.text || '';
  if (!text) {
    const nameLayer = section.findText('Section name');
    text = nameLayer.type === 'TEXT' ? nameLayer.textContent : '';
  }
  return {
    text,
    level: props.level || '1',
    info: props.info || '',
    active: props.active === 'true',
  };
};

const items = sections.map(readSection).filter(Boolean);

let activeHref = '';
items.forEach((item, index) => {
  if (!activeHref && item.active) {
    activeHref = `#section-${index + 1}`;
  }
});

const anchorSnippet = (index, item) => figma.code`
  {
    text: "${item.text}",
    href: "#section-${index + 1}",
    level: ${item.level},
    ${item.info ? figma.code`info: "${item.info}",` : ''}
  },
`;

const a0 = items[0] ? anchorSnippet(0, items[0]) : '';
const a1 = items[1] ? anchorSnippet(1, items[1]) : '';
const a2 = items[2] ? anchorSnippet(2, items[2]) : '';
const a3 = items[3] ? anchorSnippet(3, items[3]) : '';
const a4 = items[4] ? anchorSnippet(4, items[4]) : '';
const a5 = items[5] ? anchorSnippet(5, items[5]) : '';
const a6 = items[6] ? anchorSnippet(6, items[6]) : '';
const a7 = items[7] ? anchorSnippet(7, items[7]) : '';
const a8 = items[8] ? anchorSnippet(8, items[8]) : '';
const a9 = items[9] ? anchorSnippet(9, items[9]) : '';

const navigation = figma.code`
  <AnchorNavigation
    ${activeHref ? figma.code`activeHref="${activeHref}"` : ''}
    anchors={[
      ${a0}
      ${a1}
      ${a2}
      ${a3}
      ${a4}
      ${a5}
      ${a6}
      ${a7}
      ${a8}
      ${a9}
    ]}
  />
`;

const example =
  type === 'expandable'
    ? figma.code`
        <ExpandableSection
          variant="navigation"
          headerText="${header}"
          ${expanded ? 'defaultExpanded' : ''}
        >
          ${navigation}
        </ExpandableSection>
      `
    : figma.code`
        <Box variant="h2" id="anchor-nav-title">${title}</Box>
        <AnchorNavigation
          ariaLabelledby="anchor-nav-title"
          ${activeHref ? figma.code`activeHref="${activeHref}"` : ''}
          anchors={[
            ${a0}
            ${a1}
            ${a2}
            ${a3}
            ${a4}
            ${a5}
            ${a6}
            ${a7}
            ${a8}
            ${a9}
          ]}
        />
      `;

const imports = ["import AnchorNavigation from '@cloudscape-design/components/anchor-navigation'"];
if (type === 'expandable') {
  imports.push("import ExpandableSection from '@cloudscape-design/components/expandable-section'");
} else {
  imports.push("import Box from '@cloudscape-design/components/box'");
}

export default {
  example,
  imports,
  id: 'anchor-navigation',
  metadata: { nestable: true },
};
