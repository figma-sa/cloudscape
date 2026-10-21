// url=<PAGINATION>
// source=src/pagination/index.tsx
// component=Pagination
import figma from 'figma';

const instance = figma.selectedInstance;

const pagesCount = instance.getEnum('Count', {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
});

const state = instance.getEnum('State', {
  Enabled: 'enabled',
  Disabled: 'disabled',
});

const openEnd = instance.getBoolean('Open ended');

// Previous and next arrows are built into Pagination.
instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'IconWrapper')
  .forEach(icon => {
    if (icon.type !== 'INSTANCE') {
      return;
    }
    icon.getEnum('Size', { '16 - normal': 'normal' });
    icon.getInstanceSwap('Icon');
  });

export default {
  example: figma.code`
    <Pagination
      currentPageIndex={1}
      pagesCount={${pagesCount}}
      ${openEnd ? 'openEnd' : ''}
      ${state === 'disabled' ? 'disabled' : ''}
    />
  `,
  imports: ["import Pagination from '@cloudscape-design/components/pagination'"],
  id: 'pagination',
  metadata: {
    nestable: true,
    props: {
      pagesCount,
      openEnd: openEnd ? 'true' : '',
      disabled: state === 'disabled' ? 'true' : '',
    },
  },
};
