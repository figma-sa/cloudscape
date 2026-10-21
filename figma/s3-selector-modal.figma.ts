// url=<S3_SELECTOR_MODAL>
// source=src/s3-resource-selector/index.tsx
// component=S3ResourceSelector
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const textOf = (node, name) => {
  if (!node || !node.findText) {
    return '';
  }
  const layer = node.findText(name, { traverseInstances: true });
  return layer && layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const buttonText = button => {
  if (!button || button.type !== 'INSTANCE' || button.visible === false) {
    return '';
  }
  const fromProperty = button.getString('Text');
  if (fromProperty) {
    return fromProperty;
  }
  const layers = button.findLayers(node => node.type === 'TEXT' && node.visible !== false);
  return layers[0] && layers[0].textContent ? layers[0].textContent : '';
};

const joinSections = (sections, separator) => {
  const present = sections.filter(Boolean);
  if (!present.length) {
    return '';
  }
  return present.reduce((combined, section, index) => {
    if (index === 0) {
      return section;
    }
    return figma.code`${combined}${separator}${section}`;
  });
};

const modal = instance.findInstance('Modal');
const modalNode = modal && modal.type === 'INSTANCE' ? modal : instance;
const title = textOf(modalNode, 'Modal title');

const cancelButton = modalNode.findInstance('Link button (Atom)', { traverseInstances: true, path: ['Footer'] });
const submitButton = modalNode.findInstance('Primary button (Atom)', { traverseInstances: true, path: ['Footer'] });
const cancelText = buttonText(cancelButton && cancelButton.type === 'INSTANCE' ? cancelButton : null);
const submitText = buttonText(submitButton && submitButton.type === 'INSTANCE' ? submitButton : null);

const table = modalNode.findInstance('Table');
let bucketsLabel = '';
let bucketsPlaceholder = '';
let columnHeaders = [];
if (table && table.type === 'INSTANCE' && table.visible !== false) {
  bucketsLabel = textOf(table, 'Container title');
  const filters = table.findInstance('Filters');
  if (filters && filters.type === 'INSTANCE' && filters.visible !== false) {
    bucketsPlaceholder = textOf(filters, '✏️ Input text');
  }
  const content = [table.findInstance('Content'), table.findInstance('Table simple content (Detach as needed)')].find(
    node => node && node.type === 'INSTANCE' && node.visible !== false
  );
  if (content && content.type === 'INSTANCE') {
    columnHeaders = content
      .findLayers(node => node.type === 'INSTANCE' && /Column \/ Data/.test(node.name))
      .filter(node => node.visible !== false)
      .map(column => {
        const header = column.findInstance('Header');
        return header && header.type === 'INSTANCE' ? textOf(header, 'cell') : '';
      })
      .filter(Boolean);
  }
}

const strings = [
  title ? figma.code`modalTitle: "${quote(title)}"` : '',
  cancelText ? figma.code`modalCancelButton: "${quote(cancelText)}"` : '',
  submitText ? figma.code`modalSubmitButton: "${quote(submitText)}"` : '',
  bucketsLabel ? figma.code`selectionBuckets: "${quote(bucketsLabel)}"` : '',
  bucketsPlaceholder ? figma.code`selectionBucketsSearchPlaceholder: "${quote(bucketsPlaceholder)}"` : '',
  columnHeaders[0] ? figma.code`columnBucketName: "${quote(columnHeaders[0])}"` : '',
  columnHeaders[1] ? figma.code`columnBucketCreationDate: "${quote(columnHeaders[1])}"` : '',
  columnHeaders[2] ? figma.code`columnBucketRegion: "${quote(columnHeaders[2])}"` : '',
];

export default {
  example: figma.code`
    <S3ResourceSelector
      resource={{ uri: "" }}
      selectableItemsTypes={['buckets', 'objects']}
      ${
        strings.some(Boolean)
          ? figma.code`i18nStrings={{
        ${joinSections(strings, ',\n        ')}
      }}`
          : ''
      }
      fetchBuckets={() => Promise.resolve([])}
      fetchObjects={() => Promise.resolve([])}
      fetchVersions={() => Promise.resolve([])}
      onChange={() => {}}
    />
  `,
  imports: ["import S3ResourceSelector from '@cloudscape-design/components/s3-resource-selector'"],
  id: 's3-selector-modal',
  metadata: {
    nestable: true,
    props: {
      mode: 'modal',
      title,
    },
  },
};
