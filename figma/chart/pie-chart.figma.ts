// url=<PIE_CHART>
// source=src/pie-chart/index.tsx
// component=PieChart
import figma from 'figma';

const instance = figma.selectedInstance;

const variant = instance.getEnum('Type', {
  Pie: 'pie',
  Donut: 'donut',
});

const showLegend = instance.getBoolean('Show legend');
const showFilter = instance.getBoolean('Show chart filter');

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const firstText = node => {
  if (!node || node.type !== 'INSTANCE') {
    return '';
  }
  const layers = node.findLayers(layer => layer.type === 'TEXT');
  const layer = layers[0];
  return layer && layer.type === 'TEXT' ? layer.textContent : '';
};

const filterLabelLayer = instance.findText('Label');
const filterLabel = filterLabelLayer.type === 'TEXT' ? filterLabelLayer.textContent : '';

const select = instance.findInstance('Input settings');
const filterPlaceholder = select && select.type === 'INSTANCE' ? firstText(select) : '';

const texts = instance.findLayers(node => node.type === 'TEXT').filter(node => node.visible !== false);

const isItem = text => /^Item\s/.test(text.name) || /^Item\s/.test(text.textContent);

const items = [];
for (let index = 0; index < texts.length && items.length < 5; index++) {
  const text = texts[index];
  if (!isItem(text)) {
    continue;
  }
  const next = texts[index + 1];
  const description = next && !isItem(next) ? next.textContent : '';
  items.push({ title: text.textContent, description });
}

const data = items.map(item => {
  const match = String(item.description).match(/-?\d+(?:\.\d+)?/);
  const value = match ? Number(match[0]) : 0;
  const description = item.description ? `, description: "${quote(item.description)}"` : '';
  return `{ title: "${quote(item.title)}", value: ${value}${description} }`;
});

const hasDescription = items.some(item => item.description);

const metricValueLayer = instance.findText('100');
const metricDescriptionLayer = instance.findText('total units');
const innerMetricValue = metricValueLayer.type === 'TEXT' ? metricValueLayer.textContent : '';
const innerMetricDescription = metricDescriptionLayer.type === 'TEXT' ? metricDescriptionLayer.textContent : '';

export default {
  example: figma.code`
    <PieChart
      variant="${variant}"
      data={[
        ${data.join(',\n        ')}
      ]}
      ${hasDescription ? 'segmentDescription={item => item.description}' : ''}
      ${variant === 'donut' && innerMetricValue ? figma.code`innerMetricValue="${quote(innerMetricValue)}"` : ''}
      ${variant === 'donut' && innerMetricDescription ? figma.code`innerMetricDescription="${quote(innerMetricDescription)}"` : ''}
      ${showFilter ? '' : 'hideFilter'}
      ${showLegend ? '' : 'hideLegend'}
      ${
        showFilter
          ? figma.code`i18nStrings={{
        filterLabel: "${quote(filterLabel)}",
        filterPlaceholder: "${quote(filterPlaceholder)}",
      }}`
          : ''
      }
    />
  `,
  imports: ["import PieChart from '@cloudscape-design/components/pie-chart'"],
  id: 'pie-chart',
  metadata: {
    nestable: true,
    props: {
      variant,
    },
  },
};
