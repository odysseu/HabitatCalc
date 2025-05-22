// This is a Jest test file for the addIncome function in form-handler.js
import { calculateMonthlyPayment } from '../form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * @jest-environment jsdom
 */

describe('calculateAPR', () => {
  let container, incomeInput, durationInput;
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
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
  it('should calculate monthly payment correctly', () => {
    const monthlyPayment = calculateMonthlyPayment(200000, 20, 0.01, 0.002);
    expect(monthlyPayment).toBeGreaterThan(0);
    expect(monthlyPayment).toBeCloseTo(921, 0); // Adjust expected value based on your calculation logic
  });

});