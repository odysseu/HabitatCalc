/**
 * @jest-environment jsdom
 */
import { calculateBorrowedAmount } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('calculateBorrowedAmount', () => {
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  describe('calculatePurchaseTotals', () => {
    test('calculates notary fees, agency fees, and borrowed amount', () => {
      const price = 300000;
      const notary = 0.08;
      const agencyCommission = 0.03;
      const fileFees = 1000;
      const contribution = 60000;
      const { borrowedAmount, notaryFees, commissionFees } = calculateBorrowedAmount(
        price,
        notary,
        agencyCommission,
        fileFees,
        contribution
      );
      expect(notaryFees).toBe(24000);
      expect(commissionFees).toBe(9000);
      const purchaseTotal = price + notaryFees + commissionFees + fileFees;
      expect(purchaseTotal).toBe(300000 + 24000 + 9000 + 1000);
      expect(borrowedAmount).toBe(purchaseTotal - contribution);
    });
  });
});
