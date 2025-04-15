// description: This script handles the form submission, validation, and calculation of APR and other financial metrics.
function resetForm() {
    document.getElementById('form-calculator').reset();
    document.getElementById('simulation').innerHTML = '';
    const canvas = document.getElementById('myChart');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const languageSelect = document.getElementById('language-select');
    loadTranslations(languageSelect.value);
}

document.getElementById('insuranceRate').addEventListener('input', calculateAPR);
document.getElementById('interest-rate').addEventListener('input', calculateAPR);
document.getElementById('file-fees').addEventListener('input', calculateAPR);
document.getElementById('price').addEventListener('input', calculateAPR);
document.getElementById('notary').addEventListener('input', calculateAPR);
document.getElementById('agency-commission').addEventListener('input', calculateAPR);
document.getElementById('contribution').addEventListener('input', calculateAPR);
document.getElementById('loanDuration').addEventListener('input', calculateAPR);

function calculateAPR() {
    // form values
    const insuranceRate = parseFloat(document.getElementById('insuranceRate').value) / 100 || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 || 0;
    const fileFees = parseFloat(document.getElementById('file-fees').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const notary = parseFloat(document.getElementById('notary').value) / 100 || 0;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100 || 0;
    const contribution = parseFloat(document.getElementById('contribution').value) || 0;
    const loanDuration = parseFloat(document.getElementById('loanDuration').value) || 0;
    // Calculate monthly payments
    const notaryFees = price * notary;
    const commisionFees = price * agencyCommission;
    const borrowedAmount = price + notaryFees + commisionFees + fileFees - contribution;
    // Initialisation of APR
    let apr = 0;
    // Calculating APR if borrowed amount is positive
    if (borrowedAmount > 0) {
        const monthlyLoanInsurancePayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
        const coutEmprunt = (monthlyLoanInsurancePayment * loanDuration * 12) - borrowedAmount;
        apr = coutEmprunt / borrowedAmount * 100 / loanDuration ;
    } else if (borrowedAmount < 0) {
        console.error('Montant emprunté négatif:', borrowedAmount);
    }
    // update APR display
    const aprElement = document.getElementById('apr-overlay');
    if (aprElement && typeof translations !== 'undefined' && translations && translations.reportAPR) {
        aprElement.textContent = `${translations.APR}: ${apr.toFixed(2)}%`;
    }
    return apr;
}

function addIncome() {
    let incomeCount = document.querySelectorAll('.income-container').length;
    const container = document.getElementById('incomes-container');
    // Get values from the first fields
    const currentIncomeValue = container.querySelector('input[name="income-0"]').value.trim();
    const currentTimeShareValue = container.querySelector('input[name="income-share-0"]').value.trim();

    let newIncome;
    try {
        if (isValidNumber(currentIncomeValue) && isValidNumber(currentTimeShareValue)) {
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

            const inputDuration = document.createElement('input');
            inputDuration.type = 'number';
            inputDuration.step = '0.01';
            inputDuration.id = `income-share-${incomeCount}`;
            inputDuration.name = `income-share-${incomeCount}`;
            inputDuration.value = currentTimeShareValue;
            inputDuration.placeholder = 'Durée (% de l\'année)';
            inputDuration.required = true;

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.textContent = '-';
            deleteButton.onclick = function() { deleteIncome(this); };

            newIncome.appendChild(inputIncome);
            newIncome.appendChild(inputDuration);
            newIncome.appendChild(deleteButton);
            container.appendChild(newIncome);
            incomeCount++;
        } else {
            console.log("Invalid input detected:", {
                income: currentIncomeValue,
                duration: currentTimeShareValue
            });
        }
    } catch (error) {
        console.log("Error validating input:", error);
    }
    
    // Reset the fields to ensure next inputs will be added in the form
    container.querySelector('input[name="income-0"]').value = undefined;
    container.querySelector('input[name="income-share-0"]').value = undefined;
    
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

function calculateMonthlyPayment(borrowedAmount, loanDuration, interestRateAnnuel, insuranceRate) {
    const numberMonths = loanDuration * 12;
    const loanMonthlyPayment = interestRateAnnuel === 0 ? borrowedAmount / numberMonths : (borrowedAmount * (interestRateAnnuel / 12)) / (1 - Math.pow(1 + (interestRateAnnuel / 12), -(loanDuration * 12)));
    const assuranceMonthlyPayment = borrowedAmount * insuranceRate / numberMonths;
    return loanMonthlyPayment + assuranceMonthlyPayment;
}

function trouverAnneePertesInferieures(price, notaryFees, agencyCommisionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees) {
    const initialCost = price + notaryFees + agencyCommisionFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        // Purchase
        const resaleValue = price * Math.pow(1 + appreciationRate, t);
        const cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulativeCoOwnershipFees = coOwnershipFees * t;
        const netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax + cumulativeCoOwnershipFees - resaleValue - cumulIncomes;
        // location
        const rentNetLosses = (fictitiousRent * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        if (rentNetLosses > netPurchaseLosses) {
            return t - 1; // Croisement des pertes
        }
    }
    console.log('Pas de croisement des pertes avant ', maxDuration, ' ans');
    return maxDuration; // Pas de croisement des pertes
}

function calculatePurchaseLosses(price, notaryFees, agencyCommisionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, cumulIncomes, coOwnershipFees) {
    const purchaseLosses = [];
    const initialCost = price + notaryFees + agencyCommisionFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        const resaleValue = price * Math.pow(1 + appreciationRate, t);
        const cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulativeCoOwnershipFees = coOwnershipFees * t;
        let netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax + cumulativeCoOwnershipFees - resaleValue - cumulIncomes;
        netPurchaseLosses = Math.round(netPurchaseLosses, 0);
        purchaseLosses.push(netPurchaseLosses);
    }
    return purchaseLosses;
}

function calculateRentLosses(income, rentDuration, fictitiousRentRate) {
    const rentLosses = [];
    for (let t = 1; t <= rentDuration; t++) {
        let cumulIncome = (income * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        cumulIncome = Math.round(cumulIncome, 0);
        rentLosses.push(cumulIncome);
    }
    return rentLosses;
}
