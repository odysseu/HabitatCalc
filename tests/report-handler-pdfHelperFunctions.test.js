/**
 * @jest-environment jsdom
 */
import {
  addPurchaseTable,
  addLoanTable,
  addRentingTable,
  addRepaymentYear,
  addMonthlyBreakdownTable,
  addYearlyTotalsTable,
  addChartToPDF,
  addPDFHeader,
} from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('PDF Helper Functions', () => {
  let mockDoc;
beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;

    // // Mock Chart globally
    // global.Chart = class {
    //   constructor(ctx, config) {
    //     this.ctx = ctx;
    //     this.config = config;
    //   }
    //   destroy() {}
    // };

    // // Mock Hammer globally
    // global.Hammer = {
    //   Manager: class {
    //     constructor(element) {
    //       this.element = element;
    //       this.handlers = {};
    //     }
    //     add(input) {
    //       // Mock add method
    //     }
    //     on(event, handler) {
    //       if (!this.handlers[event]) {
    //         this.handlers[event] = [];
    //       }
    //       this.handlers[event].push(handler);
    //     }
    //   },
    //   Pinch: class {}
    // };
  });
  beforeEach(() => {
    mockDoc = {
      setFontSize: jest.fn(),
      setTextColor: jest.fn(),
      text: jest.fn(),
      autoTable: jest.fn(),
      addImage: jest.fn(),
      addPage: jest.fn(),
      internal: {
        pageSize: {
          getWidth: jest.fn().mockReturnValue(200),
          getHeight: jest.fn().mockReturnValue(300),
        },
      },
      lastAutoTable: { finalY: 50 },
    };
  });

  test('addPurchaseTable adds a purchase table to the PDF', () => {
    addPurchaseTable(
      mockDoc,
      {
        reportPurchase: 'Purchase',
        reportPrice: 'Price',
        reportNotaryFees: 'Notary Fees',
        reportAppreciationRate: 'Appreciation Rate',
        reportAgencyCommission: 'Agency Commission',
        reportPurchaseTotal: 'Purchase Total',
        reportCoOwnership: 'Co-Ownership Fees',
        reportBuyHousingTax: 'Buy Housing Tax',
        reportfileFees: 'File Fees',
      },
      20,
      10,
      300000,
      24000,
      0.02,
      9000,
      334000,
      1500,
      500,
      1000
    );
    expect(mockDoc.autoTable).toHaveBeenCalled();
  });

  test('addLoanTable adds a loan table to the PDF', () => {
    addLoanTable(
      mockDoc,
      {
        reportLoan: 'Loan',
        contribution: 'Contribution',
        reportBorrowedAmount: 'Borrowed Amount',
        reportInterestRate: 'Interest Rate',
        reportInsuranceRate: 'Insurance Rate',
        reportAPR: 'APR',
        reportMonthlyPayment: 'Monthly Payment',
        reportTotalInterests: 'Total Interests',
        reportLoanTotalCost: 'Loan Total Cost',
      },
      20,
      10,
      60000,
      274000,
      0.035,
      0.003,
      0.038,
      1160.46,
      1160.46 * 240 - 274000,
      1160.46 * 240
    );
    expect(mockDoc.autoTable).toHaveBeenCalled();
  });

  test('addRentingTable adds a renting table to the PDF', () => {
    addRentingTable(
      mockDoc,
      {
        reportRenting: 'Renting',
        reportFictitiousMonthlyRent: 'Fictitious Monthly Rent',
        reportFictitiousRentEvolutionRate: 'Fictitious Rent Evolution Rate',
        reportRentingHousingTax: 'Renting Housing Tax',
        reportPropertyTax: 'Property Tax',
        reportMonthlyAgregatedIncome: 'Monthly Aggregated Income',
      },
      20,
      10,
      1000,
      0.01,
      300,
      1000,
      4000 / 12
    );
    expect(mockDoc.autoTable).toHaveBeenCalled();
  });

  test('addRepaymentYear adds the repayment year to the PDF', () => {
    addRepaymentYear(mockDoc, { reportRepaymentYear: 'Repayment Year' }, 20, 10, 10);
    expect(mockDoc.text).toHaveBeenCalled();
  });

  test('addMonthlyBreakdownTable adds a monthly breakdown table to the PDF', () => {
    jest.spyOn(require('../js/form-handler.js'), 'calculateMonthlyPayment').mockReturnValue(1160.46);
    addMonthlyBreakdownTable(mockDoc, {}, 20, 10, 274000, 0.035, 0.003, 20);
    expect(mockDoc.autoTable).toHaveBeenCalled();
  });

  test('addYearlyTotalsTable adds a yearly totals table to the PDF', () => {
    jest.spyOn(require('../js/form-handler.js'), 'calculateMonthlyPayment').mockReturnValue(1160.46);
    addYearlyTotalsTable(mockDoc, {}, 20, 10, 274000, 0.035, 0.003, 20);
    expect(mockDoc.autoTable).toHaveBeenCalled();
  });

  test('addChartToPDF adds a chart image to the PDF', () => {
    // const canvas = document.createElement('canvas');
    const canvas = document.getElementById('myChart');
    canvas.width = 800;
    canvas.height = 600;
    // Mock the toDataURL method
    canvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
    document.getElementById('myChart').replaceWith(canvas);
    addChartToPDF(mockDoc, 20, 160, 10);
    expect(mockDoc.addImage).toHaveBeenCalled();
  });

  test('addPDFHeader adds a header to the PDF', () => {
    addPDFHeader(mockDoc, { reportTitle: 'Report Title' }, 20);
    expect(mockDoc.text).toHaveBeenCalled();
  });
});
