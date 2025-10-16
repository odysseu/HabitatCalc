/**
 * @jest-environment jsdom
 */
import { forceLightMode, restoreMode } from '../js/dark-mode';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Dark Mode Functionality', () => {
  let toggleSwitch, homeLogo, favicon, githubLogo;

  beforeAll(() => {
    // Load the index.html file
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = html;
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
  });

  beforeEach(() => {
    // Reset DOM and mocks
    toggleSwitch = document.getElementById('dark-mode-toggle');
    homeLogo = document.getElementById('home-logo');
    favicon = document.getElementById('favicon');
    githubLogo = document.getElementById('github-logo');
    document.body.classList.remove('dark-mode');
    toggleSwitch.checked = false;
    jest.clearAllMocks();
  });

  // Helper function to simulate DOMContentLoaded
  const triggerDOMContentLoaded = () => {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  };

  it('should initialize dark mode if "dark-mode" is stored in localStorage', () => {
    Storage.prototype.getItem.mockReturnValue('dark-mode');
    triggerDOMContentLoaded();
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(toggleSwitch.checked).toBe(true);
    expect(homeLogo.src).toContain('home-logo-dark-v3.png');
    expect(favicon.href).toContain('favicon-dark-v3.ico');
    expect(githubLogo.src).toContain('github-logo-dark.png');
  });

  it('should initialize light mode if "light-mode" is stored in localStorage', () => {
    Storage.prototype.getItem.mockReturnValue('light-mode');
    triggerDOMContentLoaded();
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(toggleSwitch.checked).toBe(false);
    expect(homeLogo.src).toContain('home-logo-light-v3.png');
    expect(favicon.href).toContain('favicon-light-v3.ico');
    expect(githubLogo.src).toContain('github-logo-light.png');
  });

  it('should initialize light mode by default if no theme is stored', () => {
    Storage.prototype.getItem.mockReturnValue(null);
    triggerDOMContentLoaded();
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(toggleSwitch.checked).toBe(false);
  });

  it('should toggle to dark mode when the switch is checked', () => {
    Storage.prototype.getItem.mockReturnValue(null);
    triggerDOMContentLoaded();
    toggleSwitch.checked = true;
    toggleSwitch.dispatchEvent(new Event('change'));
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark-mode');
    expect(homeLogo.src).toContain('home-logo-dark-v3.png');
    expect(favicon.href).toContain('favicon-dark-v3.ico');
    expect(githubLogo.src).toContain('github-logo-dark.png');
  });

  it('should toggle to light mode when the switch is unchecked', () => {
    Storage.prototype.getItem.mockReturnValue('dark-mode');
    triggerDOMContentLoaded();
    toggleSwitch.checked = false;
    toggleSwitch.dispatchEvent(new Event('change'));
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light-mode');
    expect(homeLogo.src).toContain('home-logo-light-v3.png');
    expect(favicon.href).toContain('favicon-light-v3.ico');
    expect(githubLogo.src).toContain('github-logo-light.png');
  });

  it('should force light mode and return the previous state', () => {
    document.body.classList.add('dark-mode');
    const wasDarkMode = forceLightMode();
    expect(wasDarkMode).toBe(true);
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  it('should restore dark mode if it was previously active', () => {
    forceLightMode(); // Ensure light mode is forced
    restoreMode(true);
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  it('should not restore dark mode if it was not previously active', () => {
    forceLightMode(); // Ensure light mode is forced
    restoreMode(false);
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });
});
