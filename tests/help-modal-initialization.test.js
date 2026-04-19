/**
 * @jest-environment jsdom
 * 
 * Test suite specifically for covering loadHelpModal initialization paths
 */

// Mock loadTranslations before any imports
jest.mock('../js/handle-language.js', () => ({
    loadTranslations: jest.fn((language) => {
        const translations = {
            fr: {
                helpTitle: 'Aide',
                helpFormulasHeading: 'Formules'
            },
            en: {
                helpTitle: 'Help',
                helpFormulasHeading: 'Formulas'
            }
        };
        return Promise.resolve(translations[language] || translations.en);
    })
}));

// Mock MathJax globally before importing
global.MathJax = {
    typesetPromise: jest.fn(() => Promise.resolve()),
    typesetClear: jest.fn()
};

describe('Help Modal Initialization Path Coverage', () => {
    let originalFetch;

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        
        // Set up DOM elements that help-modal.js expects at module load time
        const helpIcon = document.createElement('button');
        helpIcon.id = 'help-icon-button';
        helpIcon.textContent = 'Σ';
        document.body.appendChild(helpIcon);
        
        const langSelect = document.createElement('select');
        langSelect.id = 'language-select';
        langSelect.value = 'fr';
        document.body.appendChild(langSelect);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('should execute loadHelpModal initialization with initial language and renderMath', async () => {
        // Set up a successful fetch mock
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve(`
                    <div id="help-modal" class="help-modal">
                        <div class="help-modal-overlay"></div>
                        <div class="help-modal-content">
                            <button id="help-modal-close" class="help-modal-close">×</button>
                            <h2 data-i18n="helpTitle">Help</h2>
                        </div>
                    </div>
                `)
            })
        );

        // Import the module - this will execute the module code including DOMContentLoaded listener
        // But DOMContentLoaded has already fired in jsdom, so we need to manually trigger it
        const { openHelpModal, closeHelpModal } = require('../js/help-modal.js');
        
        // Manually trigger DOMContentLoaded since it fires automatically in jsdom before we set up
        // The module's event listener is attached, so we can trigger it
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Wait for async operations to complete
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify fetch was called (line 34: fetch('help-content.html'))
        expect(global.fetch).toHaveBeenCalledWith('help-content.html');
        
        // Verify MathJax.typesetPromise was called (line 51: renderMath -> MathJax.typesetPromise)
        expect(global.MathJax.typesetPromise).toHaveBeenCalled();
        
        // Verify modal was created
        const modal = document.getElementById('help-modal');
        expect(modal).toBeTruthy();
    });

    it('should execute loadHelpModal with fallback to fr when languageSelect has no value', async () => {
        // Set language select to have empty value to test fallback
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = '';
        }
        
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve(`
                    <div id="help-modal" class="help-modal">
                        <div class="help-modal-overlay"></div>
                        <div class="help-modal-content">
                            <button id="help-modal-close" class="help-modal-close">×</button>
                            <h2 data-i18n="helpTitle">Help</h2>
                        </div>
                    </div>
                `)
            })
        );

        // Clear the require cache to re-import the module
        jest.resetModules();
        
        // Import fresh
        const { openHelpModal, closeHelpModal } = require('../js/help-modal.js');
        
        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Modal should still be created even with empty language
        const modal = document.getElementById('help-modal');
        expect(modal).toBeTruthy();
    });

    it('should handle fetch error in loadHelpModal catch block', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Mock fetch to reject
        global.fetch = jest.fn(() =>
            Promise.reject(new Error('Network error'))
        );

        // Clear and re-import
        jest.resetModules();
        
        const { openHelpModal, closeHelpModal } = require('../js/help-modal.js');
        
        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify error was logged (line 53: console.error)
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error loading help modal');
        
        consoleErrorSpy.mockRestore();
    });

    it('should execute attachHelpModalEventListeners with all event listeners', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve(`
                    <div id="help-modal" class="help-modal">
                        <div class="help-modal-overlay"></div>
                        <div class="help-modal-content">
                            <button id="help-modal-close" class="help-modal-close">×</button>
                            <h2 data-i18n="helpTitle">Help</h2>
                        </div>
                    </div>
                `)
            })
        );

        // Clear and re-import
        jest.resetModules();
        
        const { openHelpModal, closeHelpModal } = require('../js/help-modal.js');
        
        // Trigger DOMContentLoaded to initialize
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify modal elements exist
        const modal = document.getElementById('help-modal');
        const closeBtn = document.getElementById('help-modal-close');
        const overlay = document.querySelector('.help-modal-overlay');
        const helpIcon = document.getElementById('help-icon-button');
        const langSelect = document.getElementById('language-select');
        
        expect(modal).toBeTruthy();
        expect(closeBtn).toBeTruthy();
        expect(overlay).toBeTruthy();
        expect(helpIcon).toBeTruthy();
        expect(langSelect).toBeTruthy();
        
        // Verify event listeners are attached by checking elements have them
        // We can't directly check addEventListener was called, but we can verify
        // the elements exist and the callbacks work
        
        // Test that modal can be opened via exported function
        openHelpModal();
        expect(modal.classList.contains('active')).toBe(true);
        
        // Test that modal can be closed via close button
        closeHelpModal();
        expect(modal.classList.contains('active')).toBe(false);
    });

    it('should execute all event listener callbacks', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve(`
                    <div id="help-modal" class="help-modal">
                        <div class="help-modal-overlay"></div>
                        <div class="help-modal-content">
                            <button id="help-modal-close" class="help-modal-close">×</button>
                            <h2 data-i18n="helpTitle">Help</h2>
                        </div>
                    </div>
                `)
            })
        );

        // Clear and re-import
        jest.resetModules();
        
        const { openHelpModal, closeHelpModal } = require('../js/help-modal.js');
        
        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event('DOMContentLoaded'));
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const modal = document.getElementById('help-modal');
        const closeBtn = document.getElementById('help-modal-close');
        const overlay = document.querySelector('.help-modal-overlay');
        const helpIcon = document.getElementById('help-icon-button');
        const langSelect = document.getElementById('language-select');
        
        // Test help icon click - should open modal
        helpIcon.click();
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(modal.classList.contains('active')).toBe(true);
        
        // Test close button click
        closeBtn.click();
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(modal.classList.contains('active')).toBe(false);
        
        // Test overlay click
        openHelpModal();
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(modal.classList.contains('active')).toBe(true);
        overlay.click();
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(modal.classList.contains('active')).toBe(false);
        
        // Test Escape key
        openHelpModal();
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(modal.classList.contains('active')).toBe(true);
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(modal.classList.contains('active')).toBe(false);
        
        // Test language change
        langSelect.value = 'en';
        langSelect.dispatchEvent(new Event('change'));
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Modal should still exist
        expect(modal).toBeTruthy();
    });
});
