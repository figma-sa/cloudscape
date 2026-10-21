// url=<TEXTAREA>
// source=src/textarea/index.tsx
// component=Textarea
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const connectedInput = instance.findConnectedInstance('input');
const input =
  connectedInput && connectedInput.type === 'INSTANCE' ? connectedInput : instance.findInstance('Input (Atom)');

let content = 'placeholder';
let state = 'default';
let text = '';

if (input && input.type === 'INSTANCE') {
  input.getBoolean('Show number control');
  input.getBoolean('Search');
  content = input.getEnum('Content', {
    Placeholder: 'placeholder',
    Value: 'value',
  });
  state = input.getEnum('State', {
    Default: 'default',
    'Read only': 'read-only',
    Disabled: 'disabled',
    Error: 'error',
    Warning: 'warning',
    Focus: 'focus',
  });
  const textLayer = input.findText('✏️ Input text');
  text = textLayer.type === 'TEXT' ? textLayer.textContent : '';
}

const resize = instance.findInstance('IconWrapper');
if (resize && resize.type === 'INSTANCE') {
  resize.getEnum('Size', { '16 - normal': 'normal' });
}

const value = content === 'value' ? text : '';
const placeholder = content === 'placeholder' ? text : '';

export default {
  example: figma.code`
    <Textarea
      value="${quote(value)}"
      ${placeholder ? figma.code`placeholder="${quote(placeholder)}"` : ''}
      ${state === 'read-only' ? 'readOnly' : ''}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'error' ? 'invalid' : ''}
      ${state === 'warning' ? 'warning' : ''}
    />
  `,
  imports: ["import Textarea from '@cloudscape-design/components/textarea'"],
  id: 'textarea',
  metadata: {
    nestable: true,
    props: {
      value,
      placeholder,
      state,
    },
  },
};
