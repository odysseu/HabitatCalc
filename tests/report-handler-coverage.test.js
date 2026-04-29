/**
 * @jest-environment jsdom
 */

import { calculatePurchaseTotals, updateSummary } from '../js/report-handler.js';

describe('Report Handler Coverage Tests', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Create elements for summary
        const repaymentYearDisplay = document.createElement('div');
        repaymentYearDisplay.id = 'repaymentYearDisplay';
        document.body.appendChild(repaymentYearDisplay);

        const cumulativePurchaseDisplay = document.createElement('div');
        cumulativePurchaseDisplay.id = 'cumulativePurchaseDisplay';
        document.body.appendChild(cumulativePurchaseDisplay);

        const yearlyAverageDisplay = document.createElement('div');
        yearlyAverageDisplay.id = 'yearlyAverageDisplay';
        document.body.appendChild(yearlyAverageDisplay);

        const monthlyAverageDisplay = document.createElement('div');
        monthlyAverageDisplay.id = 'monthlyAverageDisplay';
        document.body.appendChild(monthlyAverageDisplay);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('calculatePurchaseTotals', () => {
        it('should calculate with zero price', () => {
            const result = calculatePurchaseTotals(0, 0.02, 0.03, 1000, 10000);
            expect(result.purchaseTotal).toBe(1000);
            expect(result.borrowedAmount).toBe(-9000);
        });

        it('should calculate with zero contribution', () => {
            const result = calculatePurchaseTotals(200000, 0.02, 0.03, 1000, 0);
            expect(result.purchaseTotal).toBe(200000 + 4000 + 6000 + 1000);
            expect(result.borrowedAmount).toBe(200000 + 4000 + 6000 + 1000);
        });

        it('should calculate with all zeros', () => {
            const result = calculatePurchaseTotals(0, 0, 0, 0, 0);
            expect(result.notaryFees).toBe(0);
            expect(result.agencyCommissionFees).toBe(0);
            expect(result.purchaseTotal).toBe(0);
            expect(result.borrowedAmount).toBe(0);
        });

        it('should calculate with large values', () => {
            const result = calculatePurchaseTotals(1000000, 0.05, 0.08, 5000, 200000);
            expect(result.notaryFees).toBe(50000);
            expect(result.agencyCommissionFees).toBe(80000);
            expect(result.purchaseTotal).toBe(1135000);
            expect(result.borrowedAmount).toBe(935000);
        });

        it('should calculate with decimal percentages', () => {
            const result = calculatePurchaseTotals(100000, 0.015, 0.025, 1000, 20000);
            expect(result.notaryFees).toBe(1500);
            expect(result.agencyCommissionFees).toBe(2500);
            expect(result.purchaseTotal).toBe(100000 + 1500 + 2500 + 1000);
            expect(result.borrowedAmount).toBe(100000 + 1500 + 2500 + 1000 - 20000);
        });
    });

    describe('updateSummary', () => {
        it('should handle NaN cumulativePurchase gracefully', () => {
            const repaymentYear = 5;
            const cumulativePurchase = NaN;

            // Should not throw
            expect(() => updateSummary(repaymentYear, cumulativePurchase)).not.toThrow();
            expect(document.getElementById('repaymentYearDisplay').textContent).toBe('5');
        });

        it('should handle zero values', () => {
            const repaymentYear = 0;
            const cumulativePurchase = 0;

            updateSummary(repaymentYear, cumulativePurchase);

            expect(document.getElementById('repaymentYearDisplay').textContent).toBe('0');
            expect(document.getElementById('cumulativePurchaseDisplay').innerHTML).toContain('0');
            expect(document.getElementById('yearlyAverageDisplay').innerHTML).toContain('0');
            expect(document.getElementById('monthlyAverageDisplay').innerHTML).toContain('0');
        });

        it('should calculate averages correctly', () => {
            const repaymentYear = 10;
            const cumulativePurchase = 120000;

            updateSummary(repaymentYear, cumulativePurchase);

            // Yearly average = 120000 / 10 = 12000
            expect(document.getElementById('yearlyAverageDisplay').innerHTML).toContain('12000');
            // Monthly average = 12000 / 12 = 1000
            expect(document.getElementById('monthlyAverageDisplay').innerHTML).toContain('1000');
        });

        it('should handle infinite values gracefully', () => {
            const repaymentYear = 5;
            const cumulativePurchase = Infinity;

            // Should not throw
            expect(() => updateSummary(repaymentYear, cumulativePurchase)).not.toThrow();
        });
    });
});
