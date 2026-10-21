// url=<BREADCRUMB>
// source=src/breadcrumb-group/index.tsx
// component=BreadcrumbGroup
import figma from 'figma';

const instance = figma.selectedInstance;

const state = instance.getEnum('State', {
  Current: 'current',
  Parent: 'parent',
});

const textLayer = instance.findText('✏️ Breadcrumb text');
const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';

export default {
  example: figma.code`<BreadcrumbGroup items={[{ text: "${text}", href: "#" }]} />`,
  imports: ["import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group'"],
  id: 'breadcrumb',
  metadata: {
    nestable: true,
    props: {
      text,
      href: '#',
      current: state === 'current' ? 'true' : '',
    },
  },
};
