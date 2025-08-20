/**
 * @jest-environment jsdom
 */

// This is a Jest test file for the calculateAPR function in form-handler.js
import { calculateAPR } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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


  it('should calculate default APR', () => {

    const apr = calculateAPR();

    expect(apr).toBeGreaterThan(0);
    expect(apr).toBeCloseTo(1.0, 0.01);
  });
  it('calculateAPR calculates the APR correctly', () => {
    document.getElementById('insurance-rate').value = '1';
    document.getElementById('interest-rate').value = '2';
    document.getElementById('file-fees').value = '1000';
    document.getElementById('price').value = '200000';
    document.getElementById('notary').value = '8';
    document.getElementById('agency-commission').value = '5';
    document.getElementById('contribution').value = '50000';
    document.getElementById('loanDuration').value = '20';

    const apr = calculateAPR();

    expect(apr).toBeGreaterThan(0);
    expect(apr).toBeCloseTo(3.68, 2);
  });

});