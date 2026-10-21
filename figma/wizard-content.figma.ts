// url=<WIZARD_CONTENT>
// source=src/wizard/index.tsx
// component=Wizard
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

const connectedExample = node => {
  if (!node || node.type !== 'INSTANCE' || node.visible === false) {
    return '';
  }
  const rendered = node.executeTemplate();
  const example = rendered && rendered.example;
  return example && (!Array.isArray(example) || example.length > 0) ? example : '';
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

const page = instance.getEnum('Page', {
  Step: 'step',
  Review: 'review',
});

const wizardSteps = instance.findInstance('Wizard steps');
const count =
  wizardSteps && wizardSteps.type === 'INSTANCE'
    ? wizardSteps.getEnum('Count', {
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
      })
    : 3;

const bar = wizardSteps && wizardSteps.type === 'INSTANCE' ? wizardSteps.findInstance('Step bar') : null;
const activeNumber =
  bar && bar.type === 'INSTANCE'
    ? Number(
        bar.getEnum('Active step', {
          '1': '1',
          '2': '2',
          '3': '3',
          '4': '4',
          '5': '5',
          '6': '6',
        })
      )
    : 1;

const readStep = step => {
  const state = step.getEnum('State', {
    Active: 'active',
    Visited: 'visited',
    Unvisited: 'unvisited',
  });
  const optional = step.getBoolean('Optional');
  return {
    state,
    title: textOf(step, '✏️ Step title'),
    numberLabel: textOf(step, '✏️ Step #'),
    optional,
    optionalLabel: optional ? textOf(step, '– optional') : '',
    description: '',
    info: '',
    content: '',
  };
};

const source = bar && bar.type === 'INSTANCE' ? bar : instance;
const steps = source
  .findLayers(node => node.type === 'INSTANCE' && /^Step \d+$/.test(node.name))
  .filter(node => node.visible !== false)
  .sort((left, right) => Number(left.name.slice(5)) - Number(right.name.slice(5)))
  .slice(0, count || 6)
  .map(readStep);

const activeFromState = steps.findIndex(step => step.state === 'active');
const activeIndex =
  activeFromState >= 0
    ? activeFromState
    : Math.min(Math.max((activeNumber || 1) - 1, 0), Math.max(steps.length - 1, 0));

const formInstance = instance.findInstance('Form');
const hasFormInstance = !!(formInstance && formInstance.type === 'INSTANCE' && formInstance.visible !== false);

const findFormInstance = (name, path) => {
  let found = hasFormInstance
    ? formInstance.findInstance(name, path ? { path } : undefined)
    : instance.findInstance(name, { path: ['Form'].concat(path || []) });
  if ((!found || found.type !== 'INSTANCE') && hasFormInstance && path) {
    found = formInstance.findInstance(name);
  }
  return found && found.type === 'INSTANCE' && found.visible !== false ? found : null;
};

const findFormLayers = predicate => {
  const layers = hasFormInstance
    ? formInstance.findLayers(predicate)
    : instance.findLayers(predicate, { path: ['Form'] });
  return (layers || []).filter(node => node && node.visible !== false);
};

let formCount = 4;
if (hasFormInstance) {
  formCount =
    formInstance.getEnum('Count', {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
    }) || 4;
  formInstance.getBoolean('Previous button');
}

const pageHeader = findFormInstance('Header/Page (Atom)');
let pageTitle = '';
let pageDescription = '';
let infoExample = '';
if (pageHeader && pageHeader.type === 'INSTANCE' && pageHeader.visible !== false) {
  pageHeader.getBoolean('Counter');
  pageHeader.getBoolean('Action stripe');
  const showDescription = pageHeader.getBoolean('Description');
  const showInfo = pageHeader.getBoolean('Info link');
  pageTitle = textOf(pageHeader, 'Page title');
  pageDescription = showDescription ? textOf(pageHeader, 'Description') : '';
  if (showInfo) {
    const link = pageHeader.findInstance('Link (Atom)');
    if (link && link.type === 'INSTANCE' && link.visible !== false) {
      link.getEnum('Type', { Info: 'info' });
      link.getBoolean('External link');
      infoExample = connectedExample(link);
    }
  }
}

const readHeader = header => {
  if (!header || header.type !== 'INSTANCE' || header.visible === false) {
    return { title: '', description: '', counter: '', info: '', actions: '' };
  }
  const isContainer = /Container/.test(header.name);
  if (isContainer) {
    header.getBoolean('Counter');
    header.getBoolean('Info link');
    header.getBoolean('Description');
    header.getBoolean('Action stripe');
  }
  const title = textOf(header, 'Container title') || textOf(header, 'Section title') || textOf(header, 'Page title');
  const description = textOf(header, 'Description');
  const counter = textOf(header, '(#)');
  let info = '';
  const link = header.findInstance('Link (Atom)');
  if (link && link.type === 'INSTANCE' && link.visible !== false) {
    if (isContainer) {
      link.getEnum('Type', { Info: 'info' });
      link.getBoolean('External link');
    }
    info = connectedExample(link);
  }
  const stripe = header.findInstance('Action stripe (Atom)');
  let actions = '';
  if (stripe && stripe.type === 'INSTANCE' && stripe.visible !== false) {
    actions = connectedExample(stripe);
    if (!actions) {
      const button = stripe.findLayers(
        node => node.type === 'INSTANCE' && /button/i.test(node.name) && node.visible !== false
      )[0];
      actions = connectedExample(button);
    }
  }
  return { title, description, counter, info, actions };
};

const readBody = node => {
  if (!node || node.visible === false || node.name === 'Content placeholder') {
    return '';
  }
  return connectedExample(node);
};

const containerCode = container => {
  if (!container || container.visible === false) {
    return '';
  }
  const headerNode = container.findLayers(
    node => node.type === 'INSTANCE' && /Header/.test(node.name) && node.visible !== false
  )[0];
  const header = readHeader(headerNode);
  const headerName = headerNode && headerNode.name;
  const bodies = container.findLayers(
    node => node.type === 'INSTANCE' && node.visible !== false && /Content/.test(node.name) && node.name !== headerName
  );
  const body = readBody(bodies[0]);
  const headerCode = figma.code`<Header variant="h2"${header.counter ? figma.code` counter="${quote(header.counter)}"` : ''}${
    header.description ? figma.code` description="${quote(header.description)}"` : ''
  }${header.info ? figma.code` info={${header.info}}` : ''}${header.actions ? figma.code` actions={${header.actions}}` : ''}>${
    header.title
  }</Header>`;
  return body
    ? figma.code`<Container header={${headerCode}}>${body}</Container>`
    : figma.code`<Container header={${headerCode}} />`;
};

const sectionHeaders = findFormLayers(node => node.type === 'INSTANCE' && node.name === 'Header/Section (Atom)').slice(
  0,
  6
);

const sectionCode = (headerNode, container) => {
  if (!headerNode) {
    return '';
  }
  const header = readHeader(headerNode);
  const headerCode = figma.code`<Header variant="h3" headingTagOverride="h2"${
    header.actions ? figma.code` actions={${header.actions}}` : ''
  }>${header.title}</Header>`;
  return figma.code`<SpaceBetween size="xs">
    ${headerCode}
    ${containerCode(container)}
  </SpaceBetween>`;
};

const containers = findFormLayers(node => node.type === 'INSTANCE' && node.name === 'Container').slice(0, formCount);
const reviewContainers = findFormLayers(node => node.type === 'INSTANCE' && /^Container/.test(node.name));

const c0 = sectionHeaders.length ? '' : containerCode(containers[0]);
const c1 = sectionHeaders.length ? '' : containerCode(containers[1]);
const c2 = sectionHeaders.length ? '' : containerCode(containers[2]);
const c3 = sectionHeaders.length ? '' : containerCode(containers[3]);
const e0 = sectionHeaders.length ? sectionCode(sectionHeaders[0], reviewContainers[0]) : '';
const e1 = sectionHeaders.length ? sectionCode(sectionHeaders[1], reviewContainers[1]) : '';
const e2 = sectionHeaders.length ? sectionCode(sectionHeaders[2], reviewContainers[2]) : '';
const e3 = sectionHeaders.length ? sectionCode(sectionHeaders[3], reviewContainers[3]) : '';
const e4 = sectionHeaders.length ? sectionCode(sectionHeaders[4], reviewContainers[4]) : '';
const e5 = sectionHeaders.length ? sectionCode(sectionHeaders[5], reviewContainers[5]) : '';

const hasSections = !!(e0 || e1 || e2 || e3 || e4 || e5);
const hasContainers = !!(c0 || c1 || c2 || c3);
const contentCode = hasSections
  ? figma.code`<SpaceBetween size="l">
      ${e0}
      ${e1}
      ${e2}
      ${e3}
      ${e4}
      ${e5}
    </SpaceBetween>`
  : hasContainers
    ? figma.code`<SpaceBetween size="l">
        ${c0}
        ${c1}
        ${c2}
        ${c3}
      </SpaceBetween>`
    : '';

if (steps[activeIndex]) {
  if (pageTitle) {
    steps[activeIndex].title = pageTitle;
  }
  steps[activeIndex].description = pageDescription;
  steps[activeIndex].info = infoExample;
  steps[activeIndex].content = contentCode;
}

const cancelButton = findFormInstance('Link button (Atom)', ['Buttons']);
const previousButton = findFormInstance('Normal button (Atom)', ['Buttons']);
const primaryButton = findFormInstance('Primary button (Atom)', ['Buttons']);

if (cancelButton && cancelButton.type === 'INSTANCE') {
  cancelButton.getEnum('Type', { Default: 'default' });
  cancelButton.getEnum('State', { Default: 'default', Hover: 'hover' });
}
if (previousButton && previousButton.type === 'INSTANCE') {
  previousButton.getEnum('Type', { 'Text only': 'text' });
  previousButton.getEnum('Open', { False: 'false' });
  previousButton.getEnum('State', { Default: 'default', Hover: 'hover' });
}
if (primaryButton && primaryButton.type === 'INSTANCE') {
  primaryButton.getEnum('Type', { 'Text only': 'text' });
  primaryButton.getEnum('Open', { False: 'false' });
  primaryButton.getEnum('States', { Default: 'default', Hover: 'hover' });
}

const cancelText = buttonText(cancelButton);
const previousVisible = previousButton && previousButton.type === 'INSTANCE' && previousButton.visible !== false;
const previousText = previousVisible ? buttonText(previousButton) : '';
const primaryText = buttonText(primaryButton);
const isLast = activeIndex === steps.length - 1;

const numberMatch = (steps[0] && steps[0].numberLabel ? steps[0].numberLabel : 'Step #').match(/^(.*?)(?:#|\d+)(.*)$/);
const stepPrefix = numberMatch ? numberMatch[1].replace(/[`$]/g, '') : '';
const stepSuffix = numberMatch ? numberMatch[2].replace(/[`$]/g, '') : '';
const stepNumberLine = numberMatch
  ? figma.code`stepNumberLabel: stepNumber => \`${stepPrefix}\${stepNumber}${stepSuffix}\`,`
  : '';
const optionalSource = steps.find(step => step.optional);
const optionalText = optionalSource
  ? String(optionalSource.optionalLabel || 'optional').replace(/^\s*[–—-]\s*/, '') || 'optional'
  : '';

const stepCode = step => {
  if (!step) {
    return '';
  }
  return figma.code`{
    title: "${quote(step.title)}",
    ${step.description ? figma.code`description: "${quote(step.description)}",` : ''}
    ${step.info ? figma.code`info: (${step.info}),` : ''}
    ${step.optional ? 'isOptional: true,' : ''}
    content: ${step.content || '""'},
  },`;
};

const s0 = stepCode(steps[0]);
const s1 = stepCode(steps[1]);
const s2 = stepCode(steps[2]);
const s3 = stepCode(steps[3]);
const s4 = stepCode(steps[4]);
const s5 = stepCode(steps[5]);

const imports = ["import Wizard from '@cloudscape-design/components/wizard'"];
if (hasContainers || hasSections) {
  imports.push("import Container from '@cloudscape-design/components/container'");
  imports.push("import Header from '@cloudscape-design/components/header'");
  imports.push("import SpaceBetween from '@cloudscape-design/components/space-between'");
}

export default {
  example: figma.code`
    <Wizard
      activeStepIndex={${activeIndex}}
      onNavigate={() => {}}
      ${isLast && primaryText ? figma.code`submitButtonText="${quote(primaryText)}"` : ''}
      i18nStrings={{
        ${stepNumberLine}
        ${optionalText ? figma.code`optional: "${quote(optionalText)}",` : ''}
        ${cancelText ? figma.code`cancelButton: "${quote(cancelText)}",` : ''}
        ${previousText ? figma.code`previousButton: "${quote(previousText)}",` : ''}
        ${!isLast && primaryText ? figma.code`nextButton: "${quote(primaryText)}",` : ''}
      }}
      steps={[
        ${s0}
        ${s1}
        ${s2}
        ${s3}
        ${s4}
        ${s5}
      ]}
    />
  `,
  imports,
  id: 'wizard-content',
  metadata: {
    nestable: true,
    props: {
      page,
      count: String(steps.length),
      activeStep: String(activeIndex + 1),
    },
  },
};
