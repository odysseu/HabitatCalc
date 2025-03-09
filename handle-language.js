document.addEventListener('DOMContentLoaded', function() {
    const welcomeMessage = document.getElementById('welcome-message');
    const closeButton = document.getElementById('close-welcome');
    const languageSelect = document.getElementById('language-select');
    console.log('Detected language :', languageSelect.value);

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
    loadTranslations(defaultLanguage);

    document.getElementById('calculer-button').addEventListener('click', genererRapport);
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
        const welcomeMessage = document.getElementById('welcome-message');
        const closeButton = document.getElementById('close-welcome');
        const title = document.getElementById('titre');
        const sectionTitre = document.getElementById('section-titre');
        const sectionAchat = document.getElementById('section-achat');
        const sectionEmprunt = document.getElementById('section-emprunt');
        const sectionFinancement = document.getElementById('section-financement');
        const coproprieteLabel = document.querySelector('label[for="copropriete"]');
        const prixLabel = document.querySelector('label[for="prix"]');
        const notaireLabel = document.querySelector('label[for="notaire"]');
        const tauxAppreciationLabel = document.querySelector('label[for="taux-appreciation"]');
        const commissionLabel = document.querySelector('label[for="commission"]');
        const apportLabel = document.querySelector('label[for="apport"]');
        const tauxInteretLabel = document.querySelector('label[for="taux-interet"]');
        const dureePretLabel = document.querySelector('label[for="duree-pret"]');
        const tauxAssuranceLabel = document.querySelector('label[for="taux-assurance"]');
        const loyerFictifLabel = document.querySelector('label[for="loyer-fictif"]');
        const tauxLoyerFictifLabel = document.querySelector('label[for="taux-loyer-fictif"]');
        const taxeHabitationLabel = document.querySelector('label[for="taxe-habitation"]');
        const taxeFonciereLabel = document.querySelector('label[for="taxe-fonciere"]');
        const calculerButton = document.getElementById('calculer-button');
        const pdfFileNameLabel = document.querySelector('label[for="pdf-filename"]');
        const pdfFileNamePlaceHolder = document.getElementById('placerholder["pdf-filename"]');
        const telechargerButton = document.querySelector('#telecharger-button button');
        const loyer0 = document.getElementById('loyer-0');
        const dureeLocation0 = document.getElementById('duree-location-0');

        if (welcomeMessage) welcomeMessage.querySelector('p').innerHTML = translations.welcomeMessage;
        if (closeButton) closeButton.textContent = translations.closeButton;
        if (sectionTitre) sectionTitre.textContent = translations.sectionTitle;
        if (title) title.textContent = translations.title;
        if (sectionAchat) sectionAchat.textContent = translations.sectionAchat;
        if (sectionEmprunt) sectionEmprunt.textContent = translations.sectionEmprunt;
        if (sectionFinancement) sectionFinancement.textContent = translations.sectionFinancement;
        if (coproprieteLabel) coproprieteLabel.innerHTML = `${translations.copropriete} <span class="help-icon">? <span class="help-text">${translations.helpCopropriete}</span></span>`;
        if (prixLabel) prixLabel.innerHTML = `${translations.prix} <span class="help-icon">? <span class="help-text">${translations.helpPrix}</span></span>`;
        if (notaireLabel) notaireLabel.innerHTML = `${translations.notaire} <span class="help-icon">? <span class="help-text">${translations.helpNotaire}</span></span>`;
        if (tauxAppreciationLabel) tauxAppreciationLabel.innerHTML = `${translations.tauxAppreciation} <span class="help-icon">? <span class="help-text">${translations.helpTauxAppreciation}</span></span>`;
        if (commissionLabel) commissionLabel.innerHTML = `${translations.commission} <span class="help-icon">? <span class="help-text">${translations.helpCommission}</span></span>`;
        if (apportLabel) apportLabel.innerHTML = `${translations.apport} <span class="help-icon">? <span class="help-text">${translations.helpApport}</span></span>`;
        if (tauxInteretLabel) tauxInteretLabel.innerHTML = `${translations.tauxInteret} <span class="help-icon">? <span class="help-text">${translations.helpTauxInteret}</span></span>`;
        if (dureePretLabel) dureePretLabel.innerHTML = `${translations.dureePret} <span class="help-icon">? <span class="help-text">${translations.helpDureePret}</span></span>`;
        if (tauxAssuranceLabel) tauxAssuranceLabel.innerHTML = `${translations.tauxAssurance} <span class="help-icon">? <span class="help-text">${translations.helpTauxAssurance}</span></span>`;
        if (loyerFictifLabel) loyerFictifLabel.innerHTML = `${translations.loyerFictif} <span class="help-icon">? <span class="help-text">${translations.helpLoyerFictif}</span></span>`;
        if (tauxLoyerFictifLabel) tauxLoyerFictifLabel.innerHTML = `${translations.tauxLoyerFictif} <span class="help-icon">? <span class="help-text">${translations.helpTauxLoyerFictif}</span></span>`;
        if (taxeHabitationLabel) taxeHabitationLabel.innerHTML = `${translations.taxeHabitation} <span class="help-icon">? <span class="help-text">${translations.helpTaxeHabitation}</span></span>`;
        if (taxeFonciereLabel) taxeFonciereLabel.innerHTML = `${translations.taxeFonciere} <span class="help-icon">? <span class="help-text">${translations.helpTaxeFonciere}</span></span>`;
        if (calculerButton) calculerButton.textContent = translations.generateReport;
        if (pdfFileNameLabel) pdfFileNameLabel.textContent = translations.pdfFileName;
        if (pdfFileNamePlaceHolder) pdfFileNamePlaceHolder.placeholder = translations.pdfFileNamePlaceHolder;
        if (telechargerButton) telechargerButton.textContent = translations.downloadPDF;
        if (loyer0) loyer0.placeholder = translations.helpLoyerMensuel;
        if (dureeLocation0) dureeLocation0.placeholder = translations.helpDureeLocation;
    }
}
