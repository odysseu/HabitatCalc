function resetForm() {
    document.getElementById('calculette-form').reset();
    document.getElementById('resultat').innerHTML = '';
    const canvas = document.getElementById('myChart');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const languageSelect = document.getElementById('language-select');
    loadTranslations(languageSelect.value);
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

function trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers, fraisCoproriete, tauxAssurance) {
    // rappel: TAEG = Taux Annuel Effectif Global
    // taux nominal mensuel = n((1 + TAEG)^(1/n) - 1)
    // ou encore TAEG = (1 + taux_nominal_mensuel/n)^(n) - 1
    // TAEG_mensuel = (1 + taux_nominal_annuel/12) - 1
    const coutInitial = prix + fraisNotaire + fraisCommission - apport;
    for (let t = 1; t <= duree; t++) {
        // achat
        const valeurRevente = prix * Math.pow(1 + tauxAppreciation, t);
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

function calculerPertesAchat(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, duree, dureePret, cumulLoyers, fraisCoproriete) {
    const pertesAchat = [];
    const coutInitial = prix + fraisNotaire + fraisCommission - apport;
    for (let t = 1; t <= duree; t++) {
        const valeurRevente = prix * Math.pow(1 + tauxAppreciation, t);
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
