// url=<TOGGLE_BUTTON>
// source=src/toggle-button/index.tsx
// component=ToggleButton
import figma from 'figma';

const instance = figma.selectedInstance;

const type = instance.getEnum('Type', {
  'Text + icon': 'text',
  'Icon only': 'icon',
});

const state = instance.getEnum('State', {
  Default: 'default',
  Disabled: 'disabled',
  Pressed: 'pressed',
  Loading: 'loading',
});

const textProperty = instance.getString('Text');
const textLayer = instance.findText('ToggleButton');
const text = textProperty || (textLayer.type === 'TEXT' ? textLayer.textContent : '');

const aliases = {
  ellipses: 'ellipsis',
  'caret-filled-up': 'caret-up-filled',
  'caret-filled-down': 'caret-down-filled',
  'caret-filled-right': 'caret-right-filled',
  'in progress': 'in-progress',
  add: 'add-plus',
};

const icon = instance.findInstance('Icon');
let iconName = '';
if (icon && icon.type === 'INSTANCE' && state !== 'loading') {
  const rendered = icon.executeTemplate();
  const props = rendered && rendered.metadata && rendered.metadata.props;
  const raw = (props && props.name) || (icon.name && icon.name !== 'Icon' ? icon.name : '');
  iconName = aliases[raw] || raw;
  if (iconName === 'spinner') {
    iconName = '';
  }
}

const iconOnly = type === 'icon';

export default {
  example: figma.code`
    <ToggleButton
      variant="${iconOnly ? 'icon' : 'normal'}"
      pressed={${state === 'pressed' ? 'true' : 'false'}}
      ${iconName ? figma.code`iconName="${iconName}"` : ''}
      ${state === 'disabled' ? 'disabled' : ''}
      ${state === 'loading' ? 'loading' : ''}
    >
      ${iconOnly ? '' : text}
    </ToggleButton>
  `,
  imports: ["import ToggleButton from '@cloudscape-design/components/toggle-button'"],
  id: 'toggle-button',
  metadata: {
    nestable: true,
    props: {
      type,
      state,
      text: iconOnly ? '' : text,
      iconName,
    },
  },
};
