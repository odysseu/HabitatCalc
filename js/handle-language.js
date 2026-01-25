// Description: This script handles the language selection and translation of the web page content.
// It loads the appropriate translation file based on the selected language and updates the content accordingly.
// It also manages the welcome message display and the close button functionality.
// It uses the Fetch API to load translation files in JSON format and updates the DOM elements with the translated text.

import { calculateAPR } from './form-handler.js';

export async function initiateLanguageSelection() {
    const languageSelect = document.getElementById('language-select');
    // Detect browser language
    const browserLanguage = (navigator.language || navigator.userLanguage).slice(0, 2);
    // console.log('Browser language detected:', browserLanguage);
    // Match browser language with available options in the select element
    const availableLanguages = Array.from(languageSelect.options).map(option => option.value);
    const defaultLanguage = availableLanguages.includes(browserLanguage) ? browserLanguage : 'en'; // Fallback to 'en' if not found
    // Set the languageSelect value to the detected language
    languageSelect.value = defaultLanguage;
    // Load translations for the detected language
    const translations = await loadTranslations(defaultLanguage);
    updateContent(translations);
    // console.log('Language used :', defaultLanguage);
}

export async function loadTranslations(language) {
    try {
        const response = await fetch(`translations/${language}.json`);
        const translations = await response.json();
        // updateContent(translations);
        // console.log('Translations loaded:', translations);
        return translations;
    } catch (error) {
        console.warn('Error loading translations:', error);
        return null;
    }
}

/**
 * Generic function to update all elements with data-i18n attributes
 */
function updateElementsWithDataI18n(translations) {
    if (!translations) return;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            // Check if element has data-i18n-html attribute to use innerHTML instead of textContent
            if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translations[key];
            } else {
                element.textContent = translations[key];
            }
        }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            element.placeholder = translations[key];
        }
    });

    // Update all elements with data-i18n-help attribute (for help text in tooltips)
    document.querySelectorAll('[data-i18n-help]').forEach((element) => {
        const key = element.getAttribute('data-i18n-help');
        const labelKey = element.getAttribute('data-i18n');
        if (translations[key] && translations[labelKey]) {
            element.innerHTML = `${translations[labelKey]} <span class="help-icon">? <span class="help-text">${translations[key]}</span></span>`;
        }
    });

    // Update APR overlay
    const aprElement = document.getElementById('apr-overlay');
    if (aprElement && translations.APR) {
        const aprValue = aprElement.textContent.match(/[\d.]+/)?.[0] || '0.00';
        aprElement.textContent = `${translations.APR}: ${aprValue}%`;
    }
}

export async function updateAPRLabel(apr, translations) {
    const aprElement = document.getElementById('apr-overlay');
    let aprLabel, aprValue;

    if (!aprElement) {
        console.warn('APR element not found.');
        return;
    }

    // Handle apr value
    if (typeof apr !== 'number' || isNaN(apr)) {
        aprValue = '??.??';
    } else {
        aprValue = apr.toFixed(2);
    }

    // Handle translations and APR label
    if (translations) {
        if (!translations.APR) {
            translations.APR = 'APR_IDIOT_LABEL';
        }
        aprLabel = translations.APR;
    } else {
        aprLabel = 'APR_IDIOT_TRANSLATION';
    }

    aprElement.textContent = `${aprLabel}: ${aprValue}%`;
}

export async function updateContent(translations) {
    if (translations) {
        // Use the generic data-i18n approach
        updateElementsWithDataI18n(translations);

        // Handle APR calculation separately as it needs to preserve the value
        const aprElement = document.getElementById('apr-overlay');
        if (aprElement) {
            const aprValue = calculateAPR();
            updateAPRLabel(aprValue, translations);
        }
    } else {
        console.warn('Translations are not available or invalid.');
    }
}
