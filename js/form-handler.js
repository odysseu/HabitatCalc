// description: This script handles the form submission, validation, and calculation of APR and other financial metrics.
import { loadTranslations, updateContent } from './handle-language.js';
import { generateReport } from './report-handler.js';

/**
 * Resets the form and chart to their initial state.
 */
export async function resetForm() {
    document.getElementById('incomes-container').innerHTML =
        '<div class="income-container">' +
        '  <div class="income-inputs">' +
        '    <input type="number" id="income-0" name="income-0" placeholder="Revenu mensuel&nbsp;(€)" required>' +
        '    <input type="number" step="0.01" id="income-share-0" name="income-share-0" placeholder="Durée&nbsp;(% de l\'année)" required>' +
        '  </div>' +
        '  <button class="change-income-button" type="button" id="add-income-button">+</button>' +
        '</div>';

    document.getElementById('form-calculator').reset();
    document.getElementById('simulation').innerHTML = '';
    let canvas = document.getElementById('myChart');
    if (!(canvas instanceof HTMLCanvasElement)) {
        console.warn('The element with id "myChart" is not a valid canvas. Creating a new canvas.');
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'myChart';
        document.getElementById('chart-container').appendChild(newCanvas);
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
    updateContent(translation);
}
/**
 * Calculates the Annual Percentage Rate (APR) using the Newton-Raphson method.
 */
export function calculateAPR() {
    const {
        insuranceRate,
        interestRate,
        fileFees,
        price,
        notary,
        agencyCommission,
        contribution,
        loanDuration
    } = getFormValues();

    const { borrowedAmount, notaryFees, commissionFees } = calculateBorrowedAmount(price, notary, agencyCommission, fileFees, contribution);
    if (borrowedAmount <= 0 || loanDuration <= 0) {
        console.warn('Invalid borrowed amount or loan duration:', borrowedAmount, loanDuration);
        return 0;
    }

    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const totalMonths = loanDuration * 12;
    let aprMonthly = interestRate / 12;
    const epsilon = 1e-7;
    const maxIter = 10000;

    for (let i = 0; i < maxIter; i++) {
        const y = calculateAPRFunction(aprMonthly, monthlyPayment, totalMonths, borrowedAmount);
        const yPrime = calculateAPRDerivative(aprMonthly, monthlyPayment, totalMonths);
        if (Math.abs(yPrime) < 1e-10) break;
        const next = aprMonthly - y / yPrime;
        if (Math.abs(next - aprMonthly) < epsilon) {
            aprMonthly = next;
            break;
        }
        aprMonthly = next;
    }

    const apr = aprMonthly * 12 * 100;
    return apr > 0 && isFinite(apr) ? apr : 0;
}

/**
 * Helper function for APR calculation: f(r) = Σ [monthlyPayment / (1 + r)^n] - borrowedAmount
 */
function calculateAPRFunction(r, monthlyPayment, totalMonths, borrowedAmount) {
    let sum = 0;
    for (let n = 1; n <= totalMonths; n++) {
        sum += monthlyPayment / Math.pow(1 + r, n);
    }
    return sum - borrowedAmount;
}

/**
 * Helper function for APR calculation: f'(r) = -Σ [n * monthlyPayment / (1 + r)^(n+1)]
 */
function calculateAPRDerivative(r, monthlyPayment, totalMonths) {
    let sum = 0;
    for (let n = 1; n <= totalMonths; n++) {
        sum -= n * monthlyPayment / Math.pow(1 + r, n + 1);
    }
    return sum;
}

/**
 * Adds a new income input container.
 */
export function addIncome() {
    const container = document.getElementById('incomes-container');
    const incomeContainers = container.querySelectorAll('.income-container');
    const incomeCount = incomeContainers.length;
    const lastIncomeContainer = incomeContainers[0];
    const currentIncomeValue = lastIncomeContainer.querySelector('input[name^="income-"]').value.trim();
    const currentTimeShareValue = lastIncomeContainer.querySelector('input[name^="income-share-"]').value.trim();

    if (!isValidNumber(currentIncomeValue) || !isValidPercentage(currentTimeShareValue)) {
        console.log("Invalid input detected:", { income: currentIncomeValue, duration: currentTimeShareValue });
        return;
    }

    const newIncomeContainer = document.createElement('div');
    newIncomeContainer.className = 'income-container';

    const incomeInputsDiv = document.createElement('div');
    incomeInputsDiv.className = 'income-inputs';

    const inputIncome = document.createElement('input');
    inputIncome.type = 'number';
    inputIncome.id = `income-${incomeCount}`;
    inputIncome.name = `income-${incomeCount}`;
    inputIncome.placeholder = 'Revenu mensuel&nbsp;(€)';
    inputIncome.required = true;
    inputIncome.value = currentIncomeValue;

    const inputDuration = document.createElement('input');
    inputDuration.type = 'number';
    inputDuration.step = '0.01';
    inputDuration.id = `income-share-${incomeCount}`;
    inputDuration.name = `income-share-${incomeCount}`;
    inputDuration.placeholder = 'Durée&nbsp;(% de l\'année)';
    inputDuration.required = true;
    inputDuration.value = currentTimeShareValue;

    incomeInputsDiv.appendChild(inputIncome);
    incomeInputsDiv.appendChild(inputDuration);
    newIncomeContainer.appendChild(incomeInputsDiv);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.id = `delete-income-button-${incomeCount}`;
    deleteButton.className = 'change-income-button';
    deleteButton.textContent = '-';
    deleteButton.onclick = () => deleteIncome(deleteButton);

    newIncomeContainer.appendChild(deleteButton);
    container.appendChild(newIncomeContainer);

    lastIncomeContainer.querySelector('input[name^="income-"]').value = "";
    lastIncomeContainer.querySelector('input[name^="income-share-"]').value = "";
}

/**
 * Deletes an income input container.
 */
export function deleteIncome(button) {
    const incomeContainer = button.parentElement;
    incomeContainer.remove();
}

/**
 * Extracts and sums all incomes, weighted by their duration.
 */
export function extractIncomes() {
    let cumulIncomes = 0;
    const incomesContainer = document.getElementById('incomes-container');
    const incomeContainers = incomesContainer.querySelectorAll('.income-container');

    incomeContainers.forEach(container => {
        const incomeInput = container.querySelector('input[name^="income"]');
        const incomeShareInput = container.querySelector('input[name^="income-share"]');

        // Parse income and incomeShare, defaulting to 0 if empty or invalid
        const income = incomeInput ? parseFloat(incomeInput.value) || 0 : 0;
        const incomeShare = incomeShareInput ? parseFloat(incomeShareInput.value) || 0 : 0;

        // Add to cumulative incomes, even if income or incomeShare is 0
        cumulIncomes += income * (incomeShare / 100) * 12;
    });

    return cumulIncomes;
}

/**
 * Calculates the monthly payment (loan + insurance).
 */
export function calculateMonthlyPayment(borrowedAmount, loanDuration, interestRateAnnual, insuranceRate) {
    // check that borrowedAmount and loanDuration are positive numbers
    if (borrowedAmount <= 0 || loanDuration <= 0) {
        console.warn('Invalid borrowed amount or loan duration:', borrowedAmount, loanDuration);
        return 0;
    }
    const numberMonths = loanDuration * 12;
    const monthlyInterestRate = interestRateAnnual / 12;
    const loanMonthlyPayment = interestRateAnnual === 0
        ? borrowedAmount / numberMonths
        : (borrowedAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberMonths));
    const assuranceMonthlyPayment = borrowedAmount * (insuranceRate / 12);
    
    return loanMonthlyPayment + assuranceMonthlyPayment;
}

/**
 * Finds the pivot year where renting becomes more expensive than buying.
 */
export function findPivotYear(
    price, notaryFees, agencyCommissionFees, contribution,
    monthlyPayment, propertyTax, buyHousingTax, rentingHousingTax,
    appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees
) {
    const initialCost = price + notaryFees + agencyCommissionFees + fileFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        let resaleValue = price * Math.pow(1 + appreciationRate, t);
        let cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        let cumulPropertyTax = propertyTax * t;
        let cumulBuyHousingTax = buyHousingTax * t;
        let cumulativeCoOwnershipFees = coOwnershipFees * t;
        let netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax + cumulBuyHousingTax + cumulativeCoOwnershipFees - resaleValue - cumulIncomes;
        let cumulRentingHousingTax = rentingHousingTax * t;
        let netRentLosses = cumulRentingHousingTax + (fictitiousRent * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        if (netRentLosses > netPurchaseLosses) {
            return t - 1;
        }
    }
    console.log('No crossing before ', maxDuration, ' years');
    return maxDuration;
}

/**
 * Calculates cumulative purchase losses over time.
 */
export function calculatePurchaseLosses(
    price, notaryFees, agencyCommissionFees, contribution,
    monthlyPayment, propertyTax, buyHousingTax, appreciationRate,
    maxDuration, loanDuration, cumulIncomes, coOwnershipFees, fileFees
) {
    const purchaseLosses = [];
    const initialCost = price + notaryFees + agencyCommissionFees + fileFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        const resaleValue = price * Math.pow(1 + appreciationRate, t);
        const cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulBuyHousingTax = buyHousingTax * t;
        const cumulativeCoOwnershipFees = coOwnershipFees * t;

        // Calculate net purchase losses (or profit if negative)
        const netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax + cumulBuyHousingTax + cumulativeCoOwnershipFees - resaleValue - (cumulIncomes * t);

        // Round to the nearest integer and ensure non-negative
        const roundedLosses = Math.round(netPurchaseLosses);
        purchaseLosses.push(Math.max(0, roundedLosses)); // Ensure losses are non-negative
    }

    return purchaseLosses;
}

/**
 * Calculates cumulative rent losses over time.
 */
export function calculateRentLosses(income, rentDuration, fictitiousRentRate, rentingHousingTax) {
    const rentLosses = [];
    for (let t = 1; t <= rentDuration; t++) {
        const cumulRentingHousingTax = rentingHousingTax * t;
        const cumulIncome = (income * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        rentLosses.push(cumulRentingHousingTax + Math.round(cumulIncome, 0));
    }
    return rentLosses;
}

/**
 * Validates if a value is a non-negative number.
 */
function isValidNumber(value) {
    if (value === "" || value === null || value === undefined) return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= 0;
}

/**
 * Validates if a value is a valid percentage (0-100).
 */
function isValidPercentage(value) {
    if (value === "" || value === null || value === undefined) return false;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= 0 && num <= 100;
}

/**
 * Extracts and parses form values.
 */
export function getFormValues() {
    return {
        insuranceRate: parseFloat(document.getElementById('insurance-rate').value) / 100 || 0,
        interestRate: parseFloat(document.getElementById('interest-rate').value) / 100 || 0,
        fileFees: parseFloat(document.getElementById('file-fees').value) || 0,
        price: parseFloat(document.getElementById('price').value) || 0,
        notary: parseFloat(document.getElementById('notary').value) / 100 || 0,
        agencyCommission: parseFloat(document.getElementById('agency-commission').value) / 100 || 0,
        contribution: parseFloat(document.getElementById('contribution').value) || 0,
        loanDuration: parseFloat(document.getElementById('loanDuration').value) || 0,
    };
}

/**
 * Calculates the borrowed amount after fees and contribution.
 */
export function calculateBorrowedAmount(price, notary, agencyCommission, fileFees, contribution) {
    const notaryFees = price * notary;
    const commissionFees = price * agencyCommission;
    const borrowedAmount = Math.max(0, price + notaryFees + commissionFees + fileFees - contribution);
    return { borrowedAmount, notaryFees, commissionFees };
}
