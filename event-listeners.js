// description: This script handles the event listeners for the form and other UI interactions.

// Import functions from form-handler.js if using modules
import { addIncome, calculateAPR, resetForm } from './form-handler.js';
import { generateReport } from './report-handler.js';
import { loadTranslations, updateContent, updateAPRLabel } from './handle-language.js';

document.addEventListener('DOMContentLoaded', function () {
    const selectedLanguage = document.getElementById('language-select').value;
    const translations = loadTranslations(selectedLanguage);
    document.getElementById('insuranceRate').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('interest-rate').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('file-fees').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('price').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('notary').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('agency-commission').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('contribution').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('loanDuration').addEventListener('input', updateAPRLabel(calculateAPR, translations));
    document.getElementById('home-logo').addEventListener('click', resetForm);
    document.getElementById('calculate-button').addEventListener('click', generateReport);
    document.getElementById('add-income-button').addEventListener('click', addIncome);

    const closeButton = document.getElementById('close-welcome');
    closeButton.addEventListener('click', function() {
        welcomeMessage.style.display = 'none';
    });

    const languageSelect = document.getElementById('language-select');
    // // Detect browser language
    // const browserLanguage = (navigator.language || navigator.userLanguage).slice(0, 2);
    // console.log('Browser language detected:', browserLanguage);
    // // Match browser language with available options in the select element
    // const availableLanguages = Array.from(languageSelect.options).map(option => option.value);
    // const defaultLanguage = availableLanguages.includes(browserLanguage) ? browserLanguage : 'fr'; // Fallback to 'fr' if not found
    // // Set the languageSelect value to the detected language
    // languageSelect.value = defaultLanguage;
    // // Load translations for the detected language
    // // window.translations = loadTranslations(defaultLanguage);

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = document.getElementById('language-select').value;
        const translations = loadTranslations(selectedLanguage);
        updateContent(translations);
        updateAPRLabel(APR, translations);
    });

    // Initial call to set the language based on the default selection
    // console.log('Language used :', defaultLanguage);
    // calculateAPR(document);

    const welcomeMessage = document.getElementById('welcome-message');
    document.addEventListener('click', function(event) {
        if (!welcomeMessage.contains(event.target) && event.target !== closeButton) {
            welcomeMessage.style.display = 'none';
        }
    });

    document.getElementById('calculate-button').addEventListener('click', generateReport);
});


