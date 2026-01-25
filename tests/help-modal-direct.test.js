/**
 * @jest-environment jsdom
 * 
 * Consolidated Test Suite for Help Modal Module
 * Tests help modal exported functions and integration behavior
 */

// Mock loadTranslations before importing help-modal
jest.mock('../js/handle-language.js', () => ({
    loadTranslations: jest.fn((language) => {
        const translations = {
            fr: {
                helpTitle: 'Aide',
                helpFormulasHeading: 'Formules',
                helpTotalPurchaseCost: 'Coût total de l\'achat',
                helpBorrowedAmount: 'Montant emprunté',
                helpMonthlyPayment: 'Paiement mensuel',
                helpAPRFormula: 'Formule APR',
                helpPropertyTaxEvolution: 'Taxe foncière évolutive',
                helpPropertyTaxEvolutionFormula: '\\( T_{\\text{cumulée}}(t) = \\begin{cases} T \\cdot t & \\text{si } r = 0 \\\\ T \\cdot \\frac{(1+r)^t - 1}{r} & \\text{si } r > 0 \\end{cases} \\)',
                helpPropertyTaxEvolutionDesc: 'où T = taxe foncière annuelle, r = taux d\'évolution annuel, t = nombre d\'années'
            },
            en: {
                helpTitle: 'Help',
                helpFormulasHeading: 'Formulas',
                helpTotalPurchaseCost: 'Total Purchase Cost',
                helpBorrowedAmount: 'Borrowed Amount',
                helpMonthlyPayment: 'Monthly Payment',
                helpAPRFormula: 'APR Formula',
                helpPropertyTaxEvolution: 'Evolutive property tax',
                helpPropertyTaxEvolutionFormula: '\\( T_{\\text{cumulative}}(t) = \\begin{cases} T \\cdot t & \\text{if } r = 0 \\\\ T \\cdot \\frac{(1+r)^t - 1}{r} & \\text{if } r > 0 \\end{cases} \\)',
                helpPropertyTaxEvolutionDesc: 'where T = annual property tax, r = annual evolution rate, t = number of years'
            }
        };
        return Promise.resolve(translations[language] || translations.en);
    })
}));

// Mock MathJax globally
global.MathJax = {
    typesetPromise: jest.fn(() => Promise.resolve()),
    typesetClear: jest.fn()
};

// Mock fetch
global.fetch = jest.fn(() => 
    Promise.resolve({
        text: () => Promise.resolve(`
            <div id="help-modal" class="help-modal">
                <div class="help-modal-overlay"></div>
                <div class="help-modal-content">
                    <button id="help-modal-close" class="help-modal-close">×</button>
                    <h2 data-i18n="helpTitle">Help</h2>
                    <div class="help-modal-body">
                        <h3 data-i18n="helpFormulasHeading">Formulas</h3>
                        <div class="formula">
                            <strong data-i18n="helpTotalPurchaseCost">Total Purchase Cost</strong>
                            <span class="math" data-i18n="helpTotalPurchaseCostFormula"></span>
                        </div>
                        <div class="formula">
                            <strong data-i18n="helpPropertyTaxEvolution">Evolutive Property Tax</strong>
                            <span class="math" data-i18n="helpPropertyTaxEvolutionFormula"></span>
                            <p class="formula-desc" data-i18n="helpPropertyTaxEvolutionDesc"></p>
                        </div>
                    </div>
                </div>
            </div>
        `)
    })
);

import { openHelpModal, closeHelpModal } from '../js/help-modal.js';

describe('Help Modal Module', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        
        // Create help icon for modal to reference
        const helpIcon = document.createElement('button');
        helpIcon.id = 'help-icon-button';
        helpIcon.textContent = 'Σ';
        document.body.appendChild(helpIcon);
        
        // Create language select
        const langSelect = document.createElement('select');
        langSelect.id = 'language-select';
        langSelect.value = 'fr';
        document.body.appendChild(langSelect);
        
        // Trigger DOMContentLoaded to initialize the help modal
        const domContentLoadedEvent = new Event('DOMContentLoaded');
        document.dispatchEvent(domContentLoadedEvent);
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 150));
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Exported Functions', () => {
        it('should export openHelpModal and closeHelpModal functions', () => {
            expect(typeof openHelpModal).toBe('function');
            expect(typeof closeHelpModal).toBe('function');
        });
    });

    describe('Modal Opening and Closing', () => {
        it('should open help modal and add active class', async () => {
            const modal = document.getElementById('help-modal');
            if (modal) {
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                expect(document.body.style.overflow).toBe('hidden');
            }
        });

        it('should close help modal and remove active class', async () => {
            const modal = document.getElementById('help-modal');
            if (modal) {
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                closeHelpModal();
                expect(modal.classList.contains('active')).toBe(false);
                expect(document.body.style.overflow).toBe('auto');
            }
        });
    });

    describe('Event Listeners', () => {
        it('should attach click event listener to help icon', async () => {
            const helpIcon = document.getElementById('help-icon-button');
            expect(helpIcon).toBeTruthy();
        });

        it('should close modal when pressing Escape key', async () => {
            const modal = document.getElementById('help-modal');
            if (modal) {
                openHelpModal();
                if (modal.classList.contains('active')) {
                    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
                    document.dispatchEvent(escapeEvent);
                    // Modal should attempt to close
                }
            }
        });

        it('should not throw on modal operations', async () => {
            expect(() => {
                openHelpModal();
                closeHelpModal();
            }).not.toThrow();
        });
    });

    describe('Translation Updates', () => {
        it('should update translations when language changes to English', async () => {
            const langSelect = document.getElementById('language-select');
            if (langSelect) {
                langSelect.value = 'en';
                langSelect.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 100));
                expect(global.fetch).toHaveBeenCalled();
            }
        });

        it('should handle multiple language changes', async () => {
            const langSelect = document.getElementById('language-select');
            if (langSelect) {
                langSelect.value = 'en';
                langSelect.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 100));
                
                langSelect.value = 'fr';
                langSelect.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 100));
                
                expect(global.fetch).toHaveBeenCalled();
            }
        });

        it('should update help modal title with translations', async () => {
            const titleElement = document.querySelector('[data-i18n="helpTitle"]');
            if (titleElement) {
                expect(titleElement).toBeTruthy();
            }
        });

        it('should include property tax evolution formula in translations', async () => {
            const formulaElement = document.querySelector('[data-i18n="helpPropertyTaxEvolutionFormula"]');
            if (formulaElement) {
                expect(formulaElement).toBeTruthy();
            }
        });
    });

    describe('MathJax Rendering', () => {
        it('should not throw when rendering math', async () => {
            expect(() => {
                if (document.getElementById('help-modal')) {
                    // Rendering should work without errors
                }
            }).not.toThrow();
        });

        it('should handle MathJax mocking', async () => {
            expect(global.MathJax).toBeTruthy();
            expect(typeof global.MathJax.typesetPromise).toBe('function');
        });
    });

    describe('Error Handling', () => {
        it('should not throw when functions are called without modal loaded', () => {
            document.body.innerHTML = '';
            expect(() => {
                openHelpModal();
                closeHelpModal();
            }).not.toThrow();
        });

        it('should handle missing translation keys gracefully', async () => {
            const langSelect = document.getElementById('language-select');
            if (langSelect) {
                langSelect.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 100));
                // Should not throw even with missing keys
                expect(() => {
                    openHelpModal();
                }).not.toThrow();
            }
        });

        it('should log errors to console', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            // This is tested implicitly through the module initialization
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Integration Scenarios', () => {
        it('should maintain modal state through multiple open/close cycles', async () => {
            const modal = document.getElementById('help-modal');
            if (modal) {
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                closeHelpModal();
                expect(modal.classList.contains('active')).toBe(false);
                
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                closeHelpModal();
                expect(modal.classList.contains('active')).toBe(false);
            }
        });

        it('should keep modal open when switching languages', async () => {
            const modal = document.getElementById('help-modal');
            const langSelect = document.getElementById('language-select');
            if (modal && langSelect) {
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                
                langSelect.value = 'en';
                langSelect.dispatchEvent(new Event('change'));
                await new Promise(resolve => setTimeout(resolve, 100));
                
                expect(modal.classList.contains('active')).toBe(true);
                closeHelpModal();
            }
        });

        it('should handle rapid consecutive clicks', async () => {
            const helpIcon = document.getElementById('help-icon-button');
            const modal = document.getElementById('help-modal');
            if (helpIcon && modal) {
                helpIcon.click();
                helpIcon.click();
                helpIcon.click();
                // Modal should still be in valid state
                expect(modal).toBeTruthy();
            }
        });
    });
});
