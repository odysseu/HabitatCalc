/**
 * @jest-environment jsdom
 */
import { addIncome } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('addIncome', () => {
  let container, incomeInput, durationInput;
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });
  beforeEach(() => {
    container = document.getElementById('incomes-container');
    let incomeInput = container.querySelector('input[name="income-0"]');
    let durationInput = container.querySelector('input[name="income-share-0"]');
    // Initialize with one income container
    incomeInput.value = '2000';
    durationInput.value = '50';
    container.innerHTML = `
          <div class="income-container">
              <input type="number" name="income-0" value="${incomeInput.value}" />
              <input type="number" name="income-share-0" value="${durationInput.value}" />
          </div>
      `;
  });
  it('should add a new income container when valid inputs are provided', () => {
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(2);
    const newIncomeInput = incomeContainers[1].querySelector(`input[name="income-1"]`);
    const newDurationInput = incomeContainers[1].querySelector(`input[name="income-share-1"]`);
    expect(newIncomeInput.value).toBe('2000');
    expect(newDurationInput.value).toBe('50');
  });
  it('should reset the initial input fields after adding a new income', () => {
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(2);
    const newIncome = incomeContainers[0];
    const newIncomeInput = newIncome.querySelector(`input[name="income-0"]`);
    const newDurationInput = newIncome.querySelector(`input[name="income-share-0"]`);
    expect(newIncomeInput.value).toBe('');
    expect(newDurationInput.value).toBe('');
  });
  it('should not add a new income container if inputs are invalid', () => {
    document.getElementById('incomes-container').querySelector('input[name="income-0"]').value  = '';
    document.getElementById('incomes-container').querySelector('input[name="income-share-0"]').value  = '';
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(1); // No new container added
  });
  it('should not add a new income container if income is negative', () => {
    document.getElementById('incomes-container').querySelector('input[name="income-0"]').value = '-1000';
    document.getElementById('incomes-container').querySelector('input[name="income-share-0"]').value = '50';
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(1); // No new container added
  });
  it('should not add a new income container if duration is negative', () => {
    document.getElementById('incomes-container').querySelector('input[name="income-0"]').value = '2000';
    document.getElementById('incomes-container').querySelector('input[name="income-share-0"]').value = '-50';
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(1); // No new container added
  });
  it('should not add a new income container if duration is greater than 100', () => {
    document.getElementById('incomes-container').querySelector('input[name="income-0"]').value = '2000';
    document.getElementById('incomes-container').querySelector('input[name="income-share-0"]').value = '150';
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(1); // No new container added
  });
});
