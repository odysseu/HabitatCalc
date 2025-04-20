// This is a Jest test file for the addIncome function in form-handler.js
const { addIncome } = require('../form-handler');
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
    beforeEach(() => {
        // Set up the DOM structure
        document.body.innerHTML = `
            <div id="incomes-container">
                <div class="income-container">
                    <input type="number" name="income-0" value="2000" />
                    <input type="number" name="income-share-0" value="50" />
                </div>
            </div>
        `;
        container = document.getElementById('incomes-container');
        incomeInput = container.querySelector('input[name="income-0"]');
        durationInput = container.querySelector('input[name="income-share-0"]');
    });

    it('should add a new income container when valid inputs are provided', () => {
        addIncome(document);

        const incomeContainers = container.querySelectorAll('.income-container');
        expect(incomeContainers.length).toBe(2);

        const newIncome = incomeContainers[1];
        const newIncomeInput = newIncome.querySelector(`input[name="income-1"]`);
        const newDurationInput = newIncome.querySelector(`input[name="income-share-1"]`);

        expect(newIncomeInput.value).toBe('2000');
        expect(newDurationInput.value).toBe('50');
    });

    it('should reset the initial input fields after adding a new income', () => {
        addIncome(document);

        expect(incomeInput.value).toBe('');
        expect(durationInput.value).toBe('');
    });

    it('should not add a new income container if inputs are invalid', () => {
        incomeInput.value = '';
        durationInput.value = '';

        addIncome(document);

        const incomeContainers = container.querySelectorAll('.income-container');
        expect(incomeContainers.length).toBe(1); // No new container added
    });

    it('should log an error if inputs are invalid', () => {
        console.log = jest.fn();

        incomeInput.value = 'invalid';
        durationInput.value = 'invalid';

        addIncome(document);

        expect(console.log).toHaveBeenCalledWith('Invalid input detected:', {
            income: '',
            duration: '',
        });
    });
});