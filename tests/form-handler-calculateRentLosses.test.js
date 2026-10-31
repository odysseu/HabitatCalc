/**
 * @jest-environment jsdom
 */
import { calculateRentLosses } from '../js/form-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Financial Calculations', () => {
  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  describe('calculateRentLosses', () => {
    test('calculates cumulative rent losses over time without property tax evolution', () => {
      const cumulRent = calculateRentLosses(1000, 20, 0.01, 300, 0);
      expect(cumulRent.length).toBe(20);
      // CORRECTED: Using geometric series formula
      // cumulRent = 12 * 1000 * (1.01^1 - 1) / 0.01 = 12000 * 0.01 / 0.01 = 12000
      // cumulTax = 300 * 1 = 300
      // Total = 12300
      expect(cumulRent[0]).toBe(12300);
    });

    test('calculates cumulative rent losses with property tax evolution', () => {
      const cumulRent = calculateRentLosses(1000, 5, 0.01, 100, 0.01);
      expect(cumulRent.length).toBe(5);
      // CORRECTED: Using geometric series formula for both rent and tax
      // cumulRent = 12 * 1000 * (1.01^1 - 1) / 0.01 = 12000
      // cumulRentingTax = 100 * (1.01^1 - 1) / 0.01 = 100
      // Total = 12100
      expect(cumulRent[0]).toBe(12100);
    });
  });
});