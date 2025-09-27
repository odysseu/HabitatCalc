/**
 * @jest-environment jsdom
 */
import { addIncome, deleteIncome } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('deleteIncome', () => {
  let container;
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
  it('should delete an income container when the delete button is clicked', () => {
    addIncome();
    const initialContainers = container.querySelectorAll('.income-container');
    expect(initialContainers.length).toBe(2);
    const deleteButton = container.querySelectorAll('.income-container')[1].querySelector('button');
    // simulate click action
    deleteButton.click();
    const afterContainers = container.querySelectorAll('.income-container');
    expect(afterContainers.length).toBe(2);
  });
  it('should delete an income container when delete(button) is called', () => {
    let initialContainers = container.querySelectorAll('.income-container');
    expect(initialContainers.length).toBe(2);
    const deleteButton = container.querySelectorAll('.income-container')[1].querySelector('button');
    deleteIncome(deleteButton);
    const afterContainers = container.querySelectorAll('.income-container');
    expect(afterContainers.length).toBe(2);
  });
});
