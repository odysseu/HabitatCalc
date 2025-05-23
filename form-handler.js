// description: This script handles the form submission, validation, and calculation of APR and other financial metrics.
import { loadTranslations, updateContent } from './handle-language.js';
export async function resetForm() {
    // Properly reset the incomes-container by setting its innerHTML
    document.getElementById('incomes-container').innerHTML = '<div class="income-container"> <input type="number" id="income-0" name="income-0" placeholder="Revenu mensuel (€)" required> <input type="number" step="0.01" id="income-share-0" name="income-share-0" placeholder="Durée (% de l\'année)" required> <button type="button" id="add-income-button">+</button> </div>';
    // console.log("First incomes-container:", document.getElementById('incomes-container').innerHTML);
    document.getElementById('form-calculator').reset();
    // console.log("Second incomes-container:", document.getElementById('incomes-container').innerHTML);
    document.getElementById('simulation').innerHTML = '';
    let canvas = document.getElementById('myChart');
    if (!(canvas instanceof HTMLCanvasElement)) {
        console.warn('The element with id "myChart" is not a valid canvas. Creating a new canvas.');
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'myChart';
        document.getElementById('myChart-container').appendChild(newCanvas);
        canvas = newCanvas;
    }
    const context = canvas.getContext('2d');
    if (context && typeof context.clearRect === 'function') {
        context.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        console.warn('clearRect method is not available on the canvas context.');
    }
    const languageSelect = document.getElementById('language-select').value;
    const translation = await loadTranslations(languageSelect);
    // console.log("third incomes-container:", document.getElementById('incomes-container').innerHTML);
    updateContent(translation);
    // console.log("Final incomes-container:", document.getElementById('incomes-container').innerHTML);
}

export function calculateAPR() {
    // form values
    // console.log('Calculating APR...');
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
        console.warn('Montant emprunté négatif:', borrowedAmount);
    }
    // console.log('Calculated APR:', apr);
    return apr;
}

export function addIncome() {
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
    container.querySelector('input[name="income-0"]').value = "";
    container.querySelector('input[name="income-share-0"]').value = "";
    
}

function isValidNumber(value) {
    try {
        return !isNaN(parseFloat(value)) && isFinite(value) && value.trim() !== "";
    } catch (error) {
        console.warn("Error checking if value is a valid number:", { value, error });
        return false;
    }
}

export function deleteIncome(button) {
    const container = document.getElementById('incomes-container');
    container.removeChild(button.parentElement);
}

export function extractIncomes() {
    let cumulIncomes = 0;
    const incomesContainer = document.getElementById('incomes-container');
    const incomeContainers = incomesContainer.querySelectorAll('.income-container');

    if (incomeContainers.length === 0) {
        console.log('There are no incomes.');
        return cumulIncomes;
    }

    incomeContainers.forEach(container => {
        let income = parseFloat(container.querySelector('input[name^="income"]').value) || 0;
        let incomeShare = parseFloat(container.querySelector('input[name^="income-share"]').value) || 100;
        cumulIncomes += income * (incomeShare / 100) * 12;
    });
    return cumulIncomes;
}

export function calculateMonthlyPayment(borrowedAmount, loanDuration, interestRateAnnuel, insuranceRate) {
    const numberMonths = loanDuration * 12;
    const loanMonthlyPayment = interestRateAnnuel === 0 ? borrowedAmount / numberMonths : (borrowedAmount * (interestRateAnnuel / 12)) / (1 - Math.pow(1 + (interestRateAnnuel / 12), -(loanDuration * 12)));
    const assuranceMonthlyPayment = borrowedAmount * insuranceRate / numberMonths;
    return loanMonthlyPayment + assuranceMonthlyPayment;
}

export function findPivotYear(price, notaryFees, agencyCommisionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees) {
    const initialCost = price + notaryFees + agencyCommisionFees + fileFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        // Purchase
        const resaleValue = price * Math.pow(1 + appreciationRate, t);
        const cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulativeCoOwnershipFees = coOwnershipFees * t;
        const netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax + cumulativeCoOwnershipFees - resaleValue - cumulIncomes;
        // rent
        const rentNetLosses = (fictitiousRent * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        if (rentNetLosses > netPurchaseLosses) {
            return t - 1; // crossing of losses
        }
    }
    console.log('No crossing before ', maxDuration, ' years');
    return maxDuration; // no crossing of losses
}

export function calculatePurchaseLosses(price, notaryFees, agencyCommisionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, cumulIncomes, coOwnershipFees, fileFees) {
    const purchaseLosses = [];
    const initialCost = price + notaryFees + agencyCommisionFees + fileFees - contribution;
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

export function calculateRentLosses(income, rentDuration, fictitiousRentRate) {
    const rentLosses = [];
    for (let t = 1; t <= rentDuration; t++) {
        let cumulIncome = (income * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        cumulIncome = Math.round(cumulIncome, 0);
        rentLosses.push(cumulIncome);
    }
    return rentLosses;
}
