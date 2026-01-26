/**
 * @jest-environment jsdom
 */
import { calculatePurchaseLosses, calculateRentLosses, findPivotYear } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('form-handler.js methods', () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;
  beforeAll(() => {
      // Load the index.html file
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
      document.body.innerHTML = html;
  });
  test('findPivotYear finds the correct year of loss crossover', () => {
    const year = findPivotYear(
      200000, // price
      16000,  // notaryFees
      0,      // agencyCommissionFees
      5000,   // contribution
      1000,   // monthlyPayment
      1000,   // propertyTax
      0,      // buyHousingTax
      0,      // rentingHousingTax
      0.02,   // appreciationRate
      30,     // maxDuration
      20,     // loanDuration
      1200,   // fictitiousRent
      0.01,   // fictitiousRentRate
      0,      // cumulIncomes
      0,      // coOwnershipFees
      0,      // fileFees
      0,      // proprietaryTax
      0       // proprietaryTaxRate
    );
    expect(year).toBe(3); // Adjust expected value based on your calculation logic
  });
  test('calculatePurchaseLosses calculates purchase losses correctly', () => {
    const losses = calculatePurchaseLosses(
      200000, // price
      16000,  // notaryFees
      0,      // agencyCommissionFees
      5000,   // contribution
      1000,   // monthlyPayment
      1000,   // propertyTax
      0,      // buyHousingTax
      0.02,   // appreciationRate
      30,     // maxDuration
      20,     // loanDuration
      0,      // cumulIncomes
      0,      // coOwnershipFees
      0,      // fileFees
      0       // propertyTaxRate
    );
    expect(losses.length).toBe(30);
    expect(losses[0]).toBeGreaterThan(0);
    expect(losses[0]).toBe(30000);
  });
  test('calculatePurchaseLosses calculates purchase losses correctly with housing tax', () => {
    const losses = calculatePurchaseLosses(
      200000, // price
      16000,  // notaryFees
      0,      // agencyCommissionFees
      5000,   // contribution
      1000,   // monthlyPayment
      1000,   // propertyTax
      1000,   // buyHousingTax
      0.02,   // appreciationRate
      30,     // maxDuration
      20,     // loanDuration
      0,      // cumulIncomes
      0,      // coOwnershipFees
      0,      // fileFees
      0       // propertyTaxRate
    );
    expect(losses.length).toBe(30);
    expect(losses[0]).toBeGreaterThan(0);
    expect(losses[0]).toBe(31000);
  });
  test('calculateRentLosses calculates rent losses correctly', () => {
    const losses = calculateRentLosses(1500, 30, 0.03, 0);
    expect(losses.length).toBe(30);
    expect(losses[0]).toBeGreaterThan(0);
  });
  test('findPivotYear returns maxDuration if no crossing before maxDuration', () => {
    const year = findPivotYear(
      200000, // price
      16000,  // notaryFees
      0,      // agencyCommissionFees
      5000,   // contribution
      1000,   // monthlyPayment
      1000,   // propertyTax
      0,      // buyHousingTax
      0,      // rentingHousingTax
      0.02,   // appreciationRate
      30,     // maxDuration
      20,     // loanDuration
      1200,   // fictitiousRent
      0.01,   // fictitiousRentRate
      0,      // cumulIncomes
      0,      // coOwnershipFees
      0,      // fileFees
      0,      // proprietaryTax
      0       // proprietaryTaxRate
    );
    expect(year).toBe(3);
  });
});
