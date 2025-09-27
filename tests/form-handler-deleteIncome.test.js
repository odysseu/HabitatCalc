/**
 * @jest-environment jsdom
 */
import { addIncome, deleteIncome } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('deleteIncome', () => {
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
              <button type="button" class="change-income-button">-</button>
          </div>
      `;
  });
  it('should delete an income container when delete(button) is called', () => {
    // Add another income container to test deletion
    addIncome();
    const incomeContainers = container.querySelectorAll('.income-container');
    expect(incomeContainers.length).toBe(2);
    // Get the delete button from the second container
    const deleteButton = container.querySelectorAll('.income-container')[1].querySelector('button');
    // Call deleteIncome with the button
    deleteIncome(deleteButton);
    // document.getElementById('incomes-container').querySelectorAll('.income-container')[0].querySelector('button').parentElement.remove()
    const afterContainers = container.querySelectorAll('.income-container');
    expect(afterContainers.length).toBe(1); // Expect one container after deletion
  });
});
