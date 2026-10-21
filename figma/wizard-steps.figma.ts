// url=<WIZARD_STEPS>
// source=src/wizard/index.tsx
// component=Wizard
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const textOf = (node, name) => {
  if (!node) {
    return '';
  }
  const layer = node.findText(name, { traverseInstances: true });
  return layer && layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const count = instance.getEnum('Count', {
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
});

const bar = instance.findInstance('Step bar');
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
    ${step.optional ? 'isOptional: true,' : ''}
    content: "",
  },`;
};

const s0 = stepCode(steps[0]);
const s1 = stepCode(steps[1]);
const s2 = stepCode(steps[2]);
const s3 = stepCode(steps[3]);
const s4 = stepCode(steps[4]);
const s5 = stepCode(steps[5]);

export default {
  example: figma.code`
    <Wizard
      activeStepIndex={${activeIndex}}
      onNavigate={() => {}}
      i18nStrings={{
        ${stepNumberLine}
        ${optionalText ? figma.code`optional: "${quote(optionalText)}",` : ''}
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
  imports: ["import Wizard from '@cloudscape-design/components/wizard'"],
  id: 'wizard-steps',
  metadata: {
    nestable: true,
    props: {
      count: String(steps.length),
      activeStep: String(activeIndex + 1),
    },
  },
};
