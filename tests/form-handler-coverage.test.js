/**
 * @jest-environment jsdom
 */

import { calculateMonthlyPayment, calculateBorrowedAmount } from '../js/form-handler.js';

describe('Form Handler Coverage Tests', () => {
    describe('calculateMonthlyPayment', () => {
        it('should return 0 when loanDuration is 0', () => {
            const result = calculateMonthlyPayment(200000, 0, 0.035, 0.003);
            expect(result).toBe(0);
        });

        it('should return 0 when borrowedAmount is 0', () => {
            const result = calculateMonthlyPayment(0, 15, 0.035, 0.003);
            expect(result).toBe(0);
        });

        it('should handle edge case with very small duration', () => {
            const result = calculateMonthlyPayment(100000, 1, 0.01, 0.001);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle edge case with zero rates', () => {
            const result = calculateMonthlyPayment(100000, 10, 0, 0);
            expect(result).toBeGreaterThan(0);
        });

        it('should handle large borrowed amount', () => {
            const result = calculateMonthlyPayment(10000000, 30, 0.05, 0.01);
            expect(result).toBeGreaterThan(0);
            expect(Number.isFinite(result)).toBe(true);
        });
    });

    describe('calculateBorrowedAmount', () => {
        it('should handle zero price', () => {
            const result = calculateBorrowedAmount(0, 0.02, 0.03, 1000, 10000);
            expect(result.borrowedAmount).toBe(0);
            expect(result.notaryFees).toBe(0);
            expect(result.commissionFees).toBe(0);
        });

        it('should use Math.max to prevent negative borrowedAmount', () => {
            // contribution exceeds purchase total
            const result = calculateBorrowedAmount(100000, 0.02, 0.03, 1000, 200000);
            expect(result.borrowedAmount).toBe(0);
        });

        it('should handle negative contribution', () => {
            const result = calculateBorrowedAmount(200000, 0.02, 0.03, 1000, -5000);
            expect(result.borrowedAmount).toBeGreaterThan(200000);
        });

        it('should handle all zero parameters', () => {
            const result = calculateBorrowedAmount(0, 0, 0, 0, 0);
            expect(result.borrowedAmount).toBe(0);
            expect(result.notaryFees).toBe(0);
            expect(result.commissionFees).toBe(0);
        });

        it('should calculate with standard values', () => {
            const result = calculateBorrowedAmount(300000, 0.02, 0.03, 1000, 60000);
            expect(result.notaryFees).toBe(6000);
            expect(result.commissionFees).toBe(9000);
            expect(result.borrowedAmount).toBe(300000 + 6000 + 9000 + 1000 - 60000);
        });
    });
});
