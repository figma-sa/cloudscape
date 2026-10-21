// url=<LINE_CHART>
// source=src/line-chart/index.tsx
// component=LineChart
import figma from 'figma';

const instance = figma.selectedInstance;

const showFilter = instance.getBoolean('Show chart filter');
const showLegend = instance.getBoolean('Show legend');
const showAverage = instance.getBoolean('Show average line');

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

const filterLabelLayer = instance.findText('Label');
const filterLabel = filterLabelLayer.type === 'TEXT' ? filterLabelLayer.textContent : '';

const select = instance.findInstance('Input settings');
const filterPlaceholder = select && select.type === 'INSTANCE' ? firstText(select) : '';

const yLabel = instance.findInstance('y-axis label');
const yTitle = yLabel && yLabel.type === 'INSTANCE' ? firstText(yLabel) : '';

const xLabel = instance.findInstance('Elements / Charts (instance name)');
const xTitle = xLabel && xLabel.type === 'INSTANCE' ? firstText(xLabel) : '';

const points = instance
  .findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements / Axis point')
  .filter(point => point.visible !== false)
  .slice(0, 9);

const categories = points.map(firstText).filter(category => category);
const numericX = categories.length > 0 && categories.every(category => /^-?\d+(\.\d+)?$/.test(category));

const yAxis = instance.findInstance('Elements / Y-Axis (Chart)');
let yDomain = null;
if (yAxis && yAxis.type === 'INSTANCE') {
  const ticks = yAxis
    .findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements / Y-Axis-Item')
    .filter(tick => tick.visible !== false)
    .map(firstText);
  const values = ticks.map(Number);
  if (ticks.length >= 2 && values.every(value => !Number.isNaN(value))) {
    yDomain = [Math.min(...values), Math.max(...values)];
  }
}

const legendsRoot = instance.findInstance('Elements / Legends');
const legends =
  legendsRoot && legendsRoot.type === 'INSTANCE'
    ? legendsRoot
        .findLayers(node => node.type === 'INSTANCE' && node.name === 'Elements / Single legend')
        .map(legend => ({
          kind: legend.getEnum('Type', {
            'Line legend': 'line',
            Threshold: 'threshold',
          }),
          title: firstText(legend),
          visible: legend.visible !== false,
        }))
    : [];

const visibleLines = legends.filter(legend => legend.kind === 'line' && legend.visible);
const lineLegends = (visibleLines.length ? visibleLines : legends.filter(legend => legend.kind === 'line')).slice(0, 6);
const thresholdLegend = legends.find(legend => legend.kind === 'threshold');

const lineTitles = lineLegends.length
  ? lineLegends.map((legend, index) => legend.title || `Series ${index + 1}`)
  : ['Series 1', 'Series 2'];

// Line positions are drawn vectors, not labeled values. These numbers only keep each series distinct.
const sampleY = (seriesIndex, categoryIndex) => (seriesIndex + 1) * (categoryIndex + 1);

const xValue = category => (numericX ? category : `"${quote(category)}"`);

const lineSeries = lineTitles.map((title, seriesIndex) => {
  const data = categories
    .map((category, categoryIndex) => `{ x: ${xValue(category)}, y: ${sampleY(seriesIndex, categoryIndex)} }`)
    .join(', ');
  return `{ title: "${quote(title)}", type: "line", data: [${data}] }`;
});

let thresholdY = 1;
if (categories.length) {
  const total = categories.reduce((sum, _, categoryIndex) => sum + sampleY(0, categoryIndex), 0);
  thresholdY = Math.round(total / categories.length);
}

const thresholdTitle = thresholdLegend && thresholdLegend.title ? thresholdLegend.title : 'Average';
const series = showAverage
  ? [...lineSeries, `{ title: "${quote(thresholdTitle)}", type: "threshold", y: ${thresholdY} }`]
  : lineSeries;

export default {
  example: figma.code`
    <LineChart
      series={[
        ${series.join(',\n        ')}
      ]}
      ${numericX ? '' : 'xScaleType="categorical"'}
      ${yTitle ? figma.code`yTitle="${quote(yTitle)}"` : ''}
      ${xTitle ? figma.code`xTitle="${quote(xTitle)}"` : ''}
      ${yDomain ? figma.code`yDomain={[${yDomain[0]}, ${yDomain[1]}]}` : ''}
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
  imports: ["import LineChart from '@cloudscape-design/components/line-chart'"],
  id: 'line-chart',
  metadata: {
    nestable: true,
    props: {
      xScaleType: numericX ? 'linear' : 'categorical',
    },
  },
};
