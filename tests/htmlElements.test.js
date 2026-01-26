/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Test suite to verify that all required elements exist in the DOM
 * This ensures the HTML structure is intact and all necessary IDs are present
 */
describe('Test that all id-ed elements exist in the DOM', () => {
    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });

    // Core layout elements
    const ids = [
        // Welcome and Navigation
        'welcome-message',
        'welcome-overlay',
        'close-welcome',
        'home-logo',
        'github-logo',
        'language-select',
        'help-icon-button',
        'help-icon-tooltip',

        // Page title
        'title',
        'title-section',

        // Form elements
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
        'renting-section',
        'fictitiousRent',
        'fictitiousRentRate',
        'buyHousingTax',
        'rentingHousingTax',
        'propertyTax',
        'incomes-container',
        'income-0',
        'income-share-0',
        'add-income-button',
        'calculate-button',

        // Chart and summary
        'simulation',
        'chart-container',
        'myChart',
        'report-button',

        // Tooltips and help
        'reset-logo-help',
        'github-logo-help',

        // Dark mode
        'dark-mode-toggle',

        // Summary display
        'summary-part1',
        'repaymentYearDisplay',
        'summary-part2',
        'cumulativePurchaseDisplay'
    ];

    ids.forEach(id => {
        test(`Element with id "${id}" should exist`, () => {
            expect(document.getElementById(id)).not.toBeNull();
        });
    });

    // Specific element type tests
    describe('Element type validation', () => {
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

        test('The element with id "welcome-overlay" is a div', () => {
            const welcomeOverlay = document.getElementById('welcome-overlay');
            expect(welcomeOverlay).not.toBeNull();
            expect(welcomeOverlay.tagName).toBe('DIV');
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

        test('The element with id "help-icon-button" is a button', () => {
            const helpIconButton = document.getElementById('help-icon-button');
            expect(helpIconButton).not.toBeNull();
            expect(helpIconButton.tagName).toBe('BUTTON');
        });

        test('The element with id "title" is a title', () => {
            const title = document.getElementById('title');
            expect(title).not.toBeNull();
            expect(title.tagName).toBe('TITLE');
        });
    });

    describe('Welcome overlay structure', () => {
        test('Welcome overlay should have the active class initially', () => {
            const welcomeOverlay = document.getElementById('welcome-overlay');
            expect(welcomeOverlay.classList.contains('active')).toBe(true);
        });

        test('Welcome message should be contained within welcome overlay', () => {
            const welcomeOverlay = document.getElementById('welcome-overlay');
            const welcomeMessage = document.getElementById('welcome-message');
            expect(welcomeOverlay.contains(welcomeMessage)).toBe(true);
        });
    });

    describe('Help icon structure', () => {
        // test('Help icon button should display sigma symbol', () => {
        //     const helpIconButton = document.getElementById('help-icon-button');
        //     expect(helpIconButton.textContent.trim()).toBe('Σ');
        // });

        test('Help icon button should have aria-label', () => {
            const helpIconButton = document.getElementById('help-icon-button');
            expect(helpIconButton.getAttribute('aria-label')).toBe('Help');
        });

        test('Help icon tooltip should exist', () => {
            const tooltip = document.getElementById('help-icon-tooltip');
            expect(tooltip).not.toBeNull();
            expect(tooltip.classList.contains('logo-help')).toBe(true);
        });
    });
});
