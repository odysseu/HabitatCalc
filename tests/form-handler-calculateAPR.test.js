/**
 * @jest-environment jsdom
 */
import { calculateAPR } from '../js/form-handler';
import { readFileSync } from 'fs';
import { resolve } from 'path';
describe('calculateAPR', () => {
  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  beforeEach(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  it('should calculate default APR', () => {
    const apr = calculateAPR();
    expect(apr).toBeGreaterThan(0);
    expect(apr).toBeCloseTo(1.0, 0.01);
  });

  it('calculateAPR calculates the APR correctly', () => {
    document.getElementById('insurance-rate').value = '1';
    document.getElementById('interest-rate').value = '2';
    document.getElementById('file-fees').value = '1000';
    document.getElementById('price').value = '200000';
    document.getElementById('notary').value = '8';
    document.getElementById('agency-commission').value = '5';
    document.getElementById('contribution').value = '50000';
    document.getElementById('loanDuration').value = '20';
    const apr = calculateAPR();
    expect(apr).toBeGreaterThan(0);
    expect(apr).toBeCloseTo(3.68, 2);
  });

  it('should return 0 for invalid borrowed amount', () => {
    document.getElementById('price').value = '0';
    document.getElementById('contribution').value = '0';
    document.getElementById('file-fees').value = '0';
    const apr = calculateAPR();
    expect(apr).toBe(0);
  });

  it('should return 0 for invalid loan duration', () => {
    document.getElementById('price').value = '200000';
    document.getElementById('contribution').value = '50000';
    document.getElementById('loanDuration').value = '0';
    const apr = calculateAPR();
    expect(apr).toBe(0);
  });

});
