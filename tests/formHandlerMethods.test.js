// Description: Tests for form-handler.js
const { extractIncomes, calculateMonthlyPayment, trouverAnneePertesInferieures } = require('../form-handler');
const fs = require('fs');
const path = require('path');

/**
 * @jest-environment jsdom
 */

describe('form-handler.js methods', () => {
  global.TextEncoder = require("util").TextEncoder;
  global.TextDecoder = require("util").TextDecoder;

  let container, incomeInput, durationInput;
  beforeAll(() => {
      // Load the index.html file
      const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
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
        container = document.getElementById('incomes-container');
        incomeInput = container.querySelector('input[name="income-0"]');
        durationInput = container.querySelector('input[name="income-share-0"]');
  });


  test('extractIncomes calculates cumulative incomes correctly', () => {
    const container = document.getElementById('incomes-container');
    const incomeInput = document.createElement('input');
    incomeInput.name = 'income-0';
    incomeInput.value = '2000';
    container.appendChild(incomeInput);

    const incomeShareInput = document.createElement('input');
    incomeShareInput.name = 'income-share-0';
    incomeShareInput.value = '50';
    container.appendChild(incomeShareInput);

    const totalIncome = extractIncomes();

    expect(totalIncome).toBeCloseTo(2000 * 0.5 * 12, 2);
  });

  test('calculateMonthlyPayment calculates monthly payment correctly', () => {
    const monthlyPayment = calculateMonthlyPayment(200000, 20, 0.01, 0.002);
    expect(monthlyPayment).toBeGreaterThan(0);
    expect(monthlyPayment).toBeCloseTo(920, 0); // Adjust expected value based on your calculation logic
  });

  test('trouverAnneePertesInferieures finds the correct year of loss crossover', () => {
    const year = trouverAnneePertesInferieures(
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

    expect(year).toBe(2); // Adjust expected value based on your calculation logic
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
