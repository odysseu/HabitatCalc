/**
 * @jest-environment jsdom
 */

// Test file for getReportFormValues function
import { getReportFormValues } from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// // Mock DOM elements
// document.body.innerHTML = `
//   <input type="number" id="price" value="300000">
//   <input type="number" id="notary" value="2">
//   <input type="number" id="appreciation-rate" value="1.5">
//   <input type="number" id="agency-commission" value="3">
//   <input type="number" id="contribution" value="60000">
//   <input type="number" id="interest-rate" value="3.5">
//   <input type="number" id="loanDuration" value="20">
//   <input type="number" id="insurance-rate" value="0.3">
//   <input type="number" id="fictitiousRent" value="1000">
//   <input type="number" id="buyHousingTax" value="500">
//   <input type="number" id="rentingHousingTax" value="300">
//   <input type="number" id="propertyTax" value="800">
//   <input type="number" id="fictitiousRentRate" value="2">
//   <input type="number" id="coOwnership" value="1500">
//   <input type="number" id="file-fees" value="1000">
// `;

describe('getReportFormValues', () => {
    beforeAll(() => {
        // Load the index.html file
        const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });
    test('returns correct form values', () => {
        const result = getReportFormValues();

        expect(result.price).toBe(300000);
        expect(result.notary).toBe(0.08);
        expect(result.appreciationRate).toBe(0.02);
        expect(result.agencyCommission).toBe(0);
        expect(result.contribution).toBe(0);
        expect(result.interestRate).toBe(0.01);
        expect(result.loanDuration).toBe(20);
        expect(result.insuranceRate).toBe(0);
        expect(result.fictitiousRent).toBe(1000);
        expect(result.buyHousingTax).toBe(0);
        expect(result.rentingHousingTax).toBe(0);
        expect(result.propertyTax).toBe(1000);
        expect(result.fictitiousRentRate).toBe(0.01);
        expect(result.coOwnershipFees).toBe(0);
        expect(result.fileFees).toBe(0);
        expect(result.maxDuration).toBe(200);
    });

    test('handles empty values by returning 0 or NaN', () => {
        document.getElementById('price').value = '';
        document.getElementById('notary').value = '';
        document.getElementById('contribution').value = '';

        const result = getReportFormValues();

        expect(isNaN(result.price)).toBe(true);
        expect(isNaN(result.notary)).toBe(true);
        expect(isNaN(result.contribution)).toBe(true);
    });
});
