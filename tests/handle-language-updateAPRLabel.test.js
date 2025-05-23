import { readFileSync } from 'fs';
import { resolve } from 'path';
import { loadTranslations, updateAPRLabel } from '../handle-language.js';

describe('updateAPRLabel', () => {
    let aprElement;
    let languageSelect;
    let translations;

    beforeEach(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
        // Set up DOM element for APR overlay
        aprElement = document.getElementById('apr-overlay');
        // aprElement.id = 'apr-overlay';
        // document.body.appendChild(aprElement);
        languageSelect = document.getElementById('language-select');
        translations = loadTranslations(languageSelect.value);
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('updates apr-overlay textContent with formatted APR and translation', async () => {
        const apr = 2.34567;
        const translations = { APR: 'TAEG', reportAPR: 'TAEG' };
        await updateAPRLabel(apr, translations);
        expect(aprElement.textContent).toBe('TAEG: 2.35%');
    });

    test('does not update if apr-overlay element is missing', async () => {
        if (aprElement && aprElement.parentNode === document.body) {
            document.body.removeChild(aprElement);
        }
        const apr = 1.23;
        const languageSelect = document.getElementById('language-select');
        const translations = loadTranslations(languageSelect.value);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await updateAPRLabel(apr, translations);
        expect(consoleErrorSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
        consoleErrorSpy.mockRestore();
    });

    test('does not update if translations is undefined', async () => {
        const apr = 1.23;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await updateAPRLabel(apr, undefined);
        expect(consoleErrorSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
        expect(aprElement.textContent).toBe('TAEG: 0.00%');
        consoleErrorSpy.mockRestore();
    });

    test('does not update if translations.reportAPR is missing', async () => {
        const apr = 1.23;
        const translations = { APR: 'APR' }; // reportAPR missing
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await updateAPRLabel(apr, translations);
        expect(consoleErrorSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
        expect(aprElement.textContent).toBe('TAEG: 0.00%');
        consoleErrorSpy.mockRestore();
    });
});