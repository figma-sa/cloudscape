// url=<STEPS>
// source=src/steps/index.tsx
// component=Steps
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

const statusTypes = {
  error: 'error',
  success: 'success',
  warning: 'warning',
  info: 'info',
  stopped: 'stopped',
  pending: 'pending',
  'in progress': 'in-progress',
  loading: 'loading',
  'not-started': 'not-started',
  log: 'log',
};

const readLocal = item => {
  const showContent = item.getEnum('Content', { Yes: 'yes', No: 'no' }) === 'yes';
  const connectorLines = item.getEnum('Connector', { Yes: 'visible', No: 'none' });

  const statusNode = item.findInstance('Status indicator (Atom)');
  let status = 'success';
  let statusText = '';
  if (statusNode && statusNode.type === 'INSTANCE' && statusNode.visible !== false) {
    const rendered = statusNode.executeTemplate();
    const props = rendered && rendered.metadata ? rendered.metadata.props : null;
    status = (props && props.type) || statusNode.getEnum('Type', statusTypes) || 'success';
    statusText = (props && props.text) || textOf(statusNode, 'Text');
  }

  const popover = item.findInstance('Popover trigger (Atom)');
  let popoverCode = '';
  let popoverUsesStatus = false;
  if (popover && popover.type === 'INSTANCE' && popover.visible !== false) {
    const popoverType = popover.getEnum('Type', {
      Text: 'text',
      'Status - red': 'status',
      'Status - blue': 'status',
      'Status - yellow': 'status',
      'Status - green': 'status',
      'Status - grey': 'status',
    });
    const nestedStatus = popover
      .findLayers(node => node.type === 'INSTANCE' && /Status indicator/.test(node.name))
      .find(node => node.visible !== false);
    if (popoverType === 'status' && nestedStatus && nestedStatus.type === 'INSTANCE') {
      const rendered = nestedStatus.executeTemplate();
      const props = rendered && rendered.metadata ? rendered.metadata.props : null;
      const type = (props && props.type) || nestedStatus.getEnum('Type', statusTypes) || '';
      const text = (props && props.text) || textOf(nestedStatus, 'Text');
      popoverUsesStatus = true;
      popoverCode = figma.code`<Popover triggerType="text"><StatusIndicator${
        type ? figma.code` type="${type}"` : ''
      }>${text}</StatusIndicator></Popover>`;
    } else {
      popoverCode = figma.code`<Popover triggerType="text-inline">${textOf(popover, 'Popover trigger')}</Popover>`;
    }
  }

  let details = '';
  if (showContent) {
    const placeholder = item.findInstance('Content placeholder');
    if (placeholder && placeholder.type === 'INSTANCE' && placeholder.visible !== false) {
      const example = exampleOf(placeholder);
      const text = textOf(placeholder, 'SWAP WITH CONTENT');
      if (example) {
        details = example;
      } else if (text && text !== 'SWAP WITH CONTENT') {
        details = figma.code`"${quote(text)}"`;
      }
    }
  }

  return { status, statusText, connectorLines, popoverCode, popoverUsesStatus, details };
};

const readStep = item => {
  const local = readLocal(item);
  const rendered = item.executeTemplate();
  const props = rendered && rendered.metadata ? rendered.metadata.props : null;
  if (!props || !props.status) {
    return local;
  }
  return {
    ...local,
    status: props.status || local.status,
    statusText: props.header || local.statusText,
    connectorLines: props.connectorLines || local.connectorLines,
  };
};

const connected = instance.findConnectedInstances(node => node.codeConnectId() === 'step-item');
const steps = (
  connected && connected.length
    ? connected
    : instance.findLayers(node => node.type === 'INSTANCE' && node.name === 'Step/Item')
)
  .filter(node => node.visible !== false)
  .slice(0, 12)
  .map(readStep);

const connectorLines =
  steps.length > 1
    ? steps.slice(0, -1).some(step => step.connectorLines === 'visible')
      ? 'visible'
      : 'none'
    : (steps[0] && steps[0].connectorLines) || 'visible';

const stepCode = step => {
  const header = step.popoverCode
    ? figma.code`<>${step.statusText} ${step.popoverCode}</>`
    : figma.code`"${quote(step.statusText)}"`;
  return figma.code`{
    status: "${step.status}",
    header: ${header},${
      step.details
        ? figma.code`
    details: ${step.details},`
        : ''
    }
  }`;
};

const imports = ["import Steps from '@cloudscape-design/components/steps'"];
if (steps.some(step => step.popoverCode)) {
  imports.push("import Popover from '@cloudscape-design/components/popover'");
}
if (steps.some(step => step.popoverUsesStatus)) {
  imports.push("import StatusIndicator from '@cloudscape-design/components/status-indicator'");
}

export default {
  example: figma.code`
    <Steps
      connectorLines="${connectorLines}"
      steps={[
        ${joinSections(steps.map(stepCode), ',\n        ')}
      ]}
    />
  `,
  imports,
  id: 'steps',
  metadata: {
    nestable: true,
    props: {
      connectorLines,
      count: String(steps.length),
    },
  },
};
