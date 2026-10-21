// url=<ALERT_FLASH_BUTTON>
// source=src/button/index.tsx
// component=Button
import figma from 'figma';

const instance = figma.selectedInstance;

const button = instance.findInstance('Normal button (Atom)');
let label = '';
let example = '';

if (button && button.type === 'INSTANCE' && button.visible !== false) {
  button.getEnum('Type', { 'Text only': 'text' });
  button.getEnum('Open', { False: false });
  // Hover is a visual state with the same snippet as Default.
  button.getEnum('State', { Default: 'default', Hover: 'hover' });

  const fromProperty = button.getString('Text');
  if (fromProperty) {
    label = fromProperty;
  } else {
    const text = button.findText('NormalButton');
    label = text && text.type === 'TEXT' ? text.textContent || '' : '';
  }

  const rendered = button.executeTemplate();
  const renderedExample = rendered && rendered.example;
  if (renderedExample && (!Array.isArray(renderedExample) || renderedExample.length > 0)) {
    example = renderedExample;
  }
}

export default {
  example: example || figma.code`<Button variant="normal">${label}</Button>`,
  imports: example ? [] : ["import Button from '@cloudscape-design/components/button'"],
  id: 'alert-flash-button',
  metadata: {
    nestable: true,
    props: {
      label,
    },
  },
};
