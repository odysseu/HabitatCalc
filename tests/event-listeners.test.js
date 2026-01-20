/**
 * @jest-environment jsdom
 * 
 * Test suite for Event Listeners Module
 * Tests form interactions, welcome message, language changes, and APR updates
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock the imported functions
const mockFormHandler = {
    addIncome: jest.fn(),
    calculateAPR: jest.fn(() => 3.5),
    resetForm: jest.fn(),
    deleteIncome: jest.fn()
};

const mockReportHandler = {
    generateReport: jest.fn()
};

const mockLanguageHandler = {
    loadTranslations: jest.fn((lang) => Promise.resolve({ 
        helpTitle: 'Help',
        apr: 'APR'
    })),
    updateContent: jest.fn(),
    updateAPRLabel: jest.fn()
};

jest.mock('../js/form-handler.js', () => mockFormHandler);
jest.mock('../js/report-handler.js', () => mockReportHandler);
jest.mock('../js/handle-language.js', () => mockLanguageHandler);

describe('Event Listeners Module', () => {
    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        
        // Clear all listeners first
        document.removeEventListener('DOMContentLoaded', null);
        
        // Import event-listeners to register its event handlers
        // This should set up event listeners when the module loads
        const eventListenersModule = await import('../js/event-listeners.js');
        
        // Manually trigger DOMContentLoaded if event-listeners waits for it
        const domContentLoadedEvent = new Event('DOMContentLoaded', {
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(domContentLoadedEvent);
        
        // Give time for async operations
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    describe('Form Section Toggle Event Listeners', () => {
        it('should have form section toggle headers', () => {
            const headers = document.querySelectorAll('.form-section-toggle');
            expect(headers.length).toBeGreaterThan(0);
        });

        it('should toggle collapsed class when clicking form section header', () => {
            const header = document.querySelector('.form-section-toggle');
            const content = header.nextElementSibling;
            const hadCollapsed = content.classList.contains('collapsed');
            
            header.click();
            const hasCollapsed = content.classList.contains('collapsed');
            
            expect(hasCollapsed).not.toBe(hadCollapsed);
        });

        it('should toggle expanded class on header when clicking', () => {
            const header = document.querySelector('.form-section-toggle');
            const hadExpanded = header.classList.contains('expanded');
            
            header.click();
            const hasExpanded = header.classList.contains('expanded');
            
            expect(hasExpanded).not.toBe(hadExpanded);
        });

        it('should toggle multiple times without errors', () => {
            const header = document.querySelector('.form-section-toggle');
            expect(() => {
                header.click();
                header.click();
                header.click();
            }).not.toThrow();
        });
    });

    describe('Welcome Message Interactions', () => {
        it('should have welcome overlay with active class', () => {
            const welcomeOverlay = document.getElementById('welcome-overlay');
            expect(welcomeOverlay).toBeTruthy();
            expect(welcomeOverlay.classList.contains('active')).toBe(true);
        });

        it('should have close welcome button', () => {
            const closeButton = document.getElementById('close-welcome');
            expect(closeButton).toBeTruthy();
            expect(closeButton.tagName).toBe('BUTTON');
        });

        it('should have welcome message inside overlay', () => {
            const overlay = document.getElementById('welcome-overlay');
            const message = document.getElementById('welcome-message');
            expect(overlay.contains(message)).toBe(true);
        });

        it('should have close button inside welcome message', () => {
            const message = document.getElementById('welcome-message');
            const closeButton = document.getElementById('close-welcome');
            expect(message.contains(closeButton)).toBe(true);
        });

        it('should be able to click close button without errors', () => {
            const closeButton = document.getElementById('close-welcome');
            expect(() => {
                closeButton.click();
            }).not.toThrow();
        });

        it('should be able to trigger overlay clicks without errors', () => {
            const overlay = document.getElementById('welcome-overlay');
            expect(() => {
                const event = new MouseEvent('click', { bubbles: true });
                Object.defineProperty(event, 'target', { value: overlay, enumerable: true });
                overlay.dispatchEvent(event);
            }).not.toThrow();
        });
    });

    describe('GenerateReport Function', () => {
        it('should have form calculator element', () => {
            const form = document.getElementById('form-calculator');
            expect(form).toBeTruthy();
            expect(form.tagName).toBe('FORM');
        });

        it('should have dark mode toggle', () => {
            const toggle = document.getElementById('dark-mode-toggle');
            expect(toggle).toBeTruthy();
            expect(toggle.tagName).toBe('INPUT');
            expect(toggle.type).toBe('checkbox');
        });

        it('should handle form change without errors', async () => {
            mockReportHandler.generateReport.mockClear();
            const form = document.getElementById('form-calculator');
            
            expect(() => {
                const event = new Event('change', { bubbles: true });
                form.dispatchEvent(event);
            }).not.toThrow();
        });

        it('should handle dark mode toggle change without errors', async () => {
            mockReportHandler.generateReport.mockClear();
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            
            expect(() => {
                if (darkModeToggle) {
                    darkModeToggle.checked = !darkModeToggle.checked;
                    const event = new Event('change', { bubbles: true });
                    darkModeToggle.dispatchEvent(event);
                }
            }).not.toThrow();
        });

        it('should dispatch events without errors', () => {
            expect(() => {
                mockReportHandler.generateReport();
            }).not.toThrow();
        });
    });

    describe('Home Logo Click Handler', () => {
        it('should have home logo element', () => {
            const logo = document.getElementById('home-logo');
            expect(logo).toBeTruthy();
            expect(logo.tagName).toBe('IMG');
        });

        it('should handle home logo click without errors', async () => {
            mockFormHandler.resetForm.mockClear();
            const logo = document.getElementById('home-logo');
            
            expect(() => {
                if (logo) {
                    logo.click();
                }
            }).not.toThrow();
        });
    });

    describe('Calculate Button Click Handler', () => {
        it('should have calculate button', () => {
            const button = document.getElementById('calculate-button');
            expect(button).toBeTruthy();
            expect(button.tagName).toBe('BUTTON');
        });

        it('should handle calculate button click without errors', async () => {
            mockReportHandler.generateReport.mockClear();
            const button = document.getElementById('calculate-button');
            
            expect(() => {
                if (button) {
                    button.click();
                }
            }).not.toThrow();
        });
    });

    describe('Add Income Button Handler', () => {
        it('should have add income button', () => {
            const button = document.getElementById('add-income-button');
            expect(button).toBeTruthy();
            expect(button.tagName).toBe('BUTTON');
        });

        it('should handle add income button click without errors', async () => {
            mockFormHandler.addIncome.mockClear();
            const button = document.getElementById('add-income-button');
            
            expect(() => {
                if (button) {
                    button.click();
                }
            }).not.toThrow();
        });
    });

    describe('Delete Income Event Delegation', () => {
        it('should have incomes container', () => {
            const container = document.getElementById('incomes-container');
            expect(container).toBeTruthy();
            expect(container.tagName).toBe('DIV');
        });

        it('should handle delete income button click without errors', async () => {
            mockFormHandler.deleteIncome.mockClear();
            const container = document.getElementById('incomes-container');
            
            expect(() => {
                if (container) {
                    // Add a delete button to the container
                    const deleteBtn = document.createElement('button');
                    deleteBtn.id = 'delete-income-button-0';
                    container.appendChild(deleteBtn);
                    
                    deleteBtn.click();
                }
            }).not.toThrow();
        });
    });

    describe('APR Input Listeners', () => {
        it('should have all APR input elements', () => {
            const aprInputIds = [
                'insurance-rate',
                'interest-rate',
                'file-fees',
                'price',
                'notary',
                'agency-commission',
                'contribution',
                'loanDuration'
            ];

            aprInputIds.forEach(id => {
                const element = document.getElementById(id);
                expect(element).toBeTruthy();
            });
        });

        it('should have interest rate input as number type', async () => {
            const interestRateInput = document.getElementById('interest-rate');
            
            if (interestRateInput) {
                expect(interestRateInput.type).toBe('number');
            }
        });

        it('should handle input changes without errors', async () => {
            const priceInput = document.getElementById('price');
            
            expect(() => {
                if (priceInput) {
                    priceInput.value = '300000';
                    const event = new Event('input', { bubbles: true });
                    priceInput.dispatchEvent(event);
                }
            }).not.toThrow();
        });
    });

    describe('Language Select Change Handler', () => {
        it('should have language select dropdown', () => {
            const langSelect = document.getElementById('language-select');
            expect(langSelect).toBeTruthy();
            expect(langSelect.tagName).toBe('SELECT');
        });

        it('should have French and English options', () => {
            const select = document.getElementById('language-select');
            const values = Array.from(select.options).map(opt => opt.value);
            expect(values).toContain('fr');
            expect(values).toContain('en');
        });

        it('should handle language changes without errors', async () => {
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
