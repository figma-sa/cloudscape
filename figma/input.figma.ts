// url=<INPUT>
// source=src/input/index.tsx
// component=Input
import figma from 'figma';

const instance = figma.selectedInstance;

const showNumber = instance.getBoolean('Show number control');
const search = instance.getBoolean('Search');

const content = instance.getEnum('Content', {
  Placeholder: 'placeholder',
  Value: 'value',
});

// Focus is a visual state with the same snippet as Default.
const state = instance.getEnum('State', {
  Default: 'default',
  'Read only': 'read-only',
  Disabled: 'disabled',
  Error: 'error',
  Warning: 'warning',
  Focus: 'focus',
});

const textLayer = instance.findText('✏️ Input text');
const text = textLayer.type === 'TEXT' ? textLayer.textContent : '';
const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

// A number input cannot also be a search input. The spinner takes precedence.
const type = showNumber ? 'number' : search ? 'search' : 'text';

export default {
  example: figma.code`
    <Input
      ${type !== 'text' ? figma.code`type="${type}"` : ''}
      ${content === 'placeholder' ? figma.code`placeholder="${quote(text)}"` : figma.code`value="${quote(text)}"`}
      ${state === 'read-only' ? 'readOnly' : ''}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'error' ? 'invalid' : ''}
      ${state === 'warning' ? 'warning' : ''}
    />
  `,
  imports: ["import Input from '@cloudscape-design/components/input'"],
  id: 'input',
  metadata: {
    nestable: true,
    props: {
      type,
      content,
      state,
      text,
    },
  },
};
