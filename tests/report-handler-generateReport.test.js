/**
 * @jest-environment jsdom
 */
import { generateReport } from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('generateReport', () => {
  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;

    // Mock Chart globally
    global.Chart = class {
      constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
      }
      destroy() {}
    };

    // Mock Hammer globally
    global.Hammer = {
      Manager: class {
        constructor(element) {
          this.element = element;
          this.handlers = {};
        }
        add(input) {
          // Mock add method
        }
        on(event, handler) {
          if (!this.handlers[event]) {
            this.handlers[event] = [];
          }
          this.handlers[event].push(handler);
        }
      },
      Pinch: class {}
    };
  });

  test('generates a report with purchase, loan, and renting sections', async () => {
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
      reportPurchase: 'Purchase',
      reportPrice: 'Price',
      reportNotaryFees: 'Notary Fees',
      reportAppreciationRate: 'Appreciation Rate',
      reportAgencyCommission: 'Agency Commission',
      reportPurchaseTotal: 'Purchase Total',
      reportCoOwnership: 'Co-Ownership Fees',
      reportBuyHousingTax: 'Buy Housing Tax',
      reportLoan: 'Loan',
      contribution: 'Contribution',
      reportBorrowedAmount: 'Borrowed Amount',
      reportInsuranceRate: 'Insurance Rate',
      reportInterestRate: 'Interest Rate',
      reportAPR: 'APR',
      reportMonthlyPayment: 'Monthly Payment',
      reportTotalInterests: 'Total Interests',
      reportLoanTotalCost: 'Loan Total Cost',
      reportRenting: 'Renting',
      reportFictitiousMonthlyRent: 'Fictitious Monthly Rent',
      reportFictitiousRentEvolutionRate: 'Fictitious Rent Evolution Rate',
      reportRentingHousingTax: 'Renting Housing Tax',
      reportPropertyTax: 'Property Tax',
      reportMonthlyAgregatedIncome: 'Monthly Aggregated Income',
      year: 'Year',
      graphTitle: 'Graph Title',
      currencyFormat: 'fr-FR',
    });

    jest.spyOn(require('../js/report-handler.js'), 'generateChart').mockResolvedValue();
    jest.spyOn(require('../js/report-handler.js'), 'setupPDFDownloadSection').mockImplementation();
    jest.spyOn(require('../js/form-handler.js'), 'calculateMonthlyPayment').mockReturnValue(1160.46);
    jest.spyOn(require('../js/form-handler.js'), 'extractIncomes').mockReturnValue(48000);
    jest.spyOn(require('../js/form-handler.js'), 'calculateAPR').mockReturnValue(0.038);
    jest.spyOn(require('../js/form-handler.js'), 'findPivotYear').mockReturnValue(10);
    jest.spyOn(require('../js/form-handler.js'), 'calculateRentLosses').mockReturnValue(Array(20).fill(12000));
    jest.spyOn(require('../js/form-handler.js'), 'calculatePurchaseLosses').mockReturnValue(Array(20).fill(15000));
    jest.spyOn(require('../js/report-handler.js'), 'calculatePurchaseTotals').mockReturnValue({
      borrowedAmount: 265000,
      notaryFees: 24000,
      agencyCommissionFees: 0,
      purchaseTotal: 334000,
    });

    await generateReport();

    const simulationContainer = document.getElementById('simulation');
    expect(simulationContainer.querySelectorAll('.results-section').length).toBeGreaterThan(0);
  });
});
