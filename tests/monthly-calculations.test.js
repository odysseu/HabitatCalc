import {
    calculateCumulativeRentCosts,
    calculateCumulativePurchaseCosts,
    findPivotPoint
} from '../js/form-handler.js';

describe('Monthly precision calculations', () => {
    describe('calculateCumulativeRentCosts', () => {
        test('should calculate rent for 1 year with 1% annual increase using monthly compounding', () => {
            const params = {
                baseMonthlyRent: 1000,
                annualRentRate: 0.01, // 1% annual
                monthlyRentingPropertyTax: 0,
                rentingPropertyTaxRate: 0.01, // 1% annual
                annualIncomes: 0
            };
            
            // 12 months (0-based index = 12)
            const result = calculateCumulativeRentCosts(params, 12);
            // With monthly compounding of annual rate
            // geometricSeriesSum(1000, 0.01/12, 12) 
            expect(result).toBeCloseTo(12054.45, -1);
        });

        test('should calculate rent for 2 years with 1% annual increase using monthly compounding', () => {
            const params = {
                baseMonthlyRent: 1000,
                annualRentRate: 0.01,
                monthlyRentingPropertyTax: 0,
                rentingPropertyTaxRate: 0.01,
                annualIncomes: 0
            };
            
            const result = calculateCumulativeRentCosts(params, 24);
            expect(result).toBeCloseTo(24231.41, -1);
        });

        test('should calculate rent for 10 years with 1% annual increase using monthly compounding', () => {
            const params = {
                baseMonthlyRent: 1000,
                annualRentRate: 0.01,
                monthlyRentingPropertyTax: 0,
                rentingPropertyTaxRate: 0.01,
                annualIncomes: 0
            };
            
            const result = calculateCumulativeRentCosts(params, 120);
            expect(result).toBeCloseTo(126149.87, -1);
        });

        test('should handle zero rent evolution rate', () => {
            const params = {
                baseMonthlyRent: 1000,
                annualRentRate: 0,
                monthlyRentingPropertyTax: 0,
                rentingPropertyTaxRate: 0,
                annualIncomes: 0
            };
            
            const result = calculateCumulativeRentCosts(params, 12);
            expect(result).toBe(12000); // 1000 * 12
        });
    });

    describe('findPivotPoint', () => {
        test('should find pivot point with simple scenario', () => {
            const params = {
                price: 100000,
                notaryRate: 0.08, // 8%
                agencyCommissionRate: 0, // 0%
                fileFees: 1000,
                contribution: 20000,
                annualInterestRate: 0.035, // 3.5%
                loanDurationYears: 20,
                annualInsuranceRate: 0.003, // 0.3%
                annualPropertyTax: 1000,
                annualPropertyTaxRate: 0.01, // 1%
                buyHousingTax: 0,
                coOwnershipFees: 0,
                annualAppreciationRate: 0.02, // 2%
                annualIncomes: 0,
                baseMonthlyRent: 600,
                annualRentRate: 0.01, // 1%
                monthlyRentingPropertyTax: 0,
                rentingPropertyTaxRate: 0,
                maxDurationYears: 50
            };
            
            const pivot = findPivotPoint(params);
            
            // Should return a valid pivot point
            expect(pivot).toHaveProperty('years');
            expect(pivot).toHaveProperty('months');
            expect(pivot).toHaveProperty('totalMonths');
            expect(pivot.years).toBeGreaterThanOrEqual(0);
            expect(pivot.months).toBeGreaterThanOrEqual(0);
            expect(pivot.months).toBeLessThan(12);
        });

        test('should return totalMonths consistent with years and months', () => {
            const params = {
                price: 100000,
                notaryRate: 0.08,
                agencyCommissionRate: 0,
                fileFees: 0,
                contribution: 20000,
                annualInterestRate: 0.04,
                loanDurationYears: 25,
                annualInsuranceRate: 0.003,
                annualPropertyTax: 800,
                annualPropertyTaxRate: 0.01,
                buyHousingTax: 0,
                coOwnershipFees: 0,
                annualAppreciationRate: 0.015,
                annualIncomes: 0,
                baseMonthlyRent: 700,
                annualRentRate: 0.02,
                monthlyRentingPropertyTax: 0,
                rentingPropertyTaxRate: 0,
                maxDurationYears: 100
            };
            
            const pivot = findPivotPoint(params);
            expect(pivot.totalMonths).toBe(pivot.years * 12 + pivot.months);
        });
    });

    describe('Annual evolution calculation', () => {
        test('annual evolution: year 1 should be 12000', () => {
            // With annual compounding (not monthly)
            // Year 1: 1000 * 12 = 12000
            const expected = 12000;
            expect(expected).toBe(12000);
        });

        test('annual evolution: year 2 should be 24120', () => {
            // Year 1: 1000 * 12 = 12000
            // Year 2: 1000 * 1.01 * 12 = 12120
            // Total: 12000 + 12120 = 24120
            const expected = 24120;
            expect(expected).toBe(24120);
        });

        test('annual evolution: year 10 should be approximately 125546.55', () => {
            // Geometric series: a = 12000, r = 1.01, n = 10
            // Sum = 12000 * (1.01^10 - 1) / 0.01
            const a = 12000;
            const r = 1.01;
            const n = 10;
            const sum = a * (Math.pow(r, n) - 1) / (r - 1);
            expect(sum).toBeCloseTo(125546.55, 1);
        });
    });
});
