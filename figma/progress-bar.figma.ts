// url=<ATOM_PROGRESS_BAR>
// source=src/progress-bar/index.tsx
// component=ProgressBar
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const status = instance.getEnum('State', {
  'In progress': 'in-progress',
  Success: 'success',
  Error: 'error',
});

const showLabel = instance.getBoolean('Label');
const showAdditional = instance.getBoolean('Additional');

const labelLayer = instance.findText('Progress bar label');
const label = showLabel && labelLayer.type === 'TEXT' && labelLayer.visible !== false ? labelLayer.textContent : '';

const additionalLayer = instance.findText('Additional info');
const additional =
  showAdditional && additionalLayer.type === 'TEXT' && additionalLayer.visible !== false
    ? additionalLayer.textContent
    : '';

let value = '0';
const connectedBar = instance.findConnectedInstance('progress-bar');
const bar =
  connectedBar && connectedBar.type === 'INSTANCE' ? connectedBar : instance.findInstance('Elements/Progress bar only');
if (bar && bar.type === 'INSTANCE' && bar.visible !== false) {
  const rendered = bar.executeTemplate();
  const fromProps = rendered && rendered.metadata && rendered.metadata.props && rendered.metadata.props.value;
  if (fromProps) {
    value = fromProps;
  } else {
    const percentage = bar.getEnum('Percentage', {
      '0': '0',
      '10': '10',
      '20': '20',
      '30': '30',
      '40': '40',
      '50': '50',
      '60': '60',
      '70': '70',
      '80': '80',
      '90': '90',
    });
    const textLayer = bar.findText('✏️ %');
    const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';
    const match = String(text).match(/-?\d+(?:\.\d+)?/);
    value = match ? match[0] : percentage;
  }
}

let resultText = '';
const statusIndicator = instance.findInstance('Status indicator (Atom)');
if (
  status !== 'in-progress' &&
  statusIndicator &&
  statusIndicator.type === 'INSTANCE' &&
  statusIndicator.visible !== false
) {
  statusIndicator.getEnum('Type', {
    error: 'error',
    success: 'success',
  });
  const textLayer = statusIndicator.findText('Text');
  resultText = textLayer.type === 'TEXT' ? textLayer.textContent : '';
}

let resultButtonText = '';
const button = instance.findInstance('Normal button (Atom)');
if (button && button.type === 'INSTANCE' && button.visible !== false) {
  button.getEnum('Type', { 'Text only': 'text' });
  button.getEnum('Open', { False: false });
  button.getEnum('State', { Default: 'default', Hover: 'hover' });
  resultButtonText = button.getString('Text') || '';
  if (!resultButtonText) {
    const textLayer = button.findText('NormalButton');
    resultButtonText = textLayer.type === 'TEXT' ? textLayer.textContent : '';
  }
}

export default {
  example: figma.code`
    <ProgressBar
      status="${status}"
      ${status === 'in-progress' ? figma.code`value={${value}}` : ''}
      ${label ? figma.code`label="${quote(label)}"` : ''}
      ${additional ? figma.code`additionalInfo="${quote(additional)}"` : ''}
      ${resultText ? figma.code`resultText="${quote(resultText)}"` : ''}
      ${resultButtonText ? figma.code`resultButtonText="${quote(resultButtonText)}"` : ''}
    />
  `,
  imports: ["import ProgressBar from '@cloudscape-design/components/progress-bar'"],
  id: 'progress-bar-atom',
  metadata: {
    nestable: true,
    props: {
      status,
      value,
      label,
    },
  },
};
