// url=<SECTION>
// source=src/anchor-navigation/index.tsx
// component=AnchorNavigation
import figma from 'figma';

const instance = figma.selectedInstance;

const state = instance.getEnum('State', {
  Default: 'default',
  Active: 'active',
});

const level = instance.getEnum('Indent', {
  None: 1,
  One: 2,
  Two: 3,
});

const showStatus = instance.getBoolean('Show status label');

const nameLayer = instance.findText('Section name');
const text = nameLayer.type === 'TEXT' ? nameLayer.textContent : '';

const statusLayer = showStatus ? instance.findText('Updated') : null;
const info = statusLayer && statusLayer.type === 'TEXT' ? statusLayer.textContent : '';

export default {
  example: figma.code`
    <AnchorNavigation
      ${state === 'active' ? 'activeHref="#section"' : ''}
      anchors={[
        {
          text: "${text}",
          href: "#section",
          level: ${level},
          ${info ? figma.code`info: "${info}",` : ''}
        },
      ]}
    />
  `,
  imports: ["import AnchorNavigation from '@cloudscape-design/components/anchor-navigation'"],
  id: 'anchor-section',
  metadata: {
    nestable: true,
    props: {
      text,
      level: String(level),
      info,
      active: state === 'active' ? 'true' : '',
    },
  },
};
