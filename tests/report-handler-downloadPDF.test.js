/**
 * @jest-environment jsdom
 */
import { downloadPDF } from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('downloadPDF', () => {
  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  test('generates and downloads a PDF report', async () => {
    // Mock jsPDF
    global.jspdf = {
      jsPDF: jest.fn().mockImplementation(() => ({
        setProperties: jest.fn(),
        setFontSize: jest.fn(),
        setTextColor: jest.fn(),
        text: jest.fn(),
        autoTable: jest.fn(),
        addImage: jest.fn(),
        save: jest.fn(),
        internal: {
          pageSize: {
            getWidth: jest.fn().mockReturnValue(200),
            getHeight: jest.fn().mockReturnValue(300),
          },
        },
      })),
    };

    // Mock dependencies
    jest.spyOn(require('../js/report-handler.js'), 'getReportFormValues').mockReturnValue({
      price: 300000,
      notary: 0.08,
      appreciationRate: 0.02,
      agencyCommission: 0,
      contribution: 60000,
      interestRate: 0.035,
      loanDuration: 20,
      insuranceRate: 0.003,
      fictitiousRent: 1000,
      buyHousingTax: 500,
      rentingHousingTax: 300,
      propertyTax: 1000,
      fictitiousRentRate: 0.01,
      coOwnershipFees: 1500,
      fileFees: 1000,
      maxDuration: 30,
    });
    jest.spyOn(require('../js/handle-language.js'), 'loadTranslations').mockResolvedValue({
      reportTitle: 'Report Title',
    });
    jest.spyOn(require('../js/dark-mode.js'), 'forceLightMode').mockReturnValue(false);
    jest.spyOn(require('../js/dark-mode.js'), 'restoreMode').mockImplementation();
    jest.spyOn(require('../js/report-handler.js'), 'calculatePurchaseTotals').mockReturnValue({
      borrowedAmount: 265000,
      notaryFees: 24000,
      agencyCommissionFees: 0,
      purchaseTotal: 334000,
    });
    jest.spyOn(require('../js/form-handler.js'), 'calculateMonthlyPayment').mockReturnValue(1160.46);
    jest.spyOn(require('../js/form-handler.js'), 'extractIncomes').mockReturnValue(48000);
    jest.spyOn(require('../js/form-handler.js'), 'calculateAPR').mockReturnValue(0.038);
    jest.spyOn(require('../js/form-handler.js'), 'findPivotYear').mockReturnValue(10);

    // Mock canvas.toDataURL
    jest.spyOn(require('../js/report-handler.js'), 'generateChart').mockImplementation(() => ({ destroy: jest.fn(), toDataURL: () => 'data:image/png;base64,test' }));
    jest.spyOn(require('../js/report-handler.js'), 'addChartToPDF').mockImplementation(() => Promise.resolve());
    jest.spyOn(require('../js/report-handler.js'), 'generateReport').mockImplementation(() => Promise.resolve());
    //.mockImplementation(() => Promise.resolve());
    // Create a mock canvas element

    // const canvas = document.createElement('canvas');
    // canvas.width = 800;
    // canvas.height = 600;
    // canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
    // document.getElementById('myChart').replaceWith(canvas);

    await downloadPDF();

    expect(global.jspdf.jsPDF).toHaveBeenCalled();
  });
});
