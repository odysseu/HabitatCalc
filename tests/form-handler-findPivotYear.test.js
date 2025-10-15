/**
 * @jest-environment jsdom
 */
import { findPivotYear } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('findPivotYear', () => {
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  describe('findPivotYear', () => {
    test('finds the year where purchasing becomes cheaper than renting', () => {
      const pivotYear = findPivotYear(
        300000, // price
        24000, // notaryFees
        9000, // agencyCommissionFees
        0, // contribution
        1160.46, // monthlyPayment
        1000, // propertyTax
        500, // buyHousingTax
        300, // rentingHousingTax
        0.02, // appreciationRate
        30, // maxDuration
        20, // loanDuration
        1000, // fictitiousRent
        0.01, // fictitiousRentRate
        4000, // cumulIncomes
        1500, // coOwnershipFees
        1000 // fileFees
      );
      expect(pivotYear).toBeGreaterThan(0);
      expect(pivotYear).toBe(9);
    });
  });
});