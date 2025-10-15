/**
 * @jest-environment jsdom
 */

// This is a Jest test file for the addIncome function in form-handler.js
import { calculateMonthlyPayment } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';


describe('calculateAPR', () => {
  let container, incomeInput, durationInput;
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  it('should calculate monthly payment correctly', () => {
    const monthlyPayment = calculateMonthlyPayment(200000, 20, 0.01, 0.002);
    expect(monthlyPayment).toBeGreaterThan(0);
    expect(monthlyPayment).toBeCloseTo(953, 0); // Adjust expected value based on your calculation logic
  });


  describe('calculate basic Monthly Payment', () => {
    test('calculates the correct monthly payment for a loan', () => {
      const borrowedAmount = 200000;
      const loanDuration = 20;
      const interestRate = 0;
      const insuranceRate = 0;
      const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
      expect(monthlyPayment).toBe(200000 / (20 * 12));
    });
  });

  describe('calculate dumb Monthly Payment', () => {
    test('calculates the correct monthly payment for a loan', () => {
      const borrowedAmount = 0;
      const loanDuration = 20;
      const interestRate = 0.05;
      const insuranceRate = 0.04;
      const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
      expect(monthlyPayment).toBe(0);
    });
  });

  describe('calculate dumbest Monthly Payment', () => {
    test('calculates the correct monthly payment for a loan', () => {
      const borrowedAmount = 0;
      const loanDuration = 0;
      const interestRate = 0.05;
      const insuranceRate = 0.01;
      const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
      expect(monthlyPayment).toBe(0);
    });
  });

  describe('calculate dumbest Monthly Payment', () => {
    test('calculates the correct monthly payment for a loan', () => {
      const borrowedAmount = 100000;
      const loanDuration = 0;
      const interestRate = 0.05;
      const insuranceRate = 0.01;
      const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
      expect(monthlyPayment).toBe(0);
    });
  });

});
