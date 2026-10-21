// url=<VALUE>
// source=src/key-value-pairs/index.tsx
// component=KeyValuePairs
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  Default: 'default',
  'Copy to clipboard': 'copy',
  'External link': 'external',
  Link: 'link',
  Status: 'status',
  Dashboard: 'dashboard',
  Popover: 'popover',
  'Progress bar': 'progress',
});

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const textOf = (node, name) => {
  if (!node || (node.type !== 'INSTANCE' && node.type !== 'TEXT')) {
    return '';
  }
  const layer = node.type === 'TEXT' ? node : node.findText(name);
  return layer && layer.type === 'TEXT' ? layer.textContent : '';
};

const valueLayer = instance.findText('✏️ Value');
const valueText = valueLayer.type === 'TEXT' ? valueLayer.textContent : '';

let linkText = '';
let linkExternal = type === 'external';
if (type === 'external' || type === 'link') {
  const link = instance.findInstance(type === 'external' ? 'External link' : 'Link');
  if (link && link.type === 'INSTANCE') {
    link.getEnum('Type', { secondary: 'secondary' });
    linkExternal = type === 'external' || link.getBoolean('External link');
    linkText = textOf(link, '✏️ Link text');
  }
}

let statusType = 'success';
let statusText = '';
if (type === 'status') {
  const status = instance.findInstance('Status indicator (Atom)');
  if (status && status.type === 'INSTANCE') {
    statusType = status.getEnum('Type', { success: 'success' }) || 'success';
    statusText = textOf(status, 'Text');
  }
}

let progressValue = 0;
let progressStatus = 'in-progress';
let progressLabel = '';
let progressAdditional = '';
if (type === 'progress') {
  const progress = instance.findInstance('Progress Bar (Atom)');
  if (progress && progress.type === 'INSTANCE') {
    progressStatus = progress.getEnum('State', { 'In progress': 'in-progress' }) || 'in-progress';
    if (progress.getBoolean('Label')) {
      progressLabel = textOf(progress, 'Progress bar label');
    }
    if (progress.getBoolean('Additional')) {
      progressAdditional = textOf(progress, 'Additional info');
    }
    const bar = progress.findInstance('Elements/Progress bar only');
    if (bar && bar.type === 'INSTANCE') {
      const fromEnum = bar.getEnum('Percentage', { '0': 0, '30': 30 });
      const match = textOf(bar, '✏️ %').match(/-?\d+(?:\.\d+)?/);
      progressValue = match ? Number(match[0]) : fromEnum || 0;
    }
  }
}

let example = figma.code`<>${valueText}</>`;
let imports = [];

if (type === 'copy') {
  example = figma.code`
    <CopyToClipboard
      variant="inline"
      textToCopy="${quote(valueText)}"
      copyButtonAriaLabel="Copy"
      copySuccessText="Copied"
      copyErrorText="Failed to copy"
    />
  `;
  imports = ["import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard'"];
} else if (type === 'external' || type === 'link') {
  example = figma.code`<Link ${linkExternal ? 'external' : ''} href="#">${linkText}</Link>`;
  imports = ["import Link from '@cloudscape-design/components/link'"];
} else if (type === 'status') {
  example = figma.code`<StatusIndicator type="${statusType}">${statusText}</StatusIndicator>`;
  imports = ["import StatusIndicator from '@cloudscape-design/components/status-indicator'"];
} else if (type === 'dashboard') {
  example = figma.code`<Box fontSize="display-l">${valueText}</Box>`;
  imports = ["import Box from '@cloudscape-design/components/box'"];
} else if (type === 'popover') {
  example = figma.code`<Button variant="inline-link">${valueText}</Button>`;
  imports = ["import Button from '@cloudscape-design/components/button'"];
} else if (type === 'progress') {
  example = figma.code`
    <ProgressBar
      variant="key-value"
      status="${progressStatus}"
      value={${progressValue}}
      ${progressLabel ? figma.code`label="${quote(progressLabel)}"` : ''}
      ${progressAdditional ? figma.code`additionalInfo="${quote(progressAdditional)}"` : ''}
    />
  `;
  imports = ["import ProgressBar from '@cloudscape-design/components/progress-bar'"];
}

export default {
  example,
  imports,
  id: 'value',
  metadata: {
    nestable: true,
    props: {
      type,
      text: valueText || linkText || statusText || progressLabel,
    },
  },
};
