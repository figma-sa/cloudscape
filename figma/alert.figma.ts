// url=<ALERT>
// source=src/alert/index.tsx
// component=Alert
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
  const metadata = rendered && rendered.metadata;
  return {
    example: example && (!Array.isArray(example) || example.length > 0) ? example : '',
    label: metadata && metadata.props ? metadata.props.label || '' : '',
  };
};

const type = instance.getEnum('Type', {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
  Info: 'info',
});

const dismissible = instance.getBoolean('Dismissable');
const showHeader = instance.getBoolean('Header');
const showButton = instance.getBoolean('Button');
const showPlaceholder = instance.getBoolean('Placeholder');
// The expand carets are visual only. Alert has no expand prop.
instance.getBoolean('Expand-closed');
instance.getBoolean('Expand-open');

const headerContent = showHeader ? textOf(instance, '✏️ Header') : '';
const descriptionContent = textOf(instance, '✏️ Description');

const connectedAction = showButton ? instance.findConnectedInstance('alert-flash-button') : null;
const actionInstance =
  connectedAction && connectedAction.type === 'INSTANCE'
    ? connectedAction
    : showButton
      ? instance.findInstance('.alert-flash-button')
      : null;

let actionCode = '';
let actionFromChild = false;
if (actionInstance && actionInstance.type === 'INSTANCE' && actionInstance.visible !== false) {
  const rendered = exampleOf(actionInstance);
  if (rendered.example) {
    actionCode = rendered.example;
    actionFromChild = true;
  } else if (rendered.label) {
    actionCode = figma.code`<Button variant="normal">${rendered.label}</Button>`;
  }
}

let placeholderCode = '';
if (showPlaceholder) {
  const placeholder = instance.findInstance('Content placeholder');
  if (placeholder && placeholder.type === 'INSTANCE' && placeholder.visible !== false) {
    const rendered = exampleOf(placeholder);
    const text = textOf(placeholder, 'SWAP WITH CONTENT');
    if (rendered.example) {
      placeholderCode = rendered.example;
    } else if (text && text !== 'SWAP WITH CONTENT') {
      placeholderCode = text;
    }
  }
}

const imports = ["import Alert from '@cloudscape-design/components/alert'"];
if (actionCode && !actionFromChild) {
  imports.push("import Button from '@cloudscape-design/components/button'");
}

export default {
  example: figma.code`
    <Alert
      type="${type}"
      ${headerContent ? figma.code`header="${quote(headerContent)}"` : ''}
      ${dismissible ? 'dismissible' : ''}
      ${dismissible ? 'onDismiss={() => {}}' : ''}
      ${actionCode ? figma.code`action={${actionCode}}` : ''}
    >
      ${descriptionContent}
      ${placeholderCode}
    </Alert>
  `,
  imports,
  id: 'alert',
  metadata: {
    nestable: true,
    props: {
      type,
      header: headerContent,
      dismissible: dismissible ? 'true' : '',
    },
  },
};
