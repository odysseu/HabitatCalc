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

document.getElementById('insuranceRate').addEventListener('input', calculateTAEG);
document.getElementById('interest-rate').addEventListener('input', calculateTAEG);
document.getElementById('file-fees').addEventListener('input', calculateTAEG);
document.getElementById('price').addEventListener('input', calculateTAEG);
document.getElementById('notary').addEventListener('input', calculateTAEG);
document.getElementById('commission').addEventListener('input', calculateTAEG);
document.getElementById('contribution').addEventListener('input', calculateTAEG);
document.getElementById('laonDuration').addEventListener('input', calculateTAEG);

function calculateTAEG() {
    // Récupération des valeurs du formulaire
    const insuranceRate = parseFloat(document.getElementById('insuranceRate').value) / 100 || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 || 0;
    const fileFees = parseFloat(document.getElementById('file-fees').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const notary = parseFloat(document.getElementById('notary').value) / 100 || 0;
    const commission = parseFloat(document.getElementById('commission').value) / 100 || 0;
    const contribution = parseFloat(document.getElementById('contribution').value) || 0;
    const laonDuration = parseFloat(document.getElementById('laonDuration').value) || 0;
    // Calcul des frais et du montant emprunté
    const notaryFees = price * notary;
    const commisionFees = price * commission;
    const borrowedAmount = price + notaryFees + commisionFees + fileFees - contribution;
    // Initialisation du TAEG
    let taeg = 0;
    // Calcul du TAEG si le montant emprunté est valide
    if (borrowedAmount > 0) {
        const mensualitePretAssurance = calculerMensualite(borrowedAmount, laonDuration, interestRate, insuranceRate);
        const coutEmprunt = (mensualitePretAssurance * laonDuration * 12) - borrowedAmount;
        taeg = coutEmprunt / borrowedAmount * 100;
    } else if (borrowedAmount < 0) {
        console.error('Montant emprunté négatif:', borrowedAmount);
    }
    // Mise à jour de l'affichage avec les traductions
    const taegElement = document.getElementById('taeg-overlay');
    if (taegElement && typeof translations !== 'undefined' && translations && translations.reportTAEG) {
        taegElement.textContent = `${translations.TAEG}: ${taeg.toFixed(2)}%`;
    }
    return taeg;
}

function addIncome() {
    let incomeCount = document.querySelectorAll('.income-container').length;
    const container = document.getElementById('incomes-container');
    // Get values from the first fields
    const currentIncomeValue = container.querySelector('input[name="income-0"]').value.trim();
    const currentDurationValue = container.querySelector('input[name="income-share-0"]').value.trim();

    let newIncome;
    try {
        if (isValidNumber(currentIncomeValue) && isValidNumber(currentDurationValue)) {
            // If both are valid numbers, create the new inputs
            newIncome = document.createElement('div');
            newIncome.className = 'income-container';
            const inputIncome = document.createElement('input');
            inputIncome.type = 'number';
            inputIncome.id = `income-${incomeCount}`;
            inputIncome.name = `income-${incomeCount}`;
            inputIncome.value = currentIncomeValue;
            inputIncome.placeholder = 'Revenu mensuel (€)';
            inputIncome.required = true;

            const inputDuree = document.createElement('input');
            inputDuree.type = 'number';
            inputDuree.step = '0.01';
            inputDuree.id = `income-share-${incomeCount}`;
            inputDuree.name = `income-share-${incomeCount}`;
            inputDuree.value = currentDurationValue;
            inputDuree.placeholder = 'Durée (% de l\'année)';
            inputDuree.required = true;

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.textContent = '-';
            deleteButton.onclick = function() { deleteIncome(this); };

            newIncome.appendChild(inputIncome);
            newIncome.appendChild(inputDuree);
            newIncome.appendChild(deleteButton);
            container.appendChild(newIncome);
            incomeCount++;
        } else {
            console.log("Invalid input detected:", {
                income: currentIncomeValue,
                duration: currentDurationValue
            });
        }
    } catch (error) {
        console.log("Error validating input:", error);
    }
    
    // Reset the fields to ensure next inputs will be added in the form
    container.querySelector('input[name="income-0"]').value = "";
    container.querySelector('input[name="income-share-0"]').value = "";
    
}

function isValidNumber(value) {
    try {
        return !isNaN(parseFloat(value)) && isFinite(value) && value.trim() !== "";
    } catch (error) {
        console.error("Error checking if value is a valid number:", { value, error });
        return false;
    }
}

function deleteIncome(button) {
    const container = document.getElementById('incomes-container');
    container.removeChild(button.parentElement);
}

function extractIncomes() {
    let cumulIncomes = 0;
    const incomesContainer = document.getElementById('incomes-container');
    const incomeContainers = incomesContainer.querySelectorAll('.income-container');

    if (incomeContainers.length === 0) {
        console.log('Il n\'y a pas de incomes.');
        return cumulIncomes;
    }

    incomeContainers.forEach(container => {
        let income = parseFloat(container.querySelector('input[name^="income"]').value) || 0;
        let incomeShare = parseFloat(container.querySelector('input[name^="income-share"]').value) || 100;
        cumulIncomes += income * (incomeShare / 100) * 12;
    });
    return cumulIncomes;
}

function calculerMensualite(borrowedAmount, laonDuration, interestRateAnnuel, insuranceRate) {
    const nombreMois = laonDuration * 12;
    const mensualiteEmprunt = interestRateAnnuel === 0 ? borrowedAmount / nombreMois : (borrowedAmount * (interestRateAnnuel / 12)) / (1 - Math.pow(1 + (interestRateAnnuel / 12), -(laonDuration * 12)));
    const mensualiteAssurance = borrowedAmount * insuranceRate / nombreMois;
    return mensualiteEmprunt + mensualiteAssurance;
}

function trouverAnneePertesInferieures(price, notaryFees, commisionFees, contribution, mensualite, propertyTax, appreciationRate, duree, laonDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, fraisCoproriete) {
    const coutInitial = price + notaryFees + commisionFees - contribution;
    for (let t = 1; t <= duree; t++) {
        // achat
        const valeurRevente = price * Math.pow(1 + appreciationRate, t);
        const cumulMensualites = t <= laonDuration ? mensualite * 12 * t : mensualite * 12 * laonDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulFraisCoproriete = fraisCoproriete * t;
        const pertesNettesAchat = coutInitial + cumulMensualites + cumulPropertyTax + cumulFraisCoproriete - valeurRevente - cumulIncomes;
        // location
        const pertesNettesLocation = (fictitiousRent * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        if (pertesNettesLocation > pertesNettesAchat) {
            return t - 1; // Croisement des pertes
        }
    }
    console.log('Pas de croisement des pertes avant ', duree, ' ans');
    return duree; // Pas de croisement des pertes
}

function calculerPertesAchat(price, notaryFees, commisionFees, contribution, mensualite, propertyTax, appreciationRate, duree, laonDuration, cumulIncomes, fraisCoproriete) {
    const pertesAchat = [];
    const coutInitial = price + notaryFees + commisionFees - contribution;
    for (let t = 1; t <= duree; t++) {
        const valeurRevente = price * Math.pow(1 + appreciationRate, t);
        const cumulMensualites = t <= laonDuration ? mensualite * 12 * t : mensualite * 12 * laonDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulFraisCoproriete = fraisCoproriete * t;
        const pertesNettesAchat = coutInitial + cumulMensualites + cumulPropertyTax + cumulFraisCoproriete - valeurRevente - cumulIncomes;
        pertesAchat.push(pertesNettesAchat);
    }
    return pertesAchat;
}

function calculerPertesLocation(income, duree, fictitiousRentRate) {
    const pertesLocation = [];
    for (let t = 1; t <= duree; t++) {
        const cumulIncome = (income * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        pertesLocation.push(cumulIncome);
    }
    return pertesLocation;
}
