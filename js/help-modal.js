/**
 * Help Modal - Manages the help icon and modal functionality
 * Supports language switching via the translation system
 */

import { loadTranslations } from './handle-language.js';

let helpModal = null;
let helpModalOverlay = null;
let helpModalCloseButton = null;
const helpIcon = document.getElementById('help-icon-button');
const languageSelect = document.getElementById('language-select');

/**
 * Triggers MathJax to re-render formulas
 */
function renderMath() {
    if (window.MathJax) {
        MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
    }
}

/**
 * Loads the help modal content from an external HTML file
 */
async function loadHelpModal() {
    try {
        const response = await fetch('help-content.html');
        const html = await response.text();
        
        // Create a temporary container to parse the HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Append the modal to the body
        document.body.appendChild(temp.firstElementChild);
        
        // Get references to the modal elements
        helpModal = document.getElementById('help-modal');
        helpModalOverlay = document.querySelector('.help-modal-overlay');
        helpModalCloseButton = document.getElementById('help-modal-close');
        
        // Add event listeners
        helpIcon.addEventListener('click', openHelpModal);
        helpModalCloseButton.addEventListener('click', closeHelpModal);
        helpModalOverlay.addEventListener('click', closeHelpModal);
        
        // Close modal when pressing Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && helpModal.classList.contains('active')) {
                closeHelpModal();
            }
        });

        // Listen to language changes
        languageSelect.addEventListener('change', async (event) => {
            const language = event.target.value;
            await updateHelpModalTranslations(language);
        });

        // Initial translation update
        const initialLanguage = languageSelect.value || 'fr';
        await updateHelpModalTranslations(initialLanguage);

        // Render math formulas
        renderMath();
    } catch (error) {
        console.error('Error loading help modal:', error);
    }
}

/**
 * Updates help modal translations based on selected language
 */
async function updateHelpModalTranslations(language) {
    const translations = await loadTranslations(language);
    if (translations && helpModal) {
        const translatableElements = helpModal.querySelectorAll('[data-i18n]');
        translatableElements.forEach((element) => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        // Re-render math after translation
        renderMath();
    }
}

/**
 * Opens the help modal
 */
function openHelpModal() {
    if (helpModal) {
        helpModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Render math when modal opens (in case it needs refresh)
        renderMath();
    }
}

/**
 * Closes the help modal
 */
function closeHelpModal() {
    if (helpModal) {
        helpModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Load the help modal when the DOM is ready
document.addEventListener('DOMContentLoaded', loadHelpModal);

export { openHelpModal, closeHelpModal };
