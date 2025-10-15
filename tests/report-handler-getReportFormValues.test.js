/**
 * @jest-environment jsdom
 */
import { getReportFormValues } from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('getReportFormValues', () => {
    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });

    beforeEach(() => {
        // Reset form values to defaults before each test
        document.getElementById('price').value = '300000';
        document.getElementById('notary').value = '8';
        document.getElementById('appreciation-rate').value = '2';
        document.getElementById('agency-commission').value = '0';
        document.getElementById('contribution').value = '0';
        document.getElementById('interest-rate').value = '1';
        document.getElementById('loanDuration').value = '20';
        document.getElementById('insurance-rate').value = '0';
        document.getElementById('fictitiousRent').value = '1000';
        document.getElementById('buyHousingTax').value = '0';
        document.getElementById('rentingHousingTax').value = '0';
        document.getElementById('propertyTax').value = '1000';
        document.getElementById('fictitiousRentRate').value = '1';
        document.getElementById('coOwnership').value = '0';
        document.getElementById('file-fees').value = '0';
    });

    test('returns correct form values with default inputs', () => {
        const result = getReportFormValues();
        expect(result.price).toBe(300000);
        expect(result.notary).toBe(0.08); // 8% as a decimal
        expect(result.appreciationRate).toBe(0.02); // 2% as a decimal
        expect(result.agencyCommission).toBe(0); // 0% as a decimal
        expect(result.contribution).toBe(0);
        expect(result.interestRate).toBe(0.01); // 1% as a decimal
        expect(result.loanDuration).toBe(20);
        expect(result.insuranceRate).toBe(0); // 0% as a decimal
        expect(result.fictitiousRent).toBe(1000);
        expect(result.buyHousingTax).toBe(0);
        expect(result.rentingHousingTax).toBe(0);
        expect(result.propertyTax).toBe(1000);
        expect(result.fictitiousRentRate).toBe(0.01); // 1% as a decimal
        expect(result.coOwnershipFees).toBe(0);
        expect(result.fileFees).toBe(0);
        expect(result.maxDuration).toBe(200); // Hardcoded value
    });

    test('handles empty values by returning NaN', () => {
        document.getElementById('price').value = '';
        document.getElementById('notary').value = '';
        document.getElementById('contribution').value = '';
        const result = getReportFormValues();
        expect(isNaN(result.price)).toBe(true);
        expect(isNaN(result.notary)).toBe(true);
        expect(isNaN(result.contribution)).toBe(true);
    });

    test('handles non-numeric values by returning NaN', () => {
        document.getElementById('price').value = 'abc';
        document.getElementById('notary').value = 'xyz';
        document.getElementById('contribution').value = '!@#';
        const result = getReportFormValues();
        expect(isNaN(result.price)).toBe(true);
        expect(isNaN(result.notary)).toBe(true);
        expect(isNaN(result.contribution)).toBe(true);
    });

    test('correctly parses fractional values', () => {
        document.getElementById('notary').value = '2.5';
        document.getElementById('appreciation-rate').value = '1.5';
        document.getElementById('agency-commission').value = '3.5';
        document.getElementById('interest-rate').value = '3.5';
        document.getElementById('fictitiousRentRate').value = '2.5';
        const result = getReportFormValues();
        expect(result.notary).toBe(0.025); // 2.5% as a decimal
        expect(result.appreciationRate).toBe(0.015); // 1.5% as a decimal
        expect(result.agencyCommission).toBe(0.035); // 3.5% as a decimal
        expect(result.interestRate).toBe(0.035); // 3.5% as a decimal
        expect(result.fictitiousRentRate).toBe(0.025); // 2.5% as a decimal
    });

    test('correctly parses zero values', () => {
        document.getElementById('price').value = '0';
        document.getElementById('notary').value = '0';
        document.getElementById('contribution').value = '0';
        document.getElementById('interest-rate').value = '0';
        document.getElementById('loanDuration').value = '0';
        document.getElementById('fictitiousRent').value = '0';
        document.getElementById('propertyTax').value = '0';
        const result = getReportFormValues();
        expect(result.price).toBe(0);
        expect(result.notary).toBe(0);
        expect(result.contribution).toBe(0);
        expect(result.interestRate).toBe(0);
        expect(result.loanDuration).toBe(0);
        expect(result.fictitiousRent).toBe(0);
        expect(result.propertyTax).toBe(0);
    });

    test('correctly parses large values', () => {
        document.getElementById('price').value = '1000000000';
        document.getElementById('contribution').value = '500000000';
        document.getElementById('fictitiousRent').value = '100000';
        const result = getReportFormValues();
        expect(result.price).toBe(1000000000);
        expect(result.contribution).toBe(500000000);
        expect(result.fictitiousRent).toBe(100000);
    });

    test('always returns maxDuration as 200', () => {
        const result = getReportFormValues();
        expect(result.maxDuration).toBe(200);
    });
});
