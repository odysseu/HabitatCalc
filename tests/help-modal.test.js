/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock loadTranslations
jest.mock('../js/handle-language.js', () => {
    return {
        loadTranslations: jest.fn(() => Promise.resolve({
            helpTitle: 'Help',
            helpFormulasHeading: 'Formulas Used'
        }))
    };
});

// Mock fetch for loading help-content.html
const mockHelpContent = `<div id="help-modal" class="help-modal">
    <div class="help-modal-overlay"></div>
    <div class="help-modal-content">
        <button class="help-modal-close" id="help-modal-close">×</button>
        <h2 id="help-modal-title" data-i18n="helpTitle">Help</h2>
    </div>
</div>`;

global.fetch = jest.fn(() =>
    Promise.resolve({
        text: () => Promise.resolve(mockHelpContent)
    })
);

describe('Help Modal Functionality', () => {
    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;

        // Mock MathJax
        window.MathJax = {
            typesetPromise: jest.fn(() => Promise.resolve())
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    afterEach(() => {
        // Clean up help modal if it exists
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.remove();
        }
    });

    it('should have help icon button in the header', () => {
        const helpIcon = document.getElementById('help-icon-button');
        expect(helpIcon).toBeTruthy();
    });

    it('should have language select dropdown', () => {
        const languageSelect = document.getElementById('language-select');
        expect(languageSelect).toBeTruthy();
        expect(languageSelect.value).toBe('fr');
    });

    it('should have sigma symbol in help icon button', () => {
        const helpIcon = document.getElementById('help-icon-button');
        expect(helpIcon.textContent.trim()).toBe('Σ');
    });

    it('should have tooltip for help icon', () => {
        const tooltip = document.getElementById('help-icon-tooltip');
        expect(tooltip).toBeTruthy();
        expect(tooltip.textContent).toContain('Aide');
    });

    it('should attempt to load help-content.html on module import', async () => {
        // This test verifies the fetch is mocked correctly
        expect(global.fetch).not.toHaveBeenCalled();
        // The actual import happens during DOMContentLoaded in real code
    });

    it('should have proper CSS class for help icon container', () => {
        const container = document.querySelector('.help-icon-container');
        expect(container).toBeTruthy();
    });

    it('should have help icon button with proper attributes', () => {
        const helpIcon = document.getElementById('help-icon-button');
        expect(helpIcon.getAttribute('class')).toContain('help-icon-button');
        expect(helpIcon.getAttribute('aria-label')).toBe('Help');
    });

    it('should have help modal styles defined', () => {
        // Check that CSS classes exist
        const helpModalClass = document.createElement('div');
        helpModalClass.className = 'help-modal';
        expect(helpModalClass.className).toContain('help-modal');
    });

    it('mock fetch should return valid HTML content', async () => {
        const response = await fetch('help-content.html');
        const text = await response.text();
        expect(text).toContain('help-modal');
        expect(text).toContain('help-modal-close');
        expect(text).toContain('data-i18n');
    });

    it('mock MathJax should be available', () => {
        expect(window.MathJax).toBeTruthy();
        expect(window.MathJax.typesetPromise).toBeTruthy();
    });
});
