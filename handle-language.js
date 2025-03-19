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
        const apportLabel = document.querySelector('label[for="apport"]');
        const calculerButton = document.getElementById('calculer-button');
        const closeButton = document.getElementById('close-welcome');
        const commissionLabel = document.querySelector('label[for="commission"]');
        const coproprieteLabel = document.querySelector('label[for="copropriete"]');
        const dureeLocation0 = document.getElementById('duree-location-0');
        const dureePretLabel = document.querySelector('label[for="duree-pret"]');
        const fraisDossierLabel = document.querySelector('label[for="frais-dossier"]');
        const logoHelp = document.querySelector('.logo-help');
        const loyer0 = document.getElementById('loyer-0');
        const loyerFictifLabel = document.querySelector('label[for="loyer-fictif"]');
        const notaireLabel = document.querySelector('label[for="notaire"]');
        const pdfFileNameLabel = document.querySelector('label[for="pdf-filename"]');
        const pdfFileNamePlaceHolder = document.getElementById('placerholder["pdf-filename"]');
        const prixLabel = document.querySelector('label[for="prix"]');
        const sectionAchat = document.getElementById('section-achat');
        const sectionEmprunt = document.getElementById('section-emprunt');
        const sectionFinancement = document.getElementById('section-financement');
        const sectionTitre = document.getElementById('section-titre');
        const taxeFonciereLabel = document.querySelector('label[for="taxe-fonciere"]');
        const taxeHabitationLabel = document.querySelector('label[for="taxe-habitation"]');
        const telechargerButton = document.querySelector('#telecharger-button button');
        const title = document.getElementById('titre');
        const tauxAppreciationLabel = document.querySelector('label[for="taux-appreciation"]');
        const tauxAssuranceLabel = document.querySelector('label[for="taux-assurance"]');
        const tauxInteretLabel = document.querySelector('label[for="taux-interet"]');
        const tauxLoyerFictifLabel = document.querySelector('label[for="taux-loyer-fictif"]');
        const welcomeMessage = document.getElementById('welcome-message');

        if (apportLabel) apportLabel.innerHTML = `${translations.apport} <span class="help-icon">? <span class="help-text">${translations.helpApport}</span></span>`;
        if (calculerButton) calculerButton.textContent = translations.generateReport;
        if (closeButton) closeButton.textContent = translations.closeButton;
        if (commissionLabel) commissionLabel.innerHTML = `${translations.commission} <span class="help-icon">? <span class="help-text">${translations.helpCommission}</span></span>`;
        if (coproprieteLabel) coproprieteLabel.innerHTML = `${translations.copropriete} <span class="help-icon">? <span class="help-text">${translations.helpCopropriete}</span></span>`;
        if (dureeLocation0) dureeLocation0.placeholder = translations.helpDureeLocation;
        if (dureePretLabel) dureePretLabel.innerHTML = `${translations.dureePret} <span class="help-icon">? <span class="help-text">${translations.helpDureePret}</span></span>`;
        if (fraisDossierLabel) fraisDossierLabel.innerHTML = `${translations.fraisDossier} <span class="help-icon">? <span class="help-text">${translations.helpFraisDossier}</span></span>`;
        if (logoHelp) logoHelp.textContent = translations.resetFormHelp;
        if (loyer0) loyer0.placeholder = translations.helpLoyerMensuel;
        if (loyerFictifLabel) loyerFictifLabel.innerHTML = `${translations.loyerFictif} <span class="help-icon">? <span class="help-text">${translations.helpLoyerFictif}</span></span>`;
        if (notaireLabel) notaireLabel.innerHTML = `${translations.notaire} <span class="help-icon">? <span class="help-text">${translations.helpNotaire}</span></span>`;
        if (pdfFileNameLabel) pdfFileNameLabel.textContent = translations.pdfFileName;
        if (pdfFileNamePlaceHolder) pdfFileNamePlaceHolder.placeholder = translations.pdfFileNamePlaceHolder;
        if (prixLabel) prixLabel.innerHTML = `${translations.prix} <span class="help-icon">? <span class="help-text">${translations.helpPrix}</span></span>`;
        if (sectionAchat) sectionAchat.textContent = translations.sectionAchat;
        if (sectionEmprunt) sectionEmprunt.textContent = translations.sectionEmprunt;
        if (sectionFinancement) sectionFinancement.textContent = translations.sectionFinancement;
        if (sectionTitre) sectionTitre.textContent = translations.sectionTitle;
        if (tauxAppreciationLabel) tauxAppreciationLabel.innerHTML = `${translations.tauxAppreciation} <span class="help-icon">? <span class="help-text">${translations.helpTauxAppreciation}</span></span>`;
        if (tauxAssuranceLabel) tauxAssuranceLabel.innerHTML = `${translations.tauxAssurance} <span class="help-icon">? <span class="help-text">${translations.helpTauxAssurance}</span></span>`;
        if (tauxInteretLabel) tauxInteretLabel.innerHTML = `${translations.tauxInteret} <span class="help-icon">? <span class="help-text">${translations.helpTauxInteret}</span></span>`;
        if (tauxLoyerFictifLabel) tauxLoyerFictifLabel.innerHTML = `${translations.tauxLoyerFictif} <span class="help-icon">? <span class="help-text">${translations.helpTauxLoyerFictif}</span></span>`;
        if (taxeFonciereLabel) taxeFonciereLabel.innerHTML = `${translations.taxeFonciere} <span class="help-icon">? <span class="help-text">${translations.helpTaxeFonciere}</span></span>`;
        if (taxeHabitationLabel) taxeHabitationLabel.innerHTML = `${translations.taxeHabitation} <span class="help-icon">? <span class="help-text">${translations.helpTaxeHabitation}</span></span>`;
        if (telechargerButton) telechargerButton.textContent = translations.downloadPDF;
        if (title) title.textContent = translations.title;
        if (welcomeMessage) welcomeMessage.querySelector('p').innerHTML = translations.welcomeMessage;
    }
}
