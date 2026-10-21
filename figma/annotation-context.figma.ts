// url=<ANNOTATION_CONTEXT>
// source=src/annotation-context/index.tsx
// component=AnnotationContext
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const direction = instance.getEnum('Arrow', {
  Top: 'top',
  Right: 'right',
  Bottom: 'bottom',
  Left: 'left',
});

const showPrevious = instance.getBoolean('Previous button');

const titleLayer = instance.findText('Task 1: Do a thing');
const titleText = titleLayer.type === 'TEXT' && titleLayer.visible !== false ? titleLayer.textContent || '' : '';

const stepLayer = instance.findText('Step 2/3');
const stepText = stepLayer.type === 'TEXT' && stepLayer.visible !== false ? stepLayer.textContent || '' : '';

const readButtonText = (button, layerName) => {
  if (!button || button.type !== 'INSTANCE') {
    return '';
  }
  const fromProperty = button.getString('Text');
  if (fromProperty) {
    return fromProperty;
  }
  const layer = button.findText(layerName);
  return layer.type === 'TEXT' && layer.visible !== false ? layer.textContent || '' : '';
};

const previousButton = instance.findInstance('Link button (Atom)');
if (previousButton && previousButton.type === 'INSTANCE') {
  previousButton.getEnum('Type', { Default: 'default' });
  previousButton.getEnum('State', { Default: 'default', Hover: 'hover' });
  previousButton.getBoolean('Icon');
}
const previousText = readButtonText(previousButton, 'LinkButton') || 'Previous';

const nextButton = instance.findInstance('Normal button (Atom)');
if (nextButton && nextButton.type === 'INSTANCE') {
  nextButton.getEnum('Type', { 'Text only': 'text' });
  nextButton.getEnum('Open', { False: 'false' });
  nextButton.getEnum('State', { Default: 'default', Hover: 'hover' });
}
const nextText = readButtonText(nextButton, 'NormalButton') || 'Next';

const dismissIcon = instance.findInstance('IconWrapper');
if (dismissIcon && dismissIcon.type === 'INSTANCE') {
  dismissIcon.getEnum('Size', { '16 - normal': 'normal' });
}

const contentInstance = instance.getInstanceSwap('Content');
let contentExample = null;
if (
  contentInstance &&
  contentInstance.type === 'INSTANCE' &&
  contentInstance.visible !== false &&
  contentInstance.name !== 'Content placeholder'
) {
  const rendered = contentInstance.executeTemplate();
  const example = rendered && rendered.example;
  if (example && (!Array.isArray(example) || example.length > 0)) {
    contentExample = example;
  }
}

const titleMatch = titleText.match(/^(.*?)(\d+)(\s*:\s*)(.*)$/);
const taskNumber = titleMatch ? Number(titleMatch[2]) : 1;
const taskBody = titleMatch ? titleMatch[4] : titleText;
const taskTitleCode =
  titleMatch && taskNumber === 1
    ? `taskTitle: (taskIndex, taskTitle) => \`${titleMatch[1]}\${taskIndex + 1}${titleMatch[3]}\${taskTitle}\``
    : `taskTitle: () => "${quote(titleText)}"`;

const stepMatch = stepText.match(/^(.*?)(\d+)(\s*\/\s*)(\d+)(.*)$/);
const stepNumber = stepMatch ? Number(stepMatch[2]) : 1;
const totalSteps = Math.max(stepMatch ? Number(stepMatch[4]) : 1, 1);
let openIndex = Math.min(Math.max(stepNumber - 1, 0), totalSteps - 1);
if (!showPrevious) {
  openIndex = 0;
} else if (openIndex === 0 && totalSteps > 1) {
  openIndex = 1;
}

const counterMatches = !!stepMatch && openIndex === stepNumber - 1 && (showPrevious || stepNumber === 1);
const stepCounterCode = counterMatches
  ? `stepCounterText: (stepIndex, totalStepCount) => \`${stepMatch[1]}\${stepIndex + 1}${stepMatch[3]}\${totalStepCount}${stepMatch[5]}\``
  : `stepCounterText: () => "${quote(stepText)}"`;

const isLastStep = openIndex >= totalSteps - 1;
const mounted = {};
mounted[openIndex] = true;
if (!isLastStep) {
  mounted[openIndex + 1] = true;
}

const stepCode = index => {
  if (index >= totalSteps) {
    return '';
  }
  const withContent = index === openIndex && contentExample;
  return figma.code`{
    title: "Step ${index + 1}",
    content: ${withContent ? figma.code`(${contentExample})` : '""'},
    hotspotId: "step-${index + 1}",
  },`;
};

const hotspotCode = index => {
  if (!mounted[index]) {
    return '';
  }
  return figma.code`<Hotspot hotspotId="step-${index + 1}" direction="${direction || 'top'}" />`;
};

const s0 = stepCode(0);
const s1 = stepCode(1);
const s2 = stepCode(2);
const s3 = stepCode(3);
const s4 = stepCode(4);
const s5 = stepCode(5);
const s6 = stepCode(6);
const s7 = stepCode(7);

const h0 = hotspotCode(0);
const h1 = hotspotCode(1);
const h2 = hotspotCode(2);
const h3 = hotspotCode(3);
const h4 = hotspotCode(4);
const h5 = hotspotCode(5);
const h6 = hotspotCode(6);
const h7 = hotspotCode(7);

export default {
  example: figma.code`
    <AnnotationContext
      currentTutorial={{
        title: "${quote(taskBody || titleText)}",
        description: "",
        completed: false,
        completedScreenDescription: "",
        tasks: [
          {
            title: "${quote(taskBody || titleText)}",
            steps: [
              ${s0}
              ${s1}
              ${s2}
              ${s3}
              ${s4}
              ${s5}
              ${s6}
              ${s7}
            ],
          },
        ],
      }}
      i18nStrings={{
        nextButtonText: "${quote(nextText)}",
        previousButtonText: "${quote(previousText)}",
        finishButtonText: "${quote(isLastStep ? nextText : 'Finish')}",
        labelDismissAnnotation: "Dismiss annotation",
        labelHotspot: (openState, stepIndex, totalStepCount) => \`Annotation for step \${stepIndex + 1} of \${totalStepCount}\`,
        ${stepCounterCode},
        ${taskTitleCode},
      }}
      onStartTutorial={() => {}}
      onExitTutorial={() => {}}
    >
      ${h0}
      ${h1}
      ${h2}
      ${h3}
      ${h4}
      ${h5}
      ${h6}
      ${h7}
    </AnnotationContext>
  `,
  imports: [
    "import AnnotationContext from '@cloudscape-design/components/annotation-context'",
    "import Hotspot from '@cloudscape-design/components/hotspot'",
  ],
  id: 'annotation-context',
  metadata: {
    nestable: true,
    props: {
      direction: direction || 'top',
      title: titleText,
      step: stepText,
      previous: showPrevious ? 'true' : '',
      next: nextText,
    },
  },
};
