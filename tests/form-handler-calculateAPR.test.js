// This is a Jest test file for the addIncome function in form-handler.js
const { addIncome, calculateAPR } = require('../form-handler');
const fs = require('fs');
const path = require('path');

/**
 * @jest-environment jsdom
 */

describe('addIncome', () => {
  let container, incomeInput, durationInput;
  beforeAll(() => {
    // Load the index.html file
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });
  // beforeEach(() => {
  //   // Set up the DOM structure
  //   document.body.innerHTML = `
  //           <div id="incomes-container">
  //               <div class="income-container">
  //                   <input type="number" name="income-0" value="2000" />
  //                   <input type="number" name="income-share-0" value="50" />
  //               </div>
  //           </div>
  //       `;
  //   container = document.getElementById('incomes-container');
  //   incomeInput = container.querySelector('input[name="income-0"]');
  //   durationInput = container.querySelector('input[name="income-share-0"]');
  // });


  it('should calculate default APR', () => {

    const apr = calculateAPR();

    expect(apr).toBeGreaterThan(0);
    expect(apr).toBeCloseTo(0.5, 0.01); // Adjust expected value based on your calculation logic
  });
  it('calculateAPR calculates the APR correctly', () => {
    document.getElementById('insuranceRate').value = '1';
    document.getElementById('interest-rate').value = '2';
    document.getElementById('file-fees').value = '1000';
    document.getElementById('price').value = '200000';
    document.getElementById('notary').value = '8';
    document.getElementById('agency-commission').value = '5';
    document.getElementById('contribution').value = '50000';
    document.getElementById('loanDuration').value = '20';

    const apr = calculateAPR();

    expect(apr).toBeGreaterThan(0);
    expect(apr).toBeCloseTo(1.12, 2); // Adjust expected value based on your calculation logic
  });

});