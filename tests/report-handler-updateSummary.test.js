// Test file for updateSummary function
import { updateSummary } from '../js/report-handler.js';

// Mock DOM elements
document.body.innerHTML = `
  <div id="repaymentYearDisplay"></div>
  <div id="cumulativePurchaseDisplay"></div>
`;

describe('updateSummary', () => {
  test('updates the summary section with repayment year and cumulative purchase losses', () => {
    const repaymentYear = 5;
    const cumulativePurchase = 150000;

    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('5');
    expect(document.getElementById('cumulativePurchaseDisplay').textContent).toBe('150000 €');
  });

  test('handles zero values correctly', () => {
    const repaymentYear = 0;
    const cumulativePurchase = 0;

    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('0');
    expect(document.getElementById('cumulativePurchaseDisplay').textContent).toBe('0 €');
  });

  test('updates the summary section with the repayment year and cumulative purchase losses', () => {
    const repaymentYear = 10;
    const cumulativePurchase = 150000;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('10');
    expect(document.getElementById('cumulativePurchaseDisplay').textContent).toBe('150000 €');
  });

  test('handles zero values for cumulative purchase', () => {
    const repaymentYear = 5;
    const cumulativePurchase = 0;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('5');
    expect(document.getElementById('cumulativePurchaseDisplay').textContent).toBe('0 €');
  });
  
});
