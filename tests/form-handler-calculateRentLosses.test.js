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
    test('calculates cumulative rent losses over time', () => {
      const cumulRent = calculateRentLosses(1000, 20, 0.01, 300);
      expect(cumulRent.length).toBe(20);
      expect(cumulRent[0]).toBe(12420);
    });
  });
});