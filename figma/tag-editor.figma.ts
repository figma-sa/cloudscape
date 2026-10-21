// url=<TAG_EDITOR>
// source=src/tag-editor/index.tsx
// component=TagEditor
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const state = instance.getEnum('State', {
  Default: 'default',
  Existing: 'existing',
  Limit: 'limit',
  Removal: 'removal',
  Exceeded: 'exceeded',
  Empty: 'empty',
  Loading: 'loading',
});

const readText = (name, root) => {
  const target = root || instance;
  const layer = target.findText(name, { traverseInstances: true });
  return layer && layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const editor = instance.findInstance('Attribute editor');
if (editor && editor.type === 'INSTANCE') {
  editor.getBoolean('Limit text');
  editor.getEnum('Constraint', {
    Default: 'default',
    Empty: 'empty',
    Loading: 'loading',
  });
}

const rowsFromEditor = editor && editor.type === 'INSTANCE' ? editor.getEnum('Rows', { '3': '3', '0': '0' }) : '';
const rowCount =
  state === 'loading' || state === 'empty' ? 0 : Number(rowsFromEditor || (state === 'removal' ? '3' : '3'));

const infoFromLayers = () => {
  const layers = instance.findLayers(
    node => node.type === 'TEXT' && /more|limit of|up to\s+\d+/i.test(String(node.textContent || '')),
    { traverseInstances: true }
  );
  const match = (layers || []).find(node => node.type === 'TEXT' && node.visible !== false);
  return match && match.type === 'TEXT' ? match.textContent || '' : '';
};

const infoText =
  infoFromLayers() ||
  readText('You can add up to 47 more tags.') ||
  readText('You can add up to 47 more items.') ||
  readText('You can add up to 49 more tiems.') ||
  readText('You can add up to 50 tags.');

const status = instance.findInstance('Status indicator (Atom)', { traverseInstances: true });
let statusText = '';
if (status && status.type === 'INSTANCE' && status.visible !== false) {
  status.getEnum('Type', {
    error: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info',
    stopped: 'stopped',
    pending: 'pending',
    'in progress': 'in-progress',
    loading: 'loading',
  });
  statusText = readText('Text', status);
}

const removal = instance.findInstance('Removal text', { traverseInstances: true });
let undoPrompt = '';
let undoButton = '';
if (removal && removal.type === 'INSTANCE' && removal.visible !== false) {
  undoPrompt = readText('This tag will be removed upon saving changes.', removal);
  const link = removal.findInstance('Link button (Atom)');
  if (link && link.type === 'INSTANCE') {
    link.getEnum('Type', { Inline: 'inline' });
    link.getEnum('State', { Default: 'default', Hover: 'hover' });
    undoButton = link.getString('Text') || readText('LinkButton', link);
  }
}

const buttonText = button => {
  if (!button || button.type !== 'INSTANCE') {
    return '';
  }
  button.getEnum('Type', { 'Text only': 'text' });
  button.getEnum('Open', { False: 'false', True: 'true' });
  button.getEnum('State', { Default: 'default', Hover: 'hover', Disabled: 'disabled' });
  return button.getString('Text') || readText('NormalButton', button);
};

const addButton =
  instance.findInstance('Normal button (Atom)', {
    path: ['Button + constraint'],
    traverseInstances: true,
  }) || instance.findInstance('Normal button (Atom)', { traverseInstances: true });
const removeButton = instance.findInstance('Normal button (Atom)', {
  path: ['Button wrapper'],
  traverseInstances: true,
});

const addButtonText = buttonText(addButton) || 'Add new tag';
const removeButtonText = buttonText(removeButton) || 'Remove';

const input = instance.findInstance('Input (Atom)', { traverseInstances: true });
let placeholder = 'Placeholder';
if (input && input.type === 'INSTANCE') {
  input.getBoolean('Show number control');
  input.getBoolean('Search');
  const content = input.getEnum('Content', { Placeholder: 'placeholder', Value: 'value' });
  input.getEnum('State', {
    Default: 'default',
    'Read only': 'read-only',
    Disabled: 'disabled',
    Error: 'error',
    Warning: 'warning',
    Focus: 'focus',
  });
  const text = readText('✏️ Input text', input);
  if (content === 'placeholder' && text) {
    placeholder = text;
  }
}

const headerText = name => {
  const field = instance.findInstance(name, { traverseInstances: true });
  const text = field && field.type === 'INSTANCE' ? readText('Label', field) : '';
  return text && text !== 'Label text' ? text : name;
};

const keyHeader = headerText('Key');
const valueHeader = headerText('Value');

const emptyText =
  readText('No tags associated with the resource') ||
  readText('No attributes associated with the resource') ||
  'No tags associated with the resource';

const loadingText =
  statusText && statusText !== 'Error' ? statusText : 'Loading tags that are associated with this resource';
const exceededText = /exceeded|limit of/i.test(statusText) ? statusText : infoText || statusText;

const markedRows = state === 'removal' ? 1 : 0;
const countedRows = Math.max(rowCount - markedRows, 0);

const limitNumber = text => {
  const source = String(text || '');
  const more = source.match(/up to\s+(\d+)\s+more/i);
  if (more) {
    return Number(more[1]) + countedRows;
  }
  const limitOf = source.match(/limit of\s+(\d+)/i);
  if (limitOf) {
    return Number(limitOf[1]);
  }
  const upTo = source.match(/up to\s+(\d+)/i);
  if (upTo) {
    return Number(upTo[1]);
  }
  return 0;
};

let tagLimit = limitNumber(infoText) || limitNumber(exceededText) || (countedRows === 0 ? 50 : 50);
if (state === 'exceeded' && tagLimit >= countedRows && countedRows > 0) {
  tagLimit = countedRows - 1;
}
if (state === 'limit' && countedRows > 0) {
  tagLimit = limitNumber(infoText) || countedRows;
}

const tags = [];
for (let index = 0; index < rowCount; index += 1) {
  const marked = state === 'removal' && index === rowCount - 1;
  tags.push({
    key: '',
    value: '',
    existing: state === 'existing' || marked,
    marked,
  });
}

const tagLines = tags
  .map(tag => {
    const fields = [
      `key: "${quote(tag.key)}"`,
      `value: "${quote(tag.value)}"`,
      `existing: ${tag.existing ? 'true' : 'false'}`,
    ];
    if (tag.marked) {
      fields.push('markedForRemoval: true');
    }
    return `{ ${fields.join(', ')} }`;
  })
  .join(',\n');

const loadingExample = figma.code`
  <TagEditor
    loading
    i18nStrings={{
      loading: "${quote(loadingText)}",
    }}
  />
`;

const editorExample = figma.code`
  <TagEditor
    ${tagLines ? figma.code`tags={[\n${tagLines}\n]}` : 'tags={[]}'}
    tagLimit={${tagLimit}}
    i18nStrings={{
      keyPlaceholder: "${quote(placeholder)}",
      valuePlaceholder: "${quote(placeholder)}",
      addButton: "${quote(addButtonText)}",
      removeButton: "${quote(removeButtonText)}",
      keyHeader: "${quote(keyHeader)}",
      valueHeader: "${quote(valueHeader)}",
      ${state === 'empty' ? figma.code`emptyTags: "${quote(emptyText)}",` : ''}
      ${state === 'removal' && undoPrompt ? figma.code`undoPrompt: "${quote(undoPrompt)}",` : ''}
      ${state === 'removal' && undoButton ? figma.code`undoButton: "${quote(undoButton)}",` : ''}
      ${state === 'exceeded' && exceededText ? figma.code`tagLimitExceeded: () => "${quote(exceededText)}",` : ''}
    }}
  />
`;

export default {
  example: state === 'loading' ? loadingExample : editorExample,
  imports: ["import TagEditor from '@cloudscape-design/components/tag-editor'"],
  id: 'tag-editor',
  metadata: {
    nestable: true,
    props: {
      state,
      tagLimit: String(tagLimit),
      rows: String(rowCount),
    },
  },
};
