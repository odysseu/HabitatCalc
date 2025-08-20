<<<<<<< HEAD
import { readFileSync } from 'fs';
import { resolve } from 'path';

=======
>>>>>>> structure
/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Test that all id-ed elements exist in the DOM', () => {

    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });
    const ids = [
        'welcome-message',
        'close-welcome',
        'home-logo',
        'github-logo',
        'language-select',
        'title',
        'title-section',
        'form-calculator',
        'purchase-section',
        'price',
        'notary',
        'appreciation-rate',
        'agency-commission',
        'coOwnership',
        'loan-section',
        'incomes-section',
        'file-fees',
        'contribution',
        'interest-rate',
        'apr-overlay',
        'insurance-rate',
        'loanDuration',
        'financing-section',
        'fictitiousRent',
        'fictitiousRentRate',
        'HousingTax',
        'propertyTax',
        'incomes-container',
        'income-0',
        'income-share-0',
        'add-income-button',
        'calculate-button',
        'simulation',
        'chart-container',
        'myChart',
        'report-button',
        'download-button'
    ];

    ids.forEach(id => {
        test(`L'élément avec l'id "${id}" existe`, () => {
            expect(document.getElementById(id)).not.toBeNull();
        });
    });

    test('The element with id "myChart" is a canvas', () => {
        const myChart = document.getElementById('myChart');
        expect(myChart).not.toBeNull();
        expect(myChart.tagName).toBe('CANVAS');
    });

    test('The element with id "chart-container" is a div', () => {
        const chartContainer = document.getElementById('chart-container');
        expect(chartContainer).not.toBeNull();
        expect(chartContainer.tagName).toBe('DIV');
    });
    test('The element with id "simulation" is a div', () => {
        const simulation = document.getElementById('simulation');
        expect(simulation).not.toBeNull();
        expect(simulation.tagName).toBe('DIV');
    });
    test('The element with id "welcome-message" is a div', () => {
        const welcomeMessage = document.getElementById('welcome-message');
        expect(welcomeMessage).not.toBeNull();
        expect(welcomeMessage.tagName).toBe('DIV');
    });
    test('The element with id "close-welcome" is a button', () => {
        const closeWelcome = document.getElementById('close-welcome');
        expect(closeWelcome).not.toBeNull();
        expect(closeWelcome.tagName).toBe('BUTTON');
    });
    test('The element with id "home-logo" is an img', () => {
        const homeLogo = document.getElementById('home-logo');
        expect(homeLogo).not.toBeNull();
        expect(homeLogo.tagName).toBe('IMG');
    });
    test('The element with id "github-logo" is an img', () => {
        const githubLogo = document.getElementById('github-logo');
        expect(githubLogo).not.toBeNull();
        expect(githubLogo.tagName).toBe('IMG');
    });
    test('The element with id "language-select" is a select', () => {
        const languageSelect = document.getElementById('language-select');
        expect(languageSelect).not.toBeNull();
        expect(languageSelect.tagName).toBe('SELECT');
    });
    test('The element with id "title" is a h1', () => {
        const title = document.getElementById('title');
        expect(title).not.toBeNull();
        expect(title.tagName).toBe('TITLE');
    });

});