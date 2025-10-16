/**
 * @jest-environment jsdom
 */
import { createCollapsibleResultsSection } from '../js/report-handler.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('createCollapsibleResultsSection', () => {
  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
  });

  test('creates a collapsible results section', () => {
    const section = createCollapsibleResultsSection('Test Section', [
      { label: 'Label 1', value: 'Value 1' },
      { label: 'Label 2', value: 'Value 2' },
    ]);
    expect(section.className).toBe('results-section');
    expect(section.querySelector('.results-section-toggle').textContent).toBe('Test Section');
    expect(section.querySelectorAll('tr').length).toBe(2);
  });
});
