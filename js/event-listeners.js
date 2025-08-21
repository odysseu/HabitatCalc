// description: This script handles the event listeners for the form and other UI interactions.

import { addIncome, calculateAPR, resetForm } from './form-handler.js';
import { generateReport } from './report-handler.js';
import { loadTranslations, updateContent, updateAPRLabel } from './handle-language.js';

document.querySelectorAll('.form-section-toggle').forEach(header => {
    header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        content.classList.toggle('collapsed');
    });
});

generateReport();

document.addEventListener('DOMContentLoaded', async function () {
    const selectedLanguageElement = document.getElementById('language-select');
    const translations = await loadTranslations(selectedLanguageElement.value);

    // Initial APR calculation on load
    const initialAPR = calculateAPR();
    await updateAPRLabel(initialAPR, translations);

    // Update APR label when relevant fields change
    const aprInputs = [
        'insurance-rate',
        'interest-rate',
        'file-fees',
        'price',
        'notary',
        'agency-commission',
        'contribution',
        'loanDuration'
    ];

    aprInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', async () => {
                const aprValue = calculateAPR();
                await updateAPRLabel(aprValue, translations);
            });
        }
    });

    // Trigger generateReport on any change in the form
    const form = document.getElementById('form-calculator');
    form.addEventListener('change', async () => {
        await generateReport();
    });

    // Trigger generateReport when the theme changes
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('change', async () => {
        await generateReport();
    });

    // Logo resets form
    document.getElementById('home-logo').addEventListener('click', resetForm);

    // Manual trigger button
    document.getElementById('calculate-button').addEventListener('click', generateReport);

    // Add income field
    document.getElementById('add-income-button').addEventListener('click', addIncome);

    // Welcome message close
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    closeButton.addEventListener('click', function () {
        welcomeMessage.style.display = 'none';
    });

    document.addEventListener('click', function (event) {
        if (!welcomeMessage.contains(event.target) && event.target !== closeButton) {
            welcomeMessage.style.display = 'none';
        }
    });

    // Language change
    selectedLanguageElement.addEventListener('change', async function () {
        const lang = selectedLanguageElement.value;
        const newTranslations = await loadTranslations(lang);
        updateContent(newTranslations);

        // Recalculate APR with new language
        const aprValue = calculateAPR();
        await updateAPRLabel(aprValue, newTranslations);
    });
});
