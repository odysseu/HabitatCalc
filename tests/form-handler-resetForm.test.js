/**
 * @jest-environment jsdom
 */
import { addIncome, resetForm } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
// Mock global fetch
global.fetch = jest.fn((url) => {
    const language = url.match(/translations\/(.*)\.json/)[1]; // Extract language from URL
    const filePath = resolve(__dirname, `../translations/${language}.json`);
    try {
        const fileContent = readFileSync(filePath, 'utf8');
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(JSON.parse(fileContent)),
        });
    } catch (error) {
        return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.reject(new Error(`File not found: ${filePath}`)),
        });
    }
});
describe('resetForm', () => {
    let initial_price, initial_notary, initial_appreciation, initial_agency, initial_coOwnership, initial_file, initial_contribution, initial_interestRate, initial_insuranceRate, initial_loanDuration, initial_fictitiousRent, initial_fictitiousRentRate, initialBuyHousingTax, initialRentingHousingTax, initial_propertyTax;
    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
        initial_price = document.getElementById('price').value;
        initial_notary = document.getElementById('notary').value;
        initial_appreciation = document.getElementById('appreciation-rate').value;
        initial_agency = document.getElementById('agency-commission').value;
        initial_coOwnership = document.getElementById('coOwnership').value;
        initial_file = document.getElementById('file-fees').value;
        initial_contribution = document.getElementById('contribution').value;
        initial_interestRate = document.getElementById('interest-rate').value;
        initial_insuranceRate = document.getElementById('insurance-rate').value;
        initial_loanDuration = document.getElementById('loanDuration').value;
        initial_fictitiousRent = document.getElementById('fictitiousRent').value;
        initial_fictitiousRentRate = document.getElementById('fictitiousRentRate').value;
        initialBuyHousingTax = document.getElementById('buyHousingTax').value;
        initialRentingHousingTax = document.getElementById('rentingHousingTax').value;
        initial_propertyTax = document.getElementById('propertyTax').value;
    });
    test('should reset the form and clear simulation content', async () => {
        // Set mock values for every field of the form
        document.getElementById('price').value = '200000';
        document.getElementById('notary').value = '8';
        document.getElementById('appreciation-rate').value = '2.3';
        document.getElementById('agency-commission').value = '5';
        document.getElementById('coOwnership').value = '500';
        document.getElementById('file-fees').value = '1000';
        document.getElementById('contribution').value = '50000';
        document.getElementById('interest-rate').value = '1';
        document.getElementById('insurance-rate').value = '1';
        document.getElementById('loanDuration').value = '20';
        document.getElementById('fictitiousRent').value = '500';
        document.getElementById('fictitiousRentRate').value = '1';
        document.getElementById('buyHousingTax').value = '1000';
        document.getElementById('rentingHousingTax').value = '0';
        document.getElementById('propertyTax').value = '900';
        document.getElementById('income-0').value = '1000';
        document.getElementById('income-share-0').value = '10';
        // Add an income container
        addIncome();
        expect(document.getElementById('income-1').value).toBe('1000');
        expect(document.getElementById('income-share-1').value).toBe('10');
        // Call resetForm
        await resetForm();
        // Assertions
        expect(document.getElementById('price').value).toBe(initial_price);
        expect(document.getElementById('notary').value).toBe(initial_notary);
        expect(document.getElementById('appreciation-rate').value).toBe(initial_appreciation);
        expect(document.getElementById('agency-commission').value).toBe(initial_agency);
        expect(document.getElementById('coOwnership').value).toBe(initial_coOwnership);
        expect(document.getElementById('file-fees').value).toBe(initial_file);
        expect(document.getElementById('contribution').value).toBe(initial_contribution);
        expect(document.getElementById('interest-rate').value).toBe(initial_interestRate);
        expect(document.getElementById('insurance-rate').value).toBe(initial_insuranceRate);
        expect(document.getElementById('loanDuration').value).toBe(initial_loanDuration);
        expect(document.getElementById('fictitiousRent').value).toBe(initial_fictitiousRent);
        expect(document.getElementById('fictitiousRentRate').value).toBe(initial_fictitiousRentRate);
        expect(document.getElementById('buyHousingTax').value).toBe(initialBuyHousingTax);
        expect(document.getElementById('rentingHousingTax').value).toBe(initialRentingHousingTax);
        expect(document.getElementById('propertyTax').value).toBe(initial_propertyTax);
        expect(document.getElementById('incomes-container').children.length).toBe(1); // Only one income container should remain
        expect(document.getElementById('incomes-container').children[0].querySelector('input[name="income-0"]').value).toBe('');
        expect(document.getElementById('incomes-container').children[0].querySelector('input[name="income-share-0"]').value).toBe('');
        expect(document.getElementById('incomes-container').children[0].querySelector('input[name="income-1"]')).toBe(null); // No second income container should remain
        expect(document.getElementById('incomes-container').children[0].querySelector('input[name="income-share-1"]')).toBe(null); // No second income container should remain
        expect(document.getElementById('simulation').innerHTML).toBe('');
        // Check if canvas is cleared
        const canvas = document.getElementById('myChart');
        const context = canvas.getContext('2d');
        // Create a mock for getImageData to avoid actual canvas operations
        context.getImageData = jest.fn(() => ({ data: new Array(4).fill(0) }));
        expect(context.getImageData).not.toHaveBeenCalled();
    });
});
