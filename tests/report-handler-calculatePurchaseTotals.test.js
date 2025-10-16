// Test file for calculatePurchaseTotals function
import { calculatePurchaseTotals } from '../js/report-handler.js';

describe('calculatePurchaseTotals', () => {
  test('calculates correct purchase totals', () => {
    const price = 300000;
    const notary = 0.02;
    const agencyCommission = 0.03;
    const fileFees = 1000;
    const contribution = 60000;

    const result = calculatePurchaseTotals(price, notary, agencyCommission, fileFees, contribution);

    expect(result.notaryFees).toBe(6000);
    expect(result.agencyCommissionFees).toBe(9000);
    expect(result.purchaseTotal).toBe(300000 + 6000 + 9000 + 1000);
    expect(result.borrowedAmount).toBe(300000 + 6000 + 9000 + 1000 - 60000);
  });

  test('handles zero values correctly', () => {
    const result = calculatePurchaseTotals(0, 0, 0, 0, 0);

    expect(result.notaryFees).toBe(0);
    expect(result.agencyCommissionFees).toBe(0);
    expect(result.purchaseTotal).toBe(0);
    expect(result.borrowedAmount).toBe(0);
  });
});
