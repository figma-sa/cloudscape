// url=<TABLE>
// source=src/table/index.tsx
// component=Table
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

const exampleOf = node => {
  if (!node || node.type !== 'INSTANCE' || node.visible === false) {
    return '';
  }
  const rendered = node.executeTemplate();
  const example = rendered && rendered.example;
  return example && (!Array.isArray(example) || example.length > 0) ? example : '';
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

const statusTypeOf = node => {
  const rendered = node.executeTemplate();
  const props = rendered && rendered.metadata ? rendered.metadata.props : null;
  const type = node.getEnum('Type', {
    error: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info',
    stopped: 'stopped',
    pending: 'pending',
    'in progress': 'in-progress',
    loading: 'loading',
  });
  return {
    type: (props && props.type) || type || '',
    text: (props && props.text) || textOf(node, 'Text'),
  };
};

const readPopover = node => {
  node.getEnum('Type', {
    Text: 'text',
    'Status - red': 'status',
    'Status - blue': 'status',
    'Status - yellow': 'status',
    'Status - green': 'status',
    'Status - grey': 'status',
  });
  const status = node
    .findLayers(child => child.type === 'INSTANCE' && /Status indicator/.test(child.name))
    .find(child => child.visible !== false);
  if (status && status.type === 'INSTANCE') {
    return { kind: 'popover-status', ...statusTypeOf(status) };
  }
  return { kind: 'popover', text: textOf(node, 'Popover trigger'), type: '' };
};

const readLink = node => {
  node.getEnum('Type', {
    primary: 'primary',
    secondary: 'secondary',
    Info: 'info',
    Button: 'button',
  });
  const external = node.getBoolean('External link');
  const rendered = node.executeTemplate();
  const props = rendered && rendered.metadata ? rendered.metadata.props : null;
  return {
    kind: 'link',
    text: (props && props.text) || textOf(node, '✏️ Link text'),
    type: '',
    external: props ? props.external === 'true' : !!external,
    variant: (props && props.variant) || '',
  };
};

const readCell = (cell, columnType) => {
  if (columnType === 'status') {
    const status = cell.findInstance('Status indicator (Atom)');
    if (status && status.type === 'INSTANCE' && status.visible !== false) {
      return { kind: 'status', ...statusTypeOf(status), external: false, variant: '' };
    }
  }
  if (columnType === 'popover') {
    const trigger = cell.findInstance('Popover trigger (Atom)');
    if (trigger && trigger.type === 'INSTANCE' && trigger.visible !== false) {
      return { ...readPopover(trigger), external: false, variant: '' };
    }
  }
  if (columnType === 'link') {
    const link = cell.findInstance('Link (Atom)');
    if (link && link.type === 'INSTANCE' && link.visible !== false) {
      return readLink(link);
    }
  }
  const layer = cell.findText('cell');
  const text = layer && layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
  return { kind: 'text', text, type: '', external: false, variant: '' };
};

const tableVariant = instance.getEnum('Type', {
  Default: 'container',
  Simple: 'container',
  Embedded: 'embedded',
});
const showFooter = instance.getBoolean('Footer');
const showFilter = instance.getBoolean('Filter');
const contentDefault = instance.getInstanceSwap('Content (D)');
const contentSimple = instance.getInstanceSwap('Content (S)');

const visibleContent = [contentDefault, contentSimple].find(
  node => node && node.type === 'INSTANCE' && node.visible !== false
);
const content =
  visibleContent ||
  instance
    .findLayers(
      node =>
        node.type === 'INSTANCE' && (node.name === 'Content' || node.name === 'Table simple content (Detach as needed)')
    )
    .find(node => node.visible !== false) ||
  null;

let expandable = false;
if (content && content.type === 'INSTANCE' && content.name === 'Content') {
  content.getEnum('SelectionType', { Multi: 'multi', Single: 'single' });
  content.getEnum('Count', { None: 'none' });
  expandable = content.getEnum('Expandable', { False: 'false', True: 'true' }) === 'true';
  content.getEnum('Type', { Column: 'column' });
}

const columnNodes = content
  ? content
      .findLayers(node => node.type === 'INSTANCE' && /Column/.test(node.name))
      .filter(node => node.visible !== false)
  : [];

const selectColumn = columnNodes.find(node => /Select/.test(node.name));
const selectionType =
  selectColumn && selectColumn.type === 'INSTANCE'
    ? selectColumn.getEnum('Type', { Multi: 'multi', Single: 'single' })
    : '';

const dataColumns = columnNodes
  .filter(node => /Data/.test(node.name))
  .slice(0, 8)
  .map((column, index) => {
    const columnType = column.getEnum('Type', {
      Link: 'link',
      Status: 'status',
      Popover: 'popover',
      Text: 'text',
      Editable: 'editable',
      Expandable: 'expandable',
    });
    const header = column.findInstance('Header');
    let label = '';
    let sort = 'none';
    let editable = columnType === 'editable';
    if (header && header.type === 'INSTANCE') {
      header.getBoolean('External');
      header.getBoolean('Divider');
      header.getBoolean('Indent');
      editable = editable || header.getBoolean('Editable');
      sort = header.getEnum('Sort', {
        Off: 'off',
        Ascending: 'ascending',
        Descending: 'descending',
        None: 'none',
      });
      label = textOf(header, 'cell');
    }
    const cells = column
      .findLayers(node => node.type === 'INSTANCE' && /Cell/.test(node.name))
      .filter(node => node.visible !== false)
      .slice(0, 10)
      .map(cell => readCell(cell, columnType));
    const kind = cells[0] && cells[0].kind !== 'text' ? cells[0].kind : 'text';
    if (columnType === 'expandable') {
      expandable = true;
    }
    return {
      field: `column${index + 1}`,
      header: label,
      kind,
      sort,
      sortable: sort === 'off' || sort === 'ascending' || sort === 'descending',
      editable,
      external: cells.some(cell => cell.external),
      linkVariant: (cells.find(cell => cell.variant) || {}).variant || '',
      cells,
    };
  });

const sortedColumn = dataColumns.find(column => column.sort === 'ascending' || column.sort === 'descending');
const rowCount = dataColumns.reduce((max, column) => Math.max(max, column.cells.length), 0);

const cellRenderer = column => {
  const field = column.field;
  if (column.kind === 'status') {
    return figma.code`item => <StatusIndicator type={item.${field}Type}>{item.${field}}</StatusIndicator>`;
  }
  if (column.kind === 'popover-status') {
    return figma.code`item => <Popover triggerType="text"><StatusIndicator type={item.${field}Type}>{item.${field}}</StatusIndicator></Popover>`;
  }
  if (column.kind === 'popover') {
    return figma.code`item => <Popover triggerType="text-inline">{item.${field}}</Popover>`;
  }
  if (column.kind === 'link') {
    const variant =
      column.linkVariant && column.linkVariant !== 'primary' && column.linkVariant !== 'button'
        ? ` variant="${column.linkVariant}"`
        : '';
    return figma.code`item => <Link${variant}${column.external ? ' external' : ''} href="#">{item.${field}}</Link>`;
  }
  return figma.code`item => item.${field}`;
};

const definitionCode = column => {
  const editConfig = column.editable
    ? figma.code`
    editConfig: {
      editingCell: (item, { currentValue, setValue }) => (
        <Input value={currentValue ?? item.${column.field} ?? ""} onChange={({ detail }) => setValue(detail.value)} />
      ),
    },`
    : '';
  return figma.code`{
    id: "${column.field}",
    header: "${quote(column.header)}",
    cell: ${cellRenderer(column)},${
      column.sortable
        ? figma.code`
    sortingField: "${column.field}",`
        : ''
    }${editConfig}
  }`;
};

const itemCode = index => {
  const fields = dataColumns.map(column => {
    const cell = column.cells[index] || { text: '', type: '' };
    const value = figma.code`${column.field}: "${quote(cell.text)}"`;
    if (column.kind === 'status' || column.kind === 'popover-status') {
      return figma.code`${value}, ${column.field}Type: "${quote(cell.type)}"`;
    }
    return value;
  });
  return figma.code`{ id: "item-${index + 1}", ${joinSections(fields, ', ')} }`;
};

const items = [];
for (let index = 0; index < rowCount; index += 1) {
  items.push(itemCode(index));
}

const headerNode = instance
  .findLayers(
    node => node.type === 'INSTANCE' && (node.name === 'Header' || node.name === 'Header/Container - Normal (Atom)')
  )
  .find(node => node.visible !== false);

let headerCode = '';
if (headerNode && headerNode.type === 'INSTANCE') {
  headerNode.getBoolean('Counter');
  headerNode.getBoolean('Info link');
  headerNode.getBoolean('Description');
  headerNode.getBoolean('Action stripe');
  const title = textOf(headerNode, 'Container title');
  const description = textOf(headerNode, 'Description');
  const counter = textOf(headerNode, '(#)');
  const info = exampleOf(headerNode.findInstance('Link (Atom)'));
  const actions = exampleOf(headerNode.findInstance('Action stripe (Atom)'));
  headerCode = figma.code`<Header${counter ? figma.code` counter="${quote(counter)}"` : ''}${
    description ? figma.code` description="${quote(description)}"` : ''
  }${info ? figma.code` info={${info}}` : ''}${actions ? figma.code` actions={${actions}}` : ''}>${title}</Header>`;
}

let filterCode = '';
let paginationCode = '';
let preferencesCode = '';
const filters = instance.findInstance('Filters');
if (showFilter && filters && filters.type === 'INSTANCE' && filters.visible !== false) {
  filters.getBoolean('Show constraint in property filter');
  filters.getEnum('Type', { Text: 'text' });
  filters.getEnum('Matches', { False: 'false', True: 'true' });
  const trigger = filters.findInstance('Elements / Trigger (Autosuggest)');
  let filteringText = '';
  let filteringPlaceholder = '';
  if (trigger && trigger.type === 'INSTANCE' && trigger.visible !== false) {
    trigger.getBoolean('Close icon');
    trigger.getEnum('State', { Default: 'default' });
    const contentKind = trigger.getEnum('Content', { Placeholder: 'placeholder' });
    const input = textOf(trigger, '✏️ Input text');
    if (contentKind === 'placeholder') {
      filteringPlaceholder = input;
    } else {
      filteringText = input;
    }
  }
  filterCode = figma.code`<TextFilter filteringText="${quote(filteringText)}"${
    filteringPlaceholder ? figma.code` filteringPlaceholder="${quote(filteringPlaceholder)}"` : ''
  } />`;
  paginationCode = exampleOf(filters.findInstance('Pagination (Atom)'));
  preferencesCode = exampleOf(filters.findInstance('Icon button (Atom)'));
}

let footerCode = '';
if (showFooter) {
  const footer = instance
    .findLayers(node => node.type === 'INSTANCE' && /Footer/.test(node.name))
    .find(node => node.visible !== false);
  if (footer && footer.type === 'INSTANCE') {
    footerCode = exampleOf(footer.findInstance('Link (Atom)'));
  }
}

const hasStatus = dataColumns.some(column => column.kind === 'status' || column.kind === 'popover-status');
const hasPopover = dataColumns.some(column => column.kind === 'popover' || column.kind === 'popover-status');
const hasLink = dataColumns.some(column => column.kind === 'link');
const hasEditable = dataColumns.some(column => column.editable);
const hasSortable = dataColumns.some(column => column.sortable);

const imports = ["import Table from '@cloudscape-design/components/table'"];
if (headerCode) {
  imports.push("import Header from '@cloudscape-design/components/header'");
}
if (filterCode) {
  imports.push("import TextFilter from '@cloudscape-design/components/text-filter'");
}
if (hasStatus) {
  imports.push("import StatusIndicator from '@cloudscape-design/components/status-indicator'");
}
if (hasPopover) {
  imports.push("import Popover from '@cloudscape-design/components/popover'");
}
if (hasLink) {
  imports.push("import Link from '@cloudscape-design/components/link'");
}
if (hasEditable) {
  imports.push("import Input from '@cloudscape-design/components/input'");
}

export default {
  example: figma.code`
    <Table
      variant="${tableVariant}"
      trackBy="id"
      ${selectionType ? figma.code`selectionType="${selectionType}"` : ''}
      ${sortedColumn ? figma.code`sortingColumn={{ sortingField: "${sortedColumn.field}" }}` : ''}
      ${sortedColumn ? figma.code`sortingDescending={${sortedColumn.sort === 'descending' ? 'true' : 'false'}}` : ''}
      ${hasSortable ? 'onSortingChange={() => {}}' : ''}
      ${
        expandable
          ? figma.code`expandableRows={{
        getItemChildren: () => [],
        isItemExpandable: () => true,
        expandedItems: [],
        onExpandableItemToggle: () => {},
      }}`
          : ''
      }
      columnDefinitions={[
        ${joinSections(dataColumns.map(definitionCode), ',\n        ')}
      ]}
      items={[
        ${joinSections(items, ',\n        ')}
      ]}
      ${headerCode ? figma.code`header={${headerCode}}` : ''}
      ${filterCode ? figma.code`filter={${filterCode}}` : ''}
      ${paginationCode ? figma.code`pagination={${paginationCode}}` : ''}
      ${preferencesCode ? figma.code`preferences={${preferencesCode}}` : ''}
      ${footerCode ? figma.code`footer={${footerCode}}` : ''}
    />
  `,
  imports,
  id: 'table',
  metadata: {
    nestable: true,
    props: {
      variant: tableVariant,
      selectionType: selectionType || '',
      columns: String(dataColumns.length),
      rows: String(rowCount),
    },
  },
};
