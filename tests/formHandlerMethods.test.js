// Description: Tests for form-handler.js

import { calculatePurchaseLosses, calculateRentLosses, findPivotYear } from '../form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * @jest-environment jsdom
 */

describe('form-handler.js methods', () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;

  // let container, incomeInput, durationInput;
  beforeAll(() => {
      // Load the index.html file
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
      document.body.innerHTML = html;
  });
  beforeEach(() => {
      // Set up the DOM structure
      // document.body.innerHTML = `
      //     <div id="incomes-container">
      //         <div class="income-container">
      //             <input type="number" name="income-0" value="2000" />
      //             <input type="number" name="income-share-0" value="50" />
      //         </div>
      //     </div>
      // `;
      // container = document.getElementById('incomes-container');
      // incomeInput = container.querySelector('input[name="income-0"]');
      // durationInput = container.querySelector('input[name="income-share-0"]');
  });




  test('findPivotYear finds the correct year of loss crossover', () => {
    const year = findPivotYear(
      200000, // price
      16000,  // notaryFees
      0,      // agencyCommissionFees
      5000,   // contribution
      1000,   // monthlyPayment
      1000,   // propertyTax
      0.02,   // appreciationRate
      30,     // maxDuration
      20,     // loanDuration
      1200,   // fictitiousRent
      0.01,   // fictitiousRentRate
      0,      // cumulIncomes
      0,      // coOwnershipFees
      0       // fileFees
    );

    expect(year).toBe(1); // Adjust expected value based on your calculation logic
  });

  test('calculatePurchaseLosses calculates purchase losses correctly', () => {
    const losses = calculatePurchaseLosses(
      200000, // price
      16000,  // notaryFees
      0,      // agencyCommissionFees
      5000,   // contribution
      1000,   // monthlyPayment
      1000,   // propertyTax
      0.02,   // appreciationRate
      30,     // maxDuration
      20,     // loanDuration
      0,      // cumulIncomes
      0,      // coOwnershipFees
      0       // fileFees
    );

    expect(losses.length).toBe(30);
    expect(losses[0]).toBeGreaterThan(0);
  });

  test('calculateRentLosses calculates rent losses correctly', () => {
    const losses = calculateRentLosses(1500, 30, 0.03);
    expect(losses.length).toBe(30);
    expect(losses[0]).toBeGreaterThan(0);
  });

});
