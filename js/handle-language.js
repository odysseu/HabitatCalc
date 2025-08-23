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
        // console.log('Updating content with translations:', translations);
        const contributionLabel = document.querySelector('label[for="contribution"]');
        const calculateButton = document.getElementById('calculate-button');
        const closeButton = document.getElementById('close-welcome');
        const agencyCommisionFeesLabel = document.querySelector('label[for="agency-commission"]');
        const coOwnershipLabel = document.querySelector('label[for="coOwnership"]');
        const incomeShare0 = document.getElementById('income-share-0');
        const loanDurationLabel = document.querySelector('label[for="loanDuration"]');
        const fileFeesLabel = document.querySelector('label[for="file-fees"]');
        const resetLogoHelp = document.querySelector('.logo-help');
        const logoHelp = document.querySelector('.github-logo-help');
        const income0 = document.getElementById('income-0');
        const fictitiousRentLabel = document.querySelector('label[for="fictitiousRent"]');
        const notaryLabel = document.querySelector('label[for="notary"]');
        const pdfFileNameLabel = document.querySelector('label[for="pdf-filename"]');
        const pdfFileNamePlaceHolder =  document.getElementById("pdf-filename");
        const priceLabel = document.querySelector('label[for="price"]');
        const purchaseSection = document.getElementById('purchase-section');
        const loanSection = document.getElementById('loan-section');
        const rentingSection = document.getElementById('renting-section');
        const incomesSection = document.getElementById('incomes-section');
        const sectionTitle = document.getElementById('title-section');
        const apr = document.getElementById('apr-overlay');
        const propertyTaxLabel = document.querySelector('label[for="propertyTax"]');
        const buyHousingTaxLabel = document.querySelector('label[for="buyHousingTax"]');
        const rentingHousingTaxLabel = document.querySelector('label[for="rentingHousingTax"]');
        const downloadButton = document.querySelector('#download-button button');
        const title = document.getElementById('title');
        const appreciationRateLabel = document.querySelector('label[for="appreciation-rate"]');
        const insuranceRateLabel = document.querySelector('label[for="insurance-rate"]');
        const interestRateLabel = document.querySelector('label[for="interest-rate"]');
        const fictitiousRentRateLabel = document.querySelector('label[for="fictitiousRentRate"]');
        const welcomeMessage = document.getElementById('welcome-message');

        if (contributionLabel) contributionLabel.innerHTML = `${translations.contribution} <span class="help-icon">? <span class="help-text">${translations.helpContribution}</span></span>`;
        if (calculateButton) calculateButton.textContent = translations.generateReport;
        if (closeButton) closeButton.textContent = translations.closeButton;
        if (agencyCommisionFeesLabel) agencyCommisionFeesLabel.innerHTML = `${translations.agencyCommission} <span class="help-icon">? <span class="help-text">${translations.helpAgencyCommission}</span></span>`;
        if (coOwnershipLabel) coOwnershipLabel.innerHTML = `${translations.coOwnership} <span class="help-icon">? <span class="help-text">${translations.helpCoOwnership}</span></span>`;
        if (incomeShare0) incomeShare0.placeholder = translations.helpIncomeShare;
        if (loanDurationLabel) loanDurationLabel.innerHTML = `${translations.loanDuration} <span class="help-icon">? <span class="help-text">${translations.helpLoanDuration}</span></span>`;
        if (fileFeesLabel) fileFeesLabel.innerHTML = `${translations.fileFees} <span class="help-icon">? <span class="help-text">${translations.helpFileFees}</span></span>`;
        if (resetLogoHelp) resetLogoHelp.textContent = translations.resetFormHelp;
        if (logoHelp) logoHelp.textContent = translations.resetFormHelp;
        if (income0) income0.placeholder = translations.helpMonthlyIncome;
        if (fictitiousRentLabel) fictitiousRentLabel.innerHTML = `${translations.fictitiousRent} <span class="help-icon">? <span class="help-text">${translations.helpFictitiousRent}</span></span>`;
        if (notaryLabel) notaryLabel.innerHTML = `${translations.notary} <span class="help-icon">? <span class="help-text">${translations.helpNotary}</span></span>`;
        if (pdfFileNameLabel) pdfFileNameLabel.textContent = translations.pdfFileName;
        if (pdfFileNamePlaceHolder) pdfFileNamePlaceHolder.placeholder = translations.pdfFileNamePlaceHolder;
        if (priceLabel) priceLabel.innerHTML = `${translations.price} <span class="help-icon">? <span class="help-text">${translations.helpPrice}</span></span>`;
        if (purchaseSection) purchaseSection.textContent = translations.purchaseSection;
        if (loanSection) loanSection.textContent = translations.loanSection;
        if (incomesSection) incomesSection.textContent = translations.incomesSection;
        if (rentingSection) rentingSection.textContent = translations.rentingSection;
        if (sectionTitle) sectionTitle.textContent = translations.sectionTitle;
        if (apr) {
            // console.log("calculating APR inside updateContent");
            const aprValue = calculateAPR(); //apr.textContent = `${translations.reportAPR}: `;
            updateAPRLabel(aprValue, translations);
        }
        if (appreciationRateLabel) appreciationRateLabel.innerHTML = `${translations.appreciationRate} <span class="help-icon">? <span class="help-text">${translations.helpAppreciationRate}</span></span>`;
        if (insuranceRateLabel) insuranceRateLabel.innerHTML = `${translations.insuranceRate} <span class="help-icon">? <span class="help-text">${translations.helpInsuranceRate}</span></span>`;
        if (interestRateLabel) interestRateLabel.innerHTML = `${translations.interestRate} <span class="help-icon">? <span class="help-text">${translations.helpInterestRate}</span></span>`;
        if (fictitiousRentRateLabel) fictitiousRentRateLabel.innerHTML = `${translations.fictitiousRentRate} <span class="help-icon">? <span class="help-text">${translations.helpFictitiousRentRate}</span></span>`;
        if (propertyTaxLabel) propertyTaxLabel.innerHTML = `${translations.propertyTax} <span class="help-icon">? <span class="help-text">${translations.helpPropertyTax}</span></span>`;
        if (buyHousingTaxLabel) buyHousingTaxLabel.innerHTML = `${translations.buyHousingTax} <span class="help-icon">? <span class="help-text">${translations.helpBuyHousingTax}</span></span>`;
        if (rentingHousingTaxLabel) rentingHousingTaxLabel.innerHTML = `${translations.rentingHousingTax} <span class="help-icon">? <span class="help-text">${translations.helpRentingHousingTax}</span></span>`;
        if (downloadButton) downloadButton.textContent = translations.downloadPDF;
        if (title) title.textContent = translations.title;
        if (welcomeMessage) welcomeMessage.querySelector('p').innerHTML = translations.welcomeMessage;
    }
    else  {
        console.warn('Translations are not available or invalid.');
    }
}
