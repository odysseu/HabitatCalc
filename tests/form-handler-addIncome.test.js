// This is a Jest test file for the addIncome function in form-handler.js
import { addIncome } from '../form-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';


describe('addIncome', () => {
  let doc, container, incomeInput, durationInput;
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });
  beforeEach(() => {
    doc = document;
    container = document.getElementById('incomes-container');
    incomeInput = container.querySelector('input[name="income-0"]');
    durationInput = container.querySelector('input[name="income-share-0"]');

    // Reset the DOM structure before each test
    container.innerHTML = `
          <div id="incomes-container">
              <div class="income-container">
                  <input type="number" name="income-0" value="2000" />
                  <input type="number" name="income-share-0" value="50" />
              </div>
          </div>
      `;
  });

  it('should add a new income container when valid inputs are provided', () => {
    addIncome(doc);

    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(2);

    const newIncome = incomeContainers[1];
    const newIncomeInput = newIncome.querySelector(`input[name="income-1"]`);
    const newDurationInput = newIncome.querySelector(`input[name="income-share-1"]`);

    expect(newIncomeInput.value).toBe('2000');
    expect(newDurationInput.value).toBe('50');
  });

  it('should reset the initial input fields after adding a new income', () => {
    addIncome(doc);

    expect(incomeInput.value).toBe('');
    expect(durationInput.value).toBe('');
  });

  it('should not add a new income container if inputs are invalid', () => {
    incomeInput.value = '';
    durationInput.value = '';

    addIncome(doc);

    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(2); // No new container added
  });

  // it('should log an error if inputs are invalid', () => {
  //   console.error = jest.fn();

  //   incomeInput.value = 'invalid';
  //   durationInput.value = 'invalid';

  //   addIncome(doc);

  //   expect(console.error).toHaveBeenCalledWith('Invalid input detected:', {
  //     income: 'invalid',
  //     duration: 'invalid',
  //   });
  // });

});