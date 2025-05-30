// description: This script handles the event listeners for the form and other UI interactions.

// Import functions from form-handler.js if using modules
import { addIncome, calculateAPR, resetForm } from './form-handler.js';
import { generateReport } from './report-handler.js';
import { loadTranslations, updateContent, updateAPRLabel } from './handle-language.js';

document.addEventListener('DOMContentLoaded', async function () {
    const selectedLanguage = document.getElementById('language-select');
    const translations = await loadTranslations(selectedLanguage.value);

    document.getElementById('insuranceRate').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('interest-rate').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('file-fees').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('price').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('notary').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('agency-commission').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('contribution').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('loanDuration').addEventListener('input', async function() {
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, translations);
    });
    document.getElementById('home-logo').addEventListener('click', resetForm);
    document.getElementById('calculate-button').addEventListener('click', generateReport);
    document.getElementById('add-income-button').addEventListener('click', addIncome);

    const closeButton = document.getElementById('close-welcome');
    closeButton.addEventListener('click', function() {
        welcomeMessage.style.display = 'none';
    });

    selectedLanguage.addEventListener('change', async function() {
        const selectedLanguage = document.getElementById('language-select').value;
        const translations = await loadTranslations(selectedLanguage);
        updateContent(translations);
    });

    // Initial call to set the language based on the default selection
    // console.log('Language used :', defaultLanguage);
    // calculateAPR();

    const welcomeMessage = document.getElementById('welcome-message');
    document.addEventListener('click', function(event) {
        if (!welcomeMessage.contains(event.target) && event.target !== closeButton) {
            welcomeMessage.style.display = 'none';
        }
    });

    document.getElementById('calculate-button').addEventListener('click', generateReport);
});


const selectedLanguage = document.getElementById('language-select');
const translations = await loadTranslations(selectedLanguage.value);
const aprValue = calculateAPR();
await updateAPRLabel(aprValue, translations);


