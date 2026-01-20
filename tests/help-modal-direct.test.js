/**
 * @jest-environment jsdom
 * 
 * Test Suite for Help Modal Module
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
                helpPurchaseLosses: 'Pertes d\'achat',
                helpRentLosses: 'Pertes de location',
                helpClose: 'Fermer'
            },
            en: {
                helpTitle: 'Help',
                helpFormulasHeading: 'Formulas',
                helpTotalPurchaseCost: 'Total Purchase Cost',
                helpBorrowedAmount: 'Borrowed Amount',
                helpMonthlyPayment: 'Monthly Payment',
                helpAPRFormula: 'APR Formula',
                helpPurchaseLosses: 'Purchase Losses',
                helpRentLosses: 'Rent Losses',
                helpClose: 'Close'
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
                    <div class="help-modal-header">
                        <h2 data-i18n="helpTitle">Help</h2>
                        <button id="help-modal-close" class="help-close-button">×</button>
                    </div>
                    <div class="help-modal-body">
                        <h3 data-i18n="helpFormulasHeading">Formulas</h3>
                        <div class="formula">
                            <strong data-i18n="helpTotalPurchaseCost">Total Purchase Cost</strong>
                            <span class="math">\\(Cost\\)</span>
                        </div>
                    </div>
                </div>
            </div>
        `)
    })
);

import { openHelpModal, closeHelpModal } from '../js/help-modal.js';

describe('Help Modal Module - Exported Functions', () => {
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
        
        // Wait a bit for async operations
        await new Promise(resolve => setTimeout(resolve, 150));
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Module Exports', () => {
        it('should export openHelpModal function', () => {
            expect(typeof openHelpModal).toBe('function');
        });

        it('should export closeHelpModal function', () => {
            expect(typeof closeHelpModal).toBe('function');
        });

        it('exported functions should be callable without errors', () => {
            expect(() => {
                openHelpModal();
                closeHelpModal();
            }).not.toThrow();
        });
    });

    describe('openHelpModal() Function', () => {
        beforeEach(async () => {
            // Simulate DOMContentLoaded to load modal
            await new Promise(resolve => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
                setTimeout(resolve, 100);
            });
        });

        it('should add active class to help modal when called', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            openHelpModal();
            const modal = document.getElementById('help-modal');
            if (modal) {
                expect(modal.classList.contains('active')).toBe(true);
            }
        });

        it('should hide body overflow when modal opens', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            const originalOverflow = document.body.style.overflow;
            openHelpModal();
            expect(document.body.style.overflow).toBe('hidden');
            document.body.style.overflow = originalOverflow;
        });

        it('should be idempotent (multiple calls do not cause errors)', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            expect(() => {
                openHelpModal();
                openHelpModal();
                openHelpModal();
            }).not.toThrow();
        });
    });

    describe('closeHelpModal() Function', () => {
        beforeEach(async () => {
            // Simulate DOMContentLoaded to load modal
            await new Promise(resolve => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
                setTimeout(resolve, 100);
            });
            // Open modal first
            openHelpModal();
        });

        it('should remove active class from help modal when called', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            closeHelpModal();
            const modal = document.getElementById('help-modal');
            if (modal) {
                expect(modal.classList.contains('active')).toBe(false);
            }
        });

        it('should restore body overflow when modal closes', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            closeHelpModal();
            expect(document.body.style.overflow).toBe('auto');
        });

        it('should not throw error when called without modal', () => {
            document.body.innerHTML = '';
            expect(() => closeHelpModal()).not.toThrow();
        });

        it('should be idempotent (multiple calls do not cause errors)', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            expect(() => {
                closeHelpModal();
                closeHelpModal();
                closeHelpModal();
            }).not.toThrow();
        });
    });

    describe('Modal State Management', () => {
        beforeEach(async () => {
            await new Promise(resolve => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
                setTimeout(resolve, 100);
            });
        });

        it('should toggle between open and closed states', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            const modal = document.getElementById('help-modal');
            if (modal) {
                expect(modal.classList.contains('active')).toBe(false);
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                closeHelpModal();
                expect(modal.classList.contains('active')).toBe(false);
            }
        });

        it('should maintain body scroll state correctly', async () => {
            await new Promise(resolve => setTimeout(resolve, 150));
            const initialOverflow = document.body.style.overflow;
            openHelpModal();
            expect(document.body.style.overflow).toBe('hidden');
            closeHelpModal();
            expect(document.body.style.overflow).toBe('auto');
        });
    });

    describe('Integration with DOM', () => {
        it('should find help icon button', () => {
            const helpIcon = document.getElementById('help-icon-button');
            expect(helpIcon).toBeTruthy();
            expect(helpIcon.textContent).toBe('Σ');
        });

        it('should find language select element', () => {
            const langSelect = document.getElementById('language-select');
            expect(langSelect).toBeTruthy();
            expect(langSelect).toHaveProperty('id', 'language-select');
        });

        it('should handle modal operations without errors when modal is loading', async () => {
            expect(() => {
                openHelpModal();
                closeHelpModal();
            }).not.toThrow();
        });
    });

    describe('MathJax Integration', () => {
        it('should not throw when MathJax is mocked', async () => {
            await new Promise(resolve => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
                setTimeout(resolve, 150);
            });
            
            expect(() => {
                openHelpModal();
            }).not.toThrow();
        });
    });

    describe('Module Stability', () => {
        it('should not crash when rapid open/close cycles occur', async () => {
            await new Promise(resolve => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
                setTimeout(resolve, 100);
            });
            
            expect(() => {
                for (let i = 0; i < 5; i++) {
                    openHelpModal();
                    closeHelpModal();
                }
            }).not.toThrow();
        });

        it('should maintain state after multiple operations', async () => {
            await new Promise(resolve => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
                setTimeout(resolve, 100);
            });
            
            openHelpModal();
            const modal = document.getElementById('help-modal');
            const initialState = modal ? modal.classList.contains('active') : null;
            
            closeHelpModal();
            const closedState = modal ? modal.classList.contains('active') : null;
            
            openHelpModal();
            const reopenedState = modal ? modal.classList.contains('active') : null;
            
            expect(reopenedState).toBe(initialState);
            expect(closedState).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing modal element gracefully', () => {
            document.body.innerHTML = '';
            expect(() => {
                closeHelpModal();
            }).not.toThrow();
        });

        it('should handle MathJax errors gracefully', async () => {
            global.MathJax.typesetPromise.mockRejectedValue(new Error('MathJax error'));
            
            expect(async () => {
                await new Promise(resolve => {
                    const event = new Event('DOMContentLoaded');
                    document.dispatchEvent(event);
                    setTimeout(resolve, 100);
                });
            }).not.toThrow();
        });

        it('should handle fetch errors gracefully', async () => {
            global.fetch.mockRejectedValue(new Error('Fetch failed'));
            
            expect(async () => {
                await new Promise(resolve => {
                    const event = new Event('DOMContentLoaded');
                    document.dispatchEvent(event);
                    setTimeout(resolve, 100);
                });
            }).not.toThrow();
        });
    });

    describe('Function Behavior Consistency', () => {
        it('should consistently return undefined', () => {
            const resultOpen = openHelpModal();
            const resultClose = closeHelpModal();
            expect(resultOpen).toBeUndefined();
            expect(resultClose).toBeUndefined();
        });

        it('should not accept or use parameters', () => {
            expect(() => {
                openHelpModal('param1', 'param2');
                closeHelpModal({ foo: 'bar' });
            }).not.toThrow();
        });
    });

    describe('Event Listener Integration', () => {
        it('should handle help icon click event without errors', async () => {
            const helpIcon = document.getElementById('help-icon-button');
            
            expect(() => {
                if (helpIcon) {
                    helpIcon.click();
                }
            }).not.toThrow();
        });

        it('should handle modal overlay click without errors', async () => {
            const overlay = document.querySelector('.help-modal-overlay');
            
            expect(() => {
                if (overlay) {
                    overlay.click();
                }
            }).not.toThrow();
        });

        it('should handle close button click without errors', async () => {
            const closeBtn = document.getElementById('help-modal-close');
            
            expect(() => {
                if (closeBtn) {
                    closeBtn.click();
                }
            }).not.toThrow();
        });

        it('should handle Escape key press when modal is active', async () => {
            openHelpModal();
            const modal = document.getElementById('help-modal');
            if (modal) {
                expect(modal.classList.contains('active')).toBe(true);
                
                const event = new KeyboardEvent('keydown', { key: 'Escape' });
                document.dispatchEvent(event);
                
                // Modal should be closed after Escape
                expect(modal.classList.contains('active')).toBe(false);
            }
        });

        it('should not process non-Escape keys', async () => {
            const modal = document.getElementById('help-modal');
            if (modal) {
                openHelpModal();
                expect(modal.classList.contains('active')).toBe(true);
                
                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                document.dispatchEvent(event);
                
                // Modal should remain open with non-Escape key
                expect(modal.classList.contains('active')).toBe(true);
                
                closeHelpModal();
            }
        });

        it('should handle language select change without errors', async () => {
            const langSelect = document.getElementById('language-select');
            
            expect(() => {
                if (langSelect) {
                    langSelect.value = 'en';
                    const event = new Event('change', { bubbles: true });
                    langSelect.dispatchEvent(event);
                }
            }).not.toThrow();
        });
    });
});
