// url=<BREADCRUMB_GROUP>
// source=src/breadcrumb-group/index.tsx
// component=BreadcrumbGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const parentCount = instance.getEnum('Parent count', {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
});

const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'breadcrumb');
const crumbLayers =
  connected && connected.length
    ? connected
    : instance.findLayers(
        node =>
          node.type === 'INSTANCE' &&
          (node.name === 'Parent1' ||
            node.name === 'Parent2' ||
            node.name === 'Parent3' ||
            node.name === 'Parent4' ||
            node.name === 'Current page')
      );

const crumbs = crumbLayers.filter(crumb => crumb.visible !== false).slice(0, parentCount + 1);

const readCrumb = crumb => {
  if (!crumb || crumb.type !== 'INSTANCE') {
    return null;
  }
  const props = crumb.executeTemplate().metadata?.props || {};
  let text = props.text || '';
  if (!text) {
    const textLayer = crumb.findText('✏️ Breadcrumb text');
    text = textLayer.type === 'TEXT' ? textLayer.textContent : '';
  }
  return {
    text,
    href: props.href || '#',
  };
};

const items = crumbs.map(readCrumb).filter(Boolean);

const itemSnippet = item => figma.code`{ text: "${item.text}", href: "${item.href}" },`;

const i0 = items[0] ? itemSnippet(items[0]) : '';
const i1 = items[1] ? itemSnippet(items[1]) : '';
const i2 = items[2] ? itemSnippet(items[2]) : '';
const i3 = items[3] ? itemSnippet(items[3]) : '';
const i4 = items[4] ? itemSnippet(items[4]) : '';
const i5 = items[5] ? itemSnippet(items[5]) : '';
const i6 = items[6] ? itemSnippet(items[6]) : '';
const i7 = items[7] ? itemSnippet(items[7]) : '';

export default {
  example: figma.code`
    <BreadcrumbGroup
      items={[
        ${i0}
        ${i1}
        ${i2}
        ${i3}
        ${i4}
        ${i5}
        ${i6}
        ${i7}
      ]}
    />
  `,
  imports: ["import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group'"],
  id: 'breadcrumb-group',
  metadata: { nestable: true },
};
