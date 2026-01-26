/**
 * @jest-environment jsdom
 */
import { calculatePurchaseLosses } from '../js/form-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Financial Calculations', () => {
  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  describe('calculatePurchaseLosses', () => {
    test('calculates cumulative purchase losses over time', () => {
      const cumulativePurchase = calculatePurchaseLosses(
        300000, 24000, 9000, 60000, 1160.46, 1000, 500, 0.02, 20, 20, 4000, 1500, 1000, 0
      );
      expect(cumulativePurchase.length).toBe(20);
      expect(cumulativePurchase[0]).toBeGreaterThanOrEqual(0);
    });
  });
});
