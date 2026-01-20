/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { loadTranslations, updateAPRLabel, updateContent } from '../js/handle-language';

describe('updateAPRLabel', () => {
    let aprElement;
    let languageSelect;
    let translations;
    // beforeAll(async () => {
    // });
    beforeEach(async () => {
        // Mock fetch to return a resolved promise with the translations
        global.fetch = jest.fn(() =>
            Promise.resolve({
            json: () => Promise.resolve(translations),
            })
        );
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
        // aprElement = document.getElementById('apr-overlay');
        // languageSelect = document.getElementById('language-select');
        // console.log('languageSelect : ', languageSelect.value);
        // translations = await loadTranslations(languageSelect.value);
        // console.log('translations : ', translations);
        // const translatedAPR = translations.APR;
    });

    // afterEach(() => {
        // Clean up DOM
        // const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        // document.body.innerHTML = html;
        // document.body.innerHTML = '';
        // jest.clearAllMocks();
    // });

    test('updates apr-overlay textContent with formatted APR and translation', async () => {
        const apr = 2.34567;
        const translations = {
            APR: 'HELLO',
        };
        await updateAPRLabel(apr, translations);
        expect(document.getElementById('apr-overlay').textContent).toBe('HELLO: 2.35%');
    });

    test('updates apr-overlay textContent with wrong APR and formated translation', async () => {
        const apr = "whoops";
        const translations = {
            APR: 'WAZAAA',
        };
        await updateAPRLabel(apr, translations);
        expect(document.getElementById('apr-overlay').textContent).toBe('WAZAAA: ??.??%');
    });

    // test('does not update if apr-overlay element is missing', async () => {
    //     const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    //     document.body.innerHTML = html;
    //     aprElement = document.getElementById('apr-overlay');
    //     if (aprElement && aprElement.parentNode === document.body) {
    //         document.body.removeChild(aprElement);
    //     }
    //     const apr = 1.23;
    //     const languageSelect = document.getElementById('language-select');
    //     const translations = loadTranslations(languageSelect.value);
    //     const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    //     await updateAPRLabel(apr, translations);
    //     console.log('document.getElementById(apr-overlay) : ', document.getElementById('apr-overlay'));
    //     // expect(consoleWarnSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
    //     expect(aprElement.textContent).toBe('TAEG: 1.23%');
    //     consoleWarnSpy.mockRestore();
    // });

    test('Updates to dummy value if translations is undefined', async () => {
        const apr = 1.2495;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const translations = undefined;
        await updateAPRLabel(apr, translations);
        // expect(consoleErrorSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
        // console.log('translations : ', translations);
        const currentAprElement = document.getElementById('apr-overlay');
        expect(currentAprElement.textContent).toBe('APR_IDIOT_TRANSLATION: 1.25%');
        consoleErrorSpy.mockRestore();
    });

    test('does not update if translations.reportAPR is missing', async () => {
        const apr = 1.286;
        const translations = { DUMMY: 'dummy' }; // reportAPR missing
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await updateAPRLabel(apr, translations);
        // expect(consoleErrorSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
        expect(document.getElementById('apr-overlay').textContent).toBe('APR_IDIOT_LABEL: 1.29%');
        consoleErrorSpy.mockRestore();
    });


    test('warns and dummy translations when document.getElementById("apr-overlay") is missing', async () => {
        const apr = 1.299;
        // const translations = { DUMMY: 'dummy' }; // reportAPR missing
        document.getElementById("apr-overlay").remove();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        await updateAPRLabel(apr, translations);
        // expect(consoleErrorSpy).toHaveBeenCalledWith('APR element not found or translations are not available.');
        expect(document.getElementById('apr-overlay')).toBe(null);
        consoleErrorSpy.mockRestore();
    });
});

describe('updateContent with null or invalid translations', () => {
    beforeEach(() => {
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle null translations gracefully', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        await updateContent(null);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Translations are not available or invalid.');
        consoleWarnSpy.mockRestore();
    });

    it('should handle undefined translations gracefully', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        await updateContent(undefined);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Translations are not available or invalid.');
        consoleWarnSpy.mockRestore();
    });

    it('should handle empty object translations', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Empty object is still truthy, so it should NOT warn
        await updateContent({});
        
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
    });

    it('should update all translatable elements when translations are provided', async () => {
        const translations = {
            contribution: 'Contribution Test',
            generateReport: 'Generate Report',
            closeButton: 'Close',
            agencyCommission: 'Agency Commission',
            coOwnership: 'Co-ownership',
            helpIncomeShare: 'Income Share Help',
            loanDuration: 'Loan Duration',
            fileFees: 'File Fees',
            resetFormHelp: 'Reset Form',
            helpMonthlyIncome: 'Monthly Income Help',
            fictitiousRent: 'Fictitious Rent',
            notary: 'Notary',
            pdfFileName: 'PDF File Name',
            pdfFileNamePlaceHolder: 'Enter filename',
            price: 'Price',
            purchaseSection: 'Purchase',
            loanSection: 'Loan',
            incomesSection: 'Incomes',
            rentingSection: 'Renting',
            sectionTitle: 'Calculator',
            summaryPart1: 'Summary Part 1',
            summaryPart2: 'Summary Part 2',
            appreciationRate: 'Appreciation Rate',
            insuranceRate: 'Insurance Rate',
            interestRate: 'Interest Rate',
            fictitiousRentRate: 'Fictitious Rent Rate',
            propertyTax: 'Property Tax',
            buyHousingTax: 'Buy Housing Tax',
            rentingHousingTax: 'Renting Housing Tax',
            downloadPDF: 'Download PDF',
            title: 'Habitat Calculator',
            welcomeMessage: 'Welcome!'
        };

        await updateContent(translations);
        
        // Verify that key elements are updated
        const titleElement = document.getElementById('title-section');
        expect(titleElement).toBeTruthy();
    });

    it('should handle translations with missing optional keys', async () => {
        const translations = {
            // Minimal translations
            title: 'Test Title'
        };

        // Should not throw even with incomplete translations
        expect(() => updateContent(translations)).not.toThrow();
    });

    it('should handle false value as invalid translations', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        await updateContent(false);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Translations are not available or invalid.');
        consoleWarnSpy.mockRestore();
    });

    it('should handle zero as invalid translations', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        await updateContent(0);
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Translations are not available or invalid.');
        consoleWarnSpy.mockRestore();
    });

    it('should handle empty string as invalid translations', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        await updateContent('');
        
        expect(consoleWarnSpy).toHaveBeenCalledWith('Translations are not available or invalid.');
        consoleWarnSpy.mockRestore();
    });
});