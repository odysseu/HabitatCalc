/**
 * @jest-environment jsdom
 */
import { generateChart } from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('generateChart', () => {
  let myChart;
  let mockCtx;
  let mockCanvas;
  let mockParent;
  let ChartMock;

  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;

    // Mock Chart globally as a Jest function
    ChartMock = jest.fn().mockImplementation((ctx, config) => ({
      ctx,
      config,
      destroy: jest.fn(),
    }));
    global.Chart = ChartMock;

    // Mock Hammer globally
    global.Hammer = {
      Manager: jest.fn().mockImplementation(() => ({
        element: null,
        handlers: {},
        add: jest.fn(),
        on: jest.fn(),
      })),
      Pinch: jest.fn(),
    };

    // Create a parent div and append the canvas to it
    mockParent = document.createElement('div');
    mockParent.style.width = '800px';
    mockParent.style.height = '600px';
    mockCanvas = document.createElement('canvas');
    mockParent.appendChild(mockCanvas);
    document.body.appendChild(mockParent);

    // Mock getElementById to return the mockCanvas
    document.getElementById = jest.fn((id) => {
      if (id === 'myChart') return mockCanvas;
      if (id === 'language-select') {
        const select = document.createElement('select');
        select.value = 'fr';
        return select;
      }
      return null;
    });

    mockCtx = {
      canvas: mockCanvas,
    };
    mockCanvas.getContext = jest.fn(() => mockCtx);

    // Mock getComputedStyle
    global.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: (prop) => {
        const colors = {
          '--graph-rent-color': '#ff0000',
          '--graph-rent-fill-color': 'rgba(255, 0, 0, 0.1)',
          '--graph-purchase-color': '#0000ff',
          '--graph-purchase-fill-color': 'rgba(0, 0, 255, 0.1)',
          '--graph-text-color': '#000000',
        };
        return colors[prop];
      },
    });
  });

  beforeEach(() => {
    // Reset myChart as a mock object with a destroy method
    myChart = {
      destroy: jest.fn(),
    };
    global.myChart = myChart;
    ChartMock.mockClear();
    global.Hammer.Manager.mockClear();
    jest.spyOn(require('../js/handle-language.js'), 'loadTranslations').mockResolvedValue({
      year: 'Année',
      reportRentalCumulativeExpenses: 'Cumul des dépenses locatives',
      reportCumulPurchaseLosses: 'Cumul des pertes d\'achat',
      graphTitle: 'Comparaison Location vs Achat',
      currencyFormat: 'fr-FR',
    });
  });

  test('generates a chart with correct configuration', async () => {
    const cumulRent = Array(20).fill(12000);
    const cumulativePurchase = Array(20).fill(15000);
    const maxDuration = 20;

    await generateChart(cumulRent, cumulativePurchase, maxDuration);

    // Check if Chart was called with the correct configuration
    expect(ChartMock).toHaveBeenCalledTimes(1);
    const chartConfig = ChartMock.mock.calls[0][1];

    // Check datasets
    expect(chartConfig.data.datasets.length).toBe(2);
    expect(chartConfig.data.datasets[0].label).toBe('Cumul des dépenses locatives');
    expect(chartConfig.data.datasets[1].label).toBe('Cumul des pertes d\'achat');

    // Check scales
    expect(chartConfig.options.scales.y.min).toBeLessThan(Math.min(...cumulRent, ...cumulativePurchase));
    expect(chartConfig.options.scales.y.max).toBeGreaterThan(Math.max(...cumulRent, ...cumulativePurchase));

    // Check plugins
    expect(chartConfig.options.plugins.zoom.zoom.wheel.enabled).toBe(true);
    expect(chartConfig.options.plugins.zoom.zoom.drag.enabled).toBe(true);
    expect(chartConfig.options.plugins.zoom.zoom.mode).toBe('xy');
    expect(chartConfig.options.plugins.zoom.pan.enabled).toBe(true);
    expect(chartConfig.options.plugins.zoom.pan.mode).toBe('xy');

    // Check Hammer.js initialization
    expect(global.Hammer.Manager).toHaveBeenCalledWith(mockCanvas);
  });

  // test('destroys previous chart if it exists', async () => {
  //   const cumulRent = Array(20).fill(12000);
  //   const cumulativePurchase = Array(20).fill(15000);
  //   const maxDuration = 20;

  //   await generateChart(cumulRent, cumulativePurchase, maxDuration);

  //   expect(myChart.destroy).toHaveBeenCalled();
  // });
});
