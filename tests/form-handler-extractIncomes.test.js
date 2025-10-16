/**
 * @jest-environment jsdom
 */

// This is a Jest test file for the addIncome function in form-handler.js
import { addIncome, extractIncomes } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('extractIncomes', () => {
  let container, incomeInput, durationInput, totalIncome;
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  beforeEach(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  it('extractIncomes calculates cumulative incomes correctly', () => {
    container = document.getElementById('incomes-container');
    incomeInput = container.querySelector('input[name="income-0"]');
    durationInput = container.querySelector('input[name="income-share-0"]');

    addIncome(document);

    totalIncome = extractIncomes(document);

    expect(totalIncome).toBe(0, 0);

    incomeInput.value = '2000';
    durationInput.value = '50';

    addIncome(document);
    totalIncome = extractIncomes(document);
    expect(totalIncome).toBe(2000 * (50 / 100) * 12, 0);

  });


  describe('extractIncomes', () => {
    test('extracts and sums incomes from the form', () => {
      const incomesContainer = document.getElementById('incomes-container');
      incomesContainer.innerHTML = `
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-0" value="3000" />
            <input type="number" name="income-share-0" value="100" />
          </div>
        </div>
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-1" value="2000" />
            <input type="number" name="income-share-1" value="50" />
          </div>
        </div>
      `;
      const totalIncomes = extractIncomes();
      expect(totalIncomes).toBe(48000);
    });
  });


  test('extracts and sums incomes from the form', () => {
    const incomesContainer = document.getElementById('incomes-container');
    incomesContainer.innerHTML = `
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-0" value="3000" />
            <input type="number" name="income-share-0" value="0" />
          </div>
        </div>
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-1" value="2000" />
            <input type="number" name="income-share-1" value="50" />
          </div>
        </div>
      `;
    const totalIncomes = extractIncomes();
    expect(totalIncomes).toBe(12000);
  });

  test('extracts and sums incomes from the form', () => {
    const incomesContainer = document.getElementById('incomes-container');
    incomesContainer.innerHTML = `
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-0" value="0" />
            <input type="number" name="income-share-0" value="100" />
          </div>
        </div>
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-1" value="2000" />
            <input type="number" name="income-share-1" value="50" />
          </div>
        </div>
      `;
    const totalIncomes = extractIncomes();
    expect(totalIncomes).toBe(12000);
  });

  test('extracts and sums incomes from the form', () => {
    const incomesContainer = document.getElementById('incomes-container');
    incomesContainer.innerHTML = `
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-0" value="3000" />
            <input type="number" name="income-share-0" value="100" />
          </div>
        </div>
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-1" value="2000" />
            <input type="number" name="income-share-1" value="0" />
          </div>
        </div>
      `;
    const totalIncomes = extractIncomes();
    expect(totalIncomes).toBe(36000);
  });

  test('extracts and sums incomes from the form', () => {
    const incomesContainer = document.getElementById('incomes-container');
    incomesContainer.innerHTML = `
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-0" value="3000" />
            <input type="number" name="income-share-0" value="100" />
          </div>
        </div>
        <div class="income-container">
          <div class="income-inputs">
            <input type="number" name="income-1" value="0" />
            <input type="number" name="income-share-1" value="50" />
          </div>
        </div>
      `;
    const totalIncomes = extractIncomes();
    expect(totalIncomes).toBe(36000);
  });

});
