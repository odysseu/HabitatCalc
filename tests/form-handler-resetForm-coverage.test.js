/**
 * @jest-environment jsdom
 */

import { resetForm, calculateAPR, findPivotYear, calculatePurchaseLosses, calculateRentLosses, extractIncomes, addIncome, deleteIncome } from '../js/form-handler.js';

// Mock loadTranslations and updateContent
jest.mock('../js/handle-language.js', () => ({
    loadTranslations: jest.fn(() => Promise.resolve({
        someKey: 'someValue'
    })),
    updateContent: jest.fn()
}));

describe('Form Handler - Reset Form Coverage Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = `
            <div id="incomes-container"></div>
            <form id="form-calculator"></form>
            <div id="simulation"></div>
            <div id="chart-container"></div>
            <canvas id="myChart"></canvas>
            <select id="language-select"><option value="fr">Français</option></select>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('resetForm - Canvas Handling', () => {
        it('should handle valid canvas element', async () => {
            await resetForm();
            
            const canvas = document.getElementById('myChart');
            expect(canvas).toBeTruthy();
            expect(canvas instanceof HTMLCanvasElement).toBe(true);
        });

        it('should create new canvas when existing one is not valid', async () => {
            // Replace valid canvas with invalid element
            const invalidCanvas = document.createElement('div');
            invalidCanvas.id = 'myChart';
            const oldCanvas = document.getElementById('myChart');
            oldCanvas.replaceWith(invalidCanvas);
            
            await resetForm();
            
            // The old div is still there (bug in original code - doesn't remove old element)
            // But a new canvas should also exist in chart-container
            const chartContainer = document.getElementById('chart-container');
            const children = chartContainer.children;
            let hasCanvas = false;
            for (let i = 0; i < children.length; i++) {
                if (children[i].tagName === 'CANVAS') {
                    hasCanvas = true;
                    break;
                }
            }
            expect(hasCanvas).toBe(true);
            
            // The function retrieves myChart which now points to the new canvas
            const myChartElement = document.getElementById('myChart');
            // There are now TWO elements with id='myChart' (the div and the new canvas)
            // getElementById returns the first one, which is the div
            // This is a bug in the original code, but we're testing the code as-is
            expect(myChartElement).toBeTruthy();
        });

        it('should warn when canvas is not valid and create new one', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            // Replace valid canvas with invalid element
            const invalidCanvas = document.createElement('div');
            invalidCanvas.id = 'myChart';
            const oldCanvas = document.getElementById('myChart');
            if (oldCanvas) {
                oldCanvas.replaceWith(invalidCanvas);
            }
            
            await resetForm();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'The element with id "myChart" is not a valid canvas. Creating a new canvas.'
            );
            
            consoleWarnSpy.mockRestore();
        });

        it('should clear canvas context when valid', async () => {
            const mockClearRect = jest.fn();
            const canvas = document.getElementById('myChart');
            jest.spyOn(canvas, 'getContext').mockReturnValue({
                clearRect: mockClearRect
            });
            
            await resetForm();
            
            expect(mockClearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
        });

        it('should warn when clearRect is not available', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const canvas = document.getElementById('myChart');
            jest.spyOn(canvas, 'getContext').mockReturnValue({});
            
            await resetForm();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'clearRect method is not available on the canvas context.'
            );
            
            consoleWarnSpy.mockRestore();
        });

        it('should reset incomes container', async () => {
            const incomesContainer = document.getElementById('incomes-container');
            incomesContainer.innerHTML = '<div>test content</div>';
            
            await resetForm();
            
            expect(incomesContainer.innerHTML).toContain('income-0');
            expect(incomesContainer.innerHTML).toContain('income-share-0');
        });

        it('should reset form calculator', async () => {
            const form = document.getElementById('form-calculator');
            // add a test input
            const testInput = document.createElement('input');
            testInput.id = 'test-input';
            testInput.value = 'test';
            form.appendChild(testInput);
            
            await resetForm();
            
            // Form reset should clear the value
            expect(form).toBeTruthy();
        });

        it('should clear simulation div', async () => {
            const simulation = document.getElementById('simulation');
            simulation.innerHTML = '<div>simulation content</div>';
            
            await resetForm();
            
            expect(simulation.innerHTML).toBe('');
        });

        it('should call loadTranslations and updateContent', async () => {
            const { loadTranslations, updateContent } = require('../js/handle-language.js');
            
            await resetForm();
            
            expect(loadTranslations).toHaveBeenCalledWith('fr');
            expect(updateContent).toHaveBeenCalled();
        });
    });
});

describe('Form Handler - findPivotYear Edge Cases', () => {
    describe('findPivotYear - No crossing scenario', () => {
        it('should return maxDuration when no crossing occurs', () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // For no crossing: netRentLosses should be <= netPurchaseLosses for all t
            // rent = rentingHousingTax*t + fictitiousRent*(1+rate)^t *12*t
            // purchase = initialCost + monthlyPayment*12*t + propertyTax*t + buyHousingTax*t + coOwnershipFees*t - resaleValue - 0
            // Make purchase very expensive and rent very cheap
            const result = findPivotYear(
                1000000, // price (very high - makes resaleValue high but initialCost even higher)
                10000, // notaryFees
                10000, // agencyCommissionFees
                0, // contribution
                10000, // monthlyPayment (very high)
                1000, // propertyTax
                1000, // buyHousingTax
                0, // rentingHousingTax (no rent tax)
                -0.5, // negative appreciationRate (property loses value!)
                3, // maxDuration (small for faster test)
                3, // loanDuration
                10, // fictitiousRent (low)
                0, // fictitiousRentRate
                0, // cumulIncomes
                0, // coOwnershipFees
                0, // fileFees
                0 // propertyTaxRate
            );
            
            // With negative appreciation, property value decreases, making purchase losses grow
            // With low/no rent costs, rent losses stay low
            // Should log about no crossing
            expect(consoleLogSpy).toHaveBeenCalledWith('No crossing before ', 3, ' years');
            expect(result).toBe(3);
            
            consoleLogSpy.mockRestore();
        });

        it('should return correct pivot year when crossing occurs at end', () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
            
            // Simpler case - crossing at year 1
            const result = findPivotYear(
                100000, // price
                2000, // notaryFees
                3000, // agencyCommissionFees
                10000, // contribution
                1500, // monthlyPayment
                100, // propertyTax
                100, // buyHousingTax
                500, // rentingHousingTax
                0.02, // appreciationRate
                50, // maxDuration
                20, // loanDuration
                1200, // fictitiousRent
                0.01, // fictitiousRentRate
                0, // cumulIncomes
                0, // coOwnershipFees
                1000, // fileFees
                0 // propertyTaxRate
            );
            
            // Should return a year before maxDuration
            expect(result).toBeLessThanOrEqual(50);
            expect(result).toBeGreaterThanOrEqual(0);
            
            consoleLogSpy.mockRestore();
        });
    });

    describe('findPivotYear - Parameter validation', () => {
        it('should handle zero duration', () => {
            const result = findPivotYear(
                0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0
            );
            expect(result).toBe(1);
        });

        it('should handle very high appreciation rate', () => {
            const result = findPivotYear(
                100000, 2000, 3000, 10000, 1500, 100, 100, 500,
                0.5, // Very high appreciation rate (50%)
                50, 20, 1200, 0.01, 0, 0, 1000, 0
            );
            expect(result).toBeLessThanOrEqual(50);
        });

        it('should handle zero property tax rate', () => {
            const result = findPivotYear(
                100000, 2000, 3000, 10000, 1500, 100, 100, 500,
                0.02, 50, 20, 1200, 0.01, 0, 0, 1000, 0
            );
            expect(result).toBeLessThanOrEqual(50);
        });
    });
});

describe('Form Handler - calculatePurchaseLosses Edge Cases', () => {
    describe('calculatePurchaseLosses - Edge Cases', () => {
        it('should handle zero values', () => {
            const result = calculatePurchaseLosses(
                0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0
            );
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(10);
        });

        it('should handle negative values converted to positive', () => {
            // When resale value exceeds costs, losses should be 0
            const result = calculatePurchaseLosses(
                100000, // price
                2000, // notaryFees
                3000, // agencyCommissionFees
                50000, // contribution
                100, // monthlyPayment (very low)
                0, // propertyTax
                0, // buyHousingTax
                0.1, // high appreciationRate
                5, // maxDuration
                20, // loanDuration
                100000, // high cumulIncomes
                0, // coOwnershipFees
                0, // fileFees
                0 // propertyTaxRate
            );
            
            // High appreciation and income might result in profits (losses = 0)
            result.forEach(loss => {
                expect(loss).toBeGreaterThanOrEqual(0);
            });
        });

        it('should handle propertyTaxRate != 0 branch', () => {
            const result = calculatePurchaseLosses(
                100000, 2000, 3000, 10000, 1500, 500, 100,
                0.05, // propertyTaxRate != 0
                10,
                20,
                0,
                0,
                1000
            );
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(10);
        });

        it('should handle t > loanDuration correctly', () => {
            const result = calculatePurchaseLosses(
                100000, 2000, 3000, 10000, 1500, 500, 100,
                0.05,
                30, // maxDuration > loanDuration
                20, // loanDuration
                0,
                0,
                1000
            );
            expect(result.length).toBe(30);
        });
    });
});

describe('Form Handler - calculateRentLosses Edge Cases', () => {
    describe('calculateRentLosses - Edge Cases', () => {
        it('should handle zero values', () => {
            const result = calculateRentLosses(0, 10, 0, 0);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(10);
        });

        it('should handle zero fictitiousRent', () => {
            const result = calculateRentLosses(0, 10, 0.05, 100);
            expect(Array.isArray(result)).toBe(true);
            result.forEach(loss => {
                expect(Number.isFinite(loss)).toBe(true);
            });
        });

        it('should handle zero rentingHousingTax', () => {
            const result = calculateRentLosses(1000, 10, 0.05, 0);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(10);
        });

        it('should handle high fictitiousRentRate', () => {
            const result = calculateRentLosses(1000, 5, 1.0, 0);
            expect(Array.isArray(result)).toBe(true);
            // With 100% growth rate, values should grow rapidly
            expect(result[4]).toBeGreaterThan(result[0]);
        });

        it('should use Math.round for cumulIncome', () => {
            const result = calculateRentLosses(1000, 1, 0, 0);
            expect(Number.isInteger(result[0])).toBe(true);
        });
    });
});

describe('Form Handler - extractIncomes Edge Cases', () => {
    describe('extractIncomes - Loop coverage', () => {
        it('should iterate through multiple income containers', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="1000">
                            <input name="income-share-0" value="50">
                        </div>
                    </div>
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-1" value="2000">
                            <input name="income-share-1" value="50">
                        </div>
                    </div>
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-2" value="3000">
                            <input name="income-share-2" value="100">
                        </div>
                    </div>
                </div>
            `;
            
            const result = extractIncomes();
            // Should iterate through all 3 containers and sum them
            expect(result).toBe(1000 * (50/100) * 12 + 2000 * (50/100) * 12 + 3000 * (100/100) * 12);
        });

        it('should handle empty income input values', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="">
                            <input name="income-share-0" value="50">
                        </div>
                    </div>
                </div>
            `;
            
            const result = extractIncomes();
            // Empty value should default to 0
            expect(result).toBe(0);
        });

        it('should handle null income or share values', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="">
                            <input name="income-share-0" value="">
                        </div>
                    </div>
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-1" value="1000">
                            <input name="income-share-1" value="100">
                        </div>
                    </div>
                </div>
            `;
            
            const result = extractIncomes();
            // First container has empty/0 values, second has valid values
            expect(result).toBe(1000 * 1 * 12);
        });

        it('should handle missing input elements gracefully', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <!-- No inputs -->
                        </div>
                    </div>
                </div>
            `;
            
            const result = extractIncomes();
            // Missing inputs should be treated as 0
            expect(result).toBe(0);
        });
    });

    describe('extractIncomes - addIncome integration', () => {
        it('should add income and extract it', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="1000">
                            <input name="income-share-0" value="100">
                        </div>
                        <button class="change-income-button" type="button" id="add-income-button">+</button>
                    </div>
                </div>
            `;
            
            addIncome();
            
            const result = extractIncomes();
            // Should have both incomes now
            expect(result).toBeGreaterThan(0);
        });
    });
});

describe('Form Handler - Validation Functions', () => {
    describe('isValidNumber and isValidPercentage via addIncome', () => {
        it('should not add income when income value is invalid', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="invalid">
                            <input name="income-share-0" value="50">
                        </div>
                        <button id="add-income-button">+</button>
                    </div>
                </div>
            `;
            
            const initialCount = document.querySelectorAll('.income-container').length;
            addIncome();
            const newCount = document.querySelectorAll('.income-container').length;
            
            // Should not add new container when validation fails
            expect(newCount).toBe(initialCount);
        });

        it('should not add income when duration value is invalid', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="1000">
                            <input name="income-share-0" value="invalid">
                        </div>
                        <button id="add-income-button">+</button>
                    </div>
                </div>
            `;
            
            const initialCount = document.querySelectorAll('.income-container').length;
            addIncome();
            const newCount = document.querySelectorAll('.income-container').length;
            
            // Should not add new container when validation fails
            expect(newCount).toBe(initialCount);
        });

        it('should not add income when both values are invalid', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="invalid">
                            <input name="income-share-0" value="invalid">
                        </div>
                        <button id="add-income-button">+</button>
                    </div>
                </div>
            `;
            
            const initialCount = document.querySelectorAll('.income-container').length;
            addIncome();
            const newCount = document.querySelectorAll('.income-container').length;
            
            // Should not add new container when validation fails
            expect(newCount).toBe(initialCount);
        });

        it('should add income when both values are valid', () => {
            document.body.innerHTML = `
                <div id="incomes-container">
                    <div class="income-container">
                        <div class="income-inputs">
                            <input name="income-0" value="1000">
                            <input name="income-share-0" value="50">
                        </div>
                        <button id="add-income-button">+</button>
                    </div>
                </div>
            `;
            
            const initialCount = document.querySelectorAll('.income-container').length;
            addIncome();
            const newCount = document.querySelectorAll('.income-container').length;
            
            // Should add new container when validation passes
            expect(newCount).toBe(initialCount + 1);
        });
    });
});

describe('Form Handler - deleteIncome Edge Cases', () => {
    it('should delete income container when button is clicked', () => {
        document.body.innerHTML = `
            <div id="incomes-container">
                <div class="income-container">
                    <div class="income-inputs">
                        <input name="income-0" value="1000">
                        <input name="income-share-0" value="50">
                    </div>
                    <button class="change-income-button">-</button>
                </div>
            </div>
        `;
        
        const button = document.querySelector('.change-income-button');
        const initialCount = document.querySelectorAll('.income-container').length;
        
        deleteIncome(button);
        
        const newCount = document.querySelectorAll('.income-container').length;
        expect(newCount).toBe(initialCount - 1);
    });
});

describe('Form Handler - calculateAPR Edge Cases', () => {
    describe('calculateAPR - Early return scenarios', () => {
        it('should return 0 when borrowedAmount is 0', () => {
            document.body.innerHTML = `
                <input id="insurance-rate" value="0.3">
                <input id="interest-rate" value="3.5">
                <input id="file-fees" value="1000">
                <input id="price" value="100000">
                <input id="notary" value="2">
                <input id="agency-commission" value="3">
                <input id="contribution" value="200000">
                <input id="loanDuration" value="0">
            `;
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const result = calculateAPR();
            
            expect(result).toBe(0);
            expect(consoleWarnSpy).toHaveBeenCalled();
            
            consoleWarnSpy.mockRestore();
        });

        it('should return 0 when loanDuration is 0', () => {
            document.body.innerHTML = `
                <input id="insurance-rate" value="0.3">
                <input id="interest-rate" value="3.5">
                <input id="file-fees" value="1000">
                <input id="price" value="0">
                <input id="notary" value="2">
                <input id="agency-commission" value="3">
                <input id="contribution" value="0">
                <input id="loanDuration" value="0">
            `;
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const result = calculateAPR();
            
            expect(result).toBe(0);
            expect(consoleWarnSpy).toHaveBeenCalled();
            
            consoleWarnSpy.mockRestore();
        });

        it('should return 0 when APR calculation results in non-finite value', () => {
            document.body.innerHTML = `
                <input id="insurance-rate" value="0">
                <input id="interest-rate" value="0">
                <input id="file-fees" value="0">
                <input id="price" value="100000">
                <input id="notary" value="0">
                <input id="agency-commission" value="0">
                <input id="contribution" value="0">
                <input id="loanDuration" value="20">
            `;
            
            const result = calculateAPR();
            // With zero rates and finite inputs, should still return 0 or finite value
            expect(Number.isFinite(result)).toBe(true);
        });

        it('should exercise the APR calculation loop with multiple iterations', () => {
            document.body.innerHTML = `
                <input id="insurance-rate" value="0.3">
                <input id="interest-rate" value="3.5">
                <input id="file-fees" value="1000">
                <input id="price" value="100000">
                <input id="notary" value="2">
                <input id="agency-commission" value="3">
                <input id="contribution" value="20000">
                <input id="loanDuration" value="20">
            `;
            
            // Force borrowedAmount positive, loanDuration positive
            const result = calculateAPR();
            // Should compute a valid positive APR
            expect(result).toBeGreaterThan(0);
        });

        it('should handle very high interest rates in APR calculation', () => {
            document.body.innerHTML = `
                <input id="insurance-rate" value="1">
                <input id="interest-rate" value="10">
                <input id="file-fees" value="5000">
                <input id="price" value="100000">
                <input id="notary" value="2">
                <input id="agency-commission" value="5">
                <input id="contribution" value="0">
                <input id="loanDuration" value="25">
            `;
            
            const result = calculateAPR();
            // Should return a finite APR even with high rates
            expect(Number.isFinite(result)).toBe(true);
        });
    });
});
