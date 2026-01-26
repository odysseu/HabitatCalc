// Test file for updateSummary function
import { updateSummary } from '../js/report-handler.js';

// Mock DOM elements
document.body.innerHTML = `
  <div id="repaymentYearDisplay"></div>
  <div id="cumulativePurchaseDisplay"></div>
  <div id="yearlyAverageDisplay"></div>
  <div id="monthlyAverageDisplay"></div>
`;

describe('updateSummary', () => {
  test('updates the summary section with repayment year and cumulative purchase losses', () => {
    const repaymentYear = 5;
    const cumulativePurchase = 150000;

    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('5');
    expect(document.getElementById('cumulativePurchaseDisplay').innerHTML).toBe('<strong>150000&nbsp;€</strong>');
  });

  test('handles zero values correctly', () => {
    const repaymentYear = 0;
    const cumulativePurchase = 0;

    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('0');
    expect(document.getElementById('cumulativePurchaseDisplay').innerHTML).toBe('<strong>0&nbsp;€</strong>');
  });

  test('updates the summary section with the repayment year and cumulative purchase losses', () => {
    const repaymentYear = 10;
    const cumulativePurchase = 150000;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('10');
    expect(document.getElementById('cumulativePurchaseDisplay').innerHTML).toBe('<strong>150000&nbsp;€</strong>');
  });

  test('handles zero values for cumulative purchase', () => {
    const repaymentYear = 5;
    const cumulativePurchase = 0;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('repaymentYearDisplay').textContent).toBe('5');
    expect(document.getElementById('cumulativePurchaseDisplay').innerHTML).toBe('<strong>0&nbsp;€</strong>');
  });
  test('calculates yearly average expense correctly', () => {
    const repaymentYear = 10;
    const cumulativePurchase = 150000;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('yearlyAverageDisplay').innerHTML).toContain('<strong>15000&nbsp;€</strong>');
  });

  test('calculates monthly average expense correctly', () => {
    const repaymentYear = 10;
    const cumulativePurchase = 120000;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('monthlyAverageDisplay').innerHTML).toContain('<strong>1000&nbsp;€</strong>');
  });

  test('handles zero repayment year gracefully', () => {
    const repaymentYear = 0;
    const cumulativePurchase = 50000;
    updateSummary(repaymentYear, cumulativePurchase);

    expect(document.getElementById('yearlyAverageDisplay').innerHTML).toContain('<strong>0&nbsp;€</strong>');
    expect(document.getElementById('monthlyAverageDisplay').innerHTML).toContain('<strong>0&nbsp;€</strong>');
  });
});
