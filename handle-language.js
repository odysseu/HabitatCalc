// Description: This script handles the language selection and translation of the web page content.
// It loads the appropriate translation file based on the selected language and updates the content accordingly.
// It also manages the welcome message display and the close button functionality.
// It uses the Fetch API to load translation files in JSON format and updates the DOM elements with the translated text.
let translations = {};

document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    const languageSelect = document.getElementById('language-select');

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
    const defaultLanguage = languageSelect.value;
    console.log('Detected language :', defaultLanguage);
    loadTranslations(defaultLanguage);
    calculateTAEG();

    document.getElementById('calculate-button').addEventListener('click', generateReport);
});

function loadTranslations(language) {
    fetch(`translations/${language}.json`)
        .then(response => response.json())
        .then(data => {
            translations = data;
            updateContent(translations);
        })
        .catch(error => console.error('Error loading translations:', error));
}

function updateContent(translations) {
    if (translations) {
        const contributionLabel = document.querySelector('label[for="contribution"]');
        const calculerButton = document.getElementById('calculate-button');
        const closeButton = document.getElementById('close-welcome');
        const commissionLabel = document.querySelector('label[for="commission"]');
        const coOwnershipLabel = document.querySelector('label[for="coOwnership"]');
        const incomeShare0 = document.getElementById('income-share-0');
        const laonDurationLabel = document.querySelector('label[for="laonDuration"]');
        const fileFeesLabel = document.querySelector('label[for="file-fees"]');
        const logoHelp = document.querySelector('.logo-help');
        const income0 = document.getElementById('income-0');
        const fictitiousRentLabel = document.querySelector('label[for="fictitiousRent"]');
        const notaryLabel = document.querySelector('label[for="notary"]');
        const pdfFileNameLabel = document.querySelector('label[for="pdf-filename"]');
        const pdfFileNamePlaceHolder = document.getElementById('placerholder["pdf-filename"]');
        const priceLabel = document.querySelector('label[for="price"]');
        const sectionAchat = document.getElementById('buy-section');
        const sectionEmprunt = document.getElementById('loan-section');
        const sectionFinancement = document.getElementById('financing-section');
        const sectionTitre = document.getElementById('title-section');
        const taeg = document.getElementById('taeg-overlay');
        const propertyTaxLabel = document.querySelector('label[for="propertyTax"]');
        const HousingTaxLabel = document.querySelector('label[for="HousingTax"]');
        const telechargerButton = document.querySelector('#telecharger-button button');
        const title = document.getElementById('titre');
        const appreciationRateLabel = document.querySelector('label[for="appreciation-rate"]');
        const insuranceRateLabel = document.querySelector('label[for="insuranceRate"]');
        const interestRateLabel = document.querySelector('label[for="interest-rate"]');
        const fictitiousRentRateLabel = document.querySelector('label[for="fictitiousRentRate"]');
        const welcomeMessage = document.getElementById('welcome-message');

        if (contributionLabel) contributionLabel.innerHTML = `${translations.contribution} <span class="help-icon">? <span class="help-text">${translations.helpContribution}</span></span>`;
        if (calculerButton) calculerButton.textContent = translations.generateReport;
        if (closeButton) closeButton.textContent = translations.closeButton;
        if (commissionLabel) commissionLabel.innerHTML = `${translations.commission} <span class="help-icon">? <span class="help-text">${translations.helpCommission}</span></span>`;
        if (coOwnershipLabel) coOwnershipLabel.innerHTML = `${translations.coOwnership} <span class="help-icon">? <span class="help-text">${translations.helpCoOwnership}</span></span>`;
        if (incomeShare0) incomeShare0.placeholder = translations.helpIncomeShare;
        if (laonDurationLabel) laonDurationLabel.innerHTML = `${translations.laonDuration} <span class="help-icon">? <span class="help-text">${translations.helpDureePret}</span></span>`;
        if (fileFeesLabel) fileFeesLabel.innerHTML = `${translations.fileFees} <span class="help-icon">? <span class="help-text">${translations.helpFileFees}</span></span>`;
        if (logoHelp) logoHelp.textContent = translations.resetFormHelp;
        if (income0) income0.placeholder = translations.helpMonthlyIncome;
        if (fictitiousRentLabel) fictitiousRentLabel.innerHTML = `${translations.fictitiousRent} <span class="help-icon">? <span class="help-text">${translations.helpFictitiousRent}</span></span>`;
        if (notaryLabel) notaryLabel.innerHTML = `${translations.notary} <span class="help-icon">? <span class="help-text">${translations.helpNotary}</span></span>`;
        if (pdfFileNameLabel) pdfFileNameLabel.textContent = translations.pdfFileName;
        if (pdfFileNamePlaceHolder) pdfFileNamePlaceHolder.placeholder = translations.pdfFileNamePlaceHolder;
        if (priceLabel) priceLabel.innerHTML = `${translations.price} <span class="help-icon">? <span class="help-text">${translations.helpPrice}</span></span>`;
        if (sectionAchat) sectionAchat.textContent = translations.sectionAchat;
        if (sectionEmprunt) sectionEmprunt.textContent = translations.sectionEmprunt;
        if (sectionFinancement) sectionFinancement.textContent = translations.sectionFinancement;
        if (sectionTitre) sectionTitre.textContent = translations.sectionTitle;
        if (taeg) calculateTAEG(); //taeg.textContent = `${translations.reportTAEG}: `;
        if (appreciationRateLabel) appreciationRateLabel.innerHTML = `${translations.appreciationRate} <span class="help-icon">? <span class="help-text">${translations.helpAppreciationRate}</span></span>`;
        if (insuranceRateLabel) insuranceRateLabel.innerHTML = `${translations.insuranceRate} <span class="help-icon">? <span class="help-text">${translations.helpInsuranceRate}</span></span>`;
        if (interestRateLabel) interestRateLabel.innerHTML = `${translations.interestRate} <span class="help-icon">? <span class="help-text">${translations.helpInterestRate}</span></span>`;
        if (fictitiousRentRateLabel) fictitiousRentRateLabel.innerHTML = `${translations.fictitiousRentRate} <span class="help-icon">? <span class="help-text">${translations.helpFictitiousRentRate}</span></span>`;
        if (propertyTaxLabel) propertyTaxLabel.innerHTML = `${translations.propertyTax} <span class="help-icon">? <span class="help-text">${translations.helpPropertyTax}</span></span>`;
        if (HousingTaxLabel) HousingTaxLabel.innerHTML = `${translations.HousingTax} <span class="help-icon">? <span class="help-text">${translations.helpHousingTax}</span></span>`;
        if (telechargerButton) telechargerButton.textContent = translations.downloadPDF;
        if (title) title.textContent = translations.title;
        if (welcomeMessage) welcomeMessage.querySelector('p').innerHTML = translations.welcomeMessage;
    }
}
