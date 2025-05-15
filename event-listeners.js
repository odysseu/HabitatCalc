// description: This script handles the event listeners for the form and other UI interactions.

// Import functions from form-handler.js if using modules
import { addIncome, calculateAPR, resetForm } from './form-handler.js';
import { generateReport } from './report-handler.js';
import { loadTranslations } from './handle-language.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('insuranceRate').addEventListener('input', calculateAPR);
    document.getElementById('interest-rate').addEventListener('input', calculateAPR);
    document.getElementById('file-fees').addEventListener('input', calculateAPR);
    document.getElementById('price').addEventListener('input', calculateAPR);
    document.getElementById('notary').addEventListener('input', calculateAPR);
    document.getElementById('agency-commission').addEventListener('input', calculateAPR);
    document.getElementById('contribution').addEventListener('input', calculateAPR);
    document.getElementById('loanDuration').addEventListener('input', calculateAPR);
    document.getElementById('home-logo').addEventListener('click', resetForm);
    document.getElementById('calculate-button').addEventListener('click', generateReport);
    document.getElementById('add-income-button').addEventListener('click', addIncome);

    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    const languageSelect = document.getElementById('language-select');

    // Detect browser language
    const browserLanguage = (navigator.language || navigator.userLanguage).slice(0, 2);
    console.log('Browser language detected:', browserLanguage);

    // Match browser language with available options in the select element
    const availableLanguages = Array.from(languageSelect.options).map(option => option.value);
    const defaultLanguage = availableLanguages.includes(browserLanguage) ? browserLanguage : 'fr'; // Fallback to 'fr' if not found

    // Set the languageSelect value to the detected language
    languageSelect.value = defaultLanguage;

    // Load translations for the detected language
    window.translations = loadTranslations(defaultLanguage);

    closeButton.addEventListener('click', function() {
        welcomeMessage.style.display = 'none';
    });

    document.addEventListener('click', function(event) {
        if (!welcomeMessage.contains(event.target) && event.target !== closeButton) {
            welcomeMessage.style.display = 'none';
        }
    });

    languageSelect.addEventListener('change', function() {
        const selectedLanguage = languageSelect.value;
        loadTranslations(selectedLanguage);
    });

    // Initial call to set the language based on the default selection
    console.log('Language used :', defaultLanguage);
    calculateAPR(document);

    document.getElementById('calculate-button').addEventListener('click', generateReport);
});


