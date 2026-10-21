// url=<CHART_POPOVER>
// source=src/mixed-line-bar-chart/index.tsx
// component=MixedLineBarChart
import figma from 'figma';

const instance = figma.selectedInstance;

const quote = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

const firstText = node => {
  if (!node || (node.type !== 'INSTANCE' && node.type !== 'TEXT')) {
    return '';
  }
  if (node.type === 'TEXT') {
    return node.textContent;
  }
  const layers = node.findLayers(layer => layer.type === 'TEXT');
  const layer = layers[0];
  return layer && layer.type === 'TEXT' ? layer.textContent : '';
};

const popover = instance.findInstance('Popover (Atom)');
let header = '';
if (popover && popover.type === 'INSTANCE') {
  popover.getEnum('Header', { On: 'on' });
  popover.getEnum('Arrow', { Bottom: 'bottom' });
  popover.getBoolean('Dismiss');
  const headerLayer = popover.findText('Header');
  header = headerLayer.type === 'TEXT' ? headerLayer.textContent : '';
}

const content = popover && popover.type === 'INSTANCE' ? popover.getInstanceSwap('Content') : null;
const items =
  content && content.type === 'INSTANCE'
    ? content
        .findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements / Legend item')
        .filter(item => item.visible !== false)
        .slice(0, 6)
    : [];

const rows = items.map((item, index) => {
  const legend = item.findInstance('Elements / Single legend');
  const kind =
    legend && legend.type === 'INSTANCE'
      ? legend.getEnum('Type', {
          'Square legend': 'bar',
          'Line legend': 'line',
          Threshold: 'threshold',
        })
      : 'bar';
  const external = item.findInstance('external');
  const valueNode = item.findInstance('Text content');
  return {
    title: legend && legend.type === 'INSTANCE' ? firstText(legend) : `Series ${index + 1}`,
    value: valueNode && valueNode.type === 'INSTANCE' ? firstText(valueNode) : '',
    kind: kind || 'bar',
    link: !!(external && external.type === 'INSTANCE' && external.visible !== false),
  };
});

const xValue = /^-?\d+(\.\d+)?$/.test(header) ? header : `"${quote(header)}"`;

const series = rows.map((row, index) => {
  if (row.kind === 'threshold') {
    return `{ title: "${quote(row.title)}", type: "threshold", y: ${index + 1} }`;
  }
  return `{ title: "${quote(row.title)}", type: "${row.kind}", data: [{ x: ${xValue}, y: ${index + 1} }] }`;
});

const lookup = rows
  .map(row => `{ title: "${quote(row.title)}", value: "${quote(row.value)}", link: ${row.link} }`)
  .join(', ');

const hasLink = rows.some(row => row.link);

export default {
  example: figma.code`
    <MixedLineBarChart
      series={[
        ${series.join(',\n        ')}
      ]}
      ${/^-?\d+(\.\d+)?$/.test(header) ? '' : 'xScaleType="categorical"'}
      detailPopoverSize="small"
      detailPopoverSeriesContent={({ series }) => {
        const row = [${lookup}].find(row => row.title === series.title)
        return {
          key: ${hasLink ? 'row && row.link ? <Link external href="#">{series.title}</Link> : series.title' : 'series.title'},
          value: row ? row.value : "",
        }
      }}
    />
  `,
  imports: hasLink
    ? [
        "import MixedLineBarChart from '@cloudscape-design/components/mixed-line-bar-chart'",
        "import Link from '@cloudscape-design/components/link'",
      ]
    : ["import MixedLineBarChart from '@cloudscape-design/components/mixed-line-bar-chart'"],
  id: 'chart-popover',
  metadata: {
    nestable: true,
    props: {
      header,
    },
  },
};
