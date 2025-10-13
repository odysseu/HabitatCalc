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
});