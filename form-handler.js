// description: This script handles the form submission, validation, and calculation of TAEG and other financial metrics.
function resetForm() {
    document.getElementById('calculette-form').reset();
    document.getElementById('resultat').innerHTML = '';
    const canvas = document.getElementById('myChart');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const languageSelect = document.getElementById('language-select');
    loadTranslations(languageSelect.value);
}

document.getElementById('taux-assurance').addEventListener('input', calculateTAEG);
document.getElementById('taux-interet').addEventListener('input', calculateTAEG);
document.getElementById('frais-dossier').addEventListener('input', calculateTAEG);
document.getElementById('price').addEventListener('input', calculateTAEG);
document.getElementById('notary').addEventListener('input', calculateTAEG);
document.getElementById('agency-commission').addEventListener('input', calculateTAEG);
document.getElementById('apport').addEventListener('input', calculateTAEG);
document.getElementById('duree-pret').addEventListener('input', calculateTAEG);

function calculateTAEG() {
    // Récupération des valeurs du formulaire
    const tauxAssurance = parseFloat(document.getElementById('taux-assurance').value) / 100 || 0;
    const tauxInteret = parseFloat(document.getElementById('taux-interet').value) / 100 || 0;
    const fraisDossier = parseFloat(document.getElementById('frais-dossier').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const notary = parseFloat(document.getElementById('notary').value) / 100 || 0;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100 || 0;
    const apport = parseFloat(document.getElementById('apport').value) || 0;
    const dureePret = parseFloat(document.getElementById('duree-pret').value) || 0;
    // Calcul des frais et du montant emprunté
    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const montantEmprunte = price + notaryFees + agencyCommissionFees + fraisDossier - apport;
    // Initialisation du TAEG
    let taeg = 0;
    // Calcul du TAEG si le montant emprunté est valide
    if (montantEmprunte > 0) {
        const mensualitePretAssurance = calculerMensualite(montantEmprunte, dureePret, tauxInteret, tauxAssurance);
        const coutEmprunt = (mensualitePretAssurance * dureePret * 12) - montantEmprunte;
        taeg = coutEmprunt / montantEmprunte * 100;
    } else if (montantEmprunte < 0) {
        console.error('Montant emprunté négatif:', montantEmprunte);
    }
    // Mise à jour de l'affichage avec les traductions
    const taegElement = document.getElementById('taeg-overlay');
    if (taegElement && typeof translations !== 'undefined' && translations && translations.reportTAEG) {
        taegElement.textContent = `${translations.TAEG}: ${taeg.toFixed(2)}%`;
    }
    return taeg;
}

function ajouterLoyer() {
    let loyerCount = document.querySelectorAll('.loyer-container').length;
    const container = document.getElementById('loyers-container');
    // Get values from the first fields
    const currentLoyerValue = container.querySelector('input[name="loyer-0"]').value.trim();
    const currentDurationValue = container.querySelector('input[name="duree-location-0"]').value.trim();

    let newLoyer;
    try {
        if (isValidNumber(currentLoyerValue) && isValidNumber(currentDurationValue)) {
            // If both are valid numbers, create the new inputs
            newLoyer = document.createElement('div');
            newLoyer.className = 'loyer-container';
            const inputLoyer = document.createElement('input');
            inputLoyer.type = 'number';
            inputLoyer.id = `loyer-${loyerCount}`;
            inputLoyer.name = `loyer-${loyerCount}`;
            inputLoyer.value = currentLoyerValue;
            inputLoyer.placeholder = 'Loyer mensuel (€)';
            inputLoyer.required = true;

            const inputDuree = document.createElement('input');
            inputDuree.type = 'number';
            inputDuree.step = '0.01';
            inputDuree.id = `duree-location-${loyerCount}`;
            inputDuree.name = `duree-location-${loyerCount}`;
            inputDuree.value = currentDurationValue;
            inputDuree.placeholder = 'Durée (% de l\'année)';
            inputDuree.required = true;

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.textContent = '-';
            deleteButton.onclick = function() { supprimerLoyer(this); };

            newLoyer.appendChild(inputLoyer);
            newLoyer.appendChild(inputDuree);
            newLoyer.appendChild(deleteButton);
            container.appendChild(newLoyer);
            loyerCount++;
        } else {
            console.log("Invalid input detected:", {
                loyer: currentLoyerValue,
                duration: currentDurationValue
            });
        }
    } catch (error) {
        console.log("Error validating input:", error);
    }
    
    // Reset the fields to ensure next inputs will be added in the form
    container.querySelector('input[name="loyer-0"]').value = "";
    container.querySelector('input[name="duree-location-0"]').value = "";
    
}

function isValidNumber(value) {
    try {
        return !isNaN(parseFloat(value)) && isFinite(value) && value.trim() !== "";
    } catch (error) {
        console.error("Error checking if value is a valid number:", { value, error });
        return false;
    }
}

function supprimerLoyer(button) {
    const container = document.getElementById('loyers-container');
    container.removeChild(button.parentElement);
}

function extraireLoyers() {
    let cumulLoyers = 0;
    const loyersContainer = document.getElementById('loyers-container');
    const loyerContainers = loyersContainer.querySelectorAll('.loyer-container');

    if (loyerContainers.length === 0) {
        console.log('Il n\'y a pas de loyers.');
        return cumulLoyers;
    }

    loyerContainers.forEach(container => {
        let loyer = parseFloat(container.querySelector('input[name^="loyer"]').value) || 0;
        let dureeLocation = parseFloat(container.querySelector('input[name^="duree-location"]').value) || 100;
        cumulLoyers += loyer * (dureeLocation / 100) * 12;
    });
    return cumulLoyers;
}

function calculerMensualite(montantEmprunte, dureePret, tauxInteretAnnuel, tauxAssurance) {
    const nombreMois = dureePret * 12;
    const mensualiteEmprunt = tauxInteretAnnuel === 0 ? montantEmprunte / nombreMois : (montantEmprunte * (tauxInteretAnnuel / 12)) / (1 - Math.pow(1 + (tauxInteretAnnuel / 12), -(dureePret * 12)));
    const mensualiteAssurance = montantEmprunte * tauxAssurance / nombreMois;
    return mensualiteEmprunt + mensualiteAssurance;
}

function trouverAnneePertesInferieures(price, notaryFees, agencyCommissionFees, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers, fraisCoproriete) {
    const coutInitial = price + notaryFees + agencyCommissionFees - apport;
    for (let t = 1; t <= duree; t++) {
        // achat
        const valeurRevente = price * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 * t : mensualite * 12 * dureePret;
        const cumulTaxeFonciere = taxeFonciere * t;
        const cumulFraisCoproriete = fraisCoproriete * t;
        const pertesNettesAchat = coutInitial + cumulMensualites + cumulTaxeFonciere + cumulFraisCoproriete - valeurRevente - cumulLoyers;
        // location
        const pertesNettesLocation = (loyerFictif * Math.pow(1 + tauxLoyerFictif, t)) * 12 * t;
        if (pertesNettesLocation > pertesNettesAchat) {
            return t - 1; // Croisement des pertes
        }
    }
    console.log('Pas de croisement des pertes avant ', duree, ' ans');
    return duree; // Pas de croisement des pertes
}

function calculerPertesAchat(price, notaryFees, agencyCommissionFees, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, cumulLoyers, fraisCoproriete) {
    const pertesAchat = [];
    const coutInitial = price + notaryFees + agencyCommissionFees - apport;
    for (let t = 1; t <= duree; t++) {
        const valeurRevente = price * Math.pow(1 + tauxAppreciation, t);
        const cumulMensualites = t <= dureePret ? mensualite * 12 * t : mensualite * 12 * dureePret;
        const cumulTaxeFonciere = taxeFonciere * t;
        const cumulFraisCoproriete = fraisCoproriete * t;
        const pertesNettesAchat = coutInitial + cumulMensualites + cumulTaxeFonciere + cumulFraisCoproriete - valeurRevente - cumulLoyers;
        pertesAchat.push(pertesNettesAchat);
    }
    return pertesAchat;
}

function calculerPertesLocation(loyer, duree, tauxLoyerFictif) {
    const pertesLocation = [];
    for (let t = 1; t <= duree; t++) {
        const cumulLoyer = (loyer * Math.pow(1 + tauxLoyerFictif, t)) * 12 * t;
        pertesLocation.push(cumulLoyer);
    }
    return pertesLocation;
}
