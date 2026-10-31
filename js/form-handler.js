// description: This script handles the form submission, validation, and calculation of APR and other financial metrics.
// It includes both legacy annual-based functions (for backward compatibility) and new monthly-based functions for precise calculations.
import { loadTranslations, updateContent } from './handle-language.js';
import { generateReport } from './report-handler.js';

// ============================================
// PRIVATE UTILITY FUNCTIONS
// ============================================

/**
 * Calculates the sum of a geometric series: a + a*r + a*r^2 + ... + a*r^(n-1)
 * Used for calculating cumulative costs with evolution rates
 * @param {number} firstTerm - First term of the series
 * @param {number} ratio - Common ratio (evolution rate per period)
 * @param {number} numTerms - Number of terms
 * @returns {number} Sum of the geometric series
 */
function geometricSeriesSum(firstTerm, ratio, numTerms) {
    if (numTerms <= 0) return 0;
    if (Math.abs(ratio) < 1e-10) return firstTerm * numTerms;
    return firstTerm * (Math.pow(1 + ratio, numTerms) - 1) / ratio;
}

/**
 * Calculates the remaining loan balance after a certain number of payments
 * @param {number} borrowedAmount - Initial loan amount
 * @param {number} annualInterestRate - Annual interest rate (as decimal)
 * @param {number} totalMonths - Total loan duration in months
 * @param {number} monthsPaid - Number of months already paid
 * @returns {number} Remaining loan balance
 */
function calculateRemainingBalance(borrowedAmount, annualInterestRate, totalMonths, monthsPaid) {
    if (monthsPaid <= 0) return borrowedAmount;
    if (annualInterestRate === 0) {
        const monthlyPayment = borrowedAmount / totalMonths;
        return Math.max(0, borrowedAmount - monthlyPayment * monthsPaid);
    }
    const monthlyRate = annualInterestRate / 12;
    const monthlyPayment = (borrowedAmount * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -totalMonths));
    return borrowedAmount * Math.pow(1 + monthlyRate, monthsPaid) -
           monthlyPayment * (Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate;
}

// ============================================
// EXPORTED BASIC CALCULATION FUNCTIONS
// ============================================

/**
 * Calculates the borrowed amount after fees and contribution.
 * @param {number} price - Property price
 * @param {number} notaryRate - Notary fees rate (as decimal, e.g., 0.08 for 8%)
 * @param {number} agencyCommissionRate - Agency commission rate (as decimal)
 * @param {number} fileFees - Fixed file fees amount
 * @param {number} contribution - Personal contribution amount
 * @returns {Object} Object containing borrowedAmount, notaryFees, and commissionFees
 */
export function calculateBorrowedAmount(price, notaryRate, agencyCommissionRate, fileFees, contribution) {
    const notaryFees = price * notaryRate;
    const commissionFees = price * agencyCommissionRate;
    const borrowedAmount = Math.max(0, price + notaryFees + commissionFees + fileFees - contribution);
    return { borrowedAmount, notaryFees, commissionFees };
}

/**
 * Calculates the monthly loan payment (principal + interest only).
 * Does NOT include insurance - use calculateMonthlyInsurance for that.
 * @param {number} borrowedAmount - Loan amount
 * @param {number} loanDurationYears - Loan duration in years
 * @param {number} annualInterestRate - Annual interest rate (as decimal)
 * @returns {number} Monthly loan payment (principal + interest)
 */
export function calculateLoanMonthlyPayment(borrowedAmount, loanDurationYears, annualInterestRate) {
    if (borrowedAmount <= 0 || loanDurationYears <= 0) {
        console.warn('Invalid borrowed amount or loan duration:', borrowedAmount, loanDurationYears);
        return 0;
    }
    const totalMonths = loanDurationYears * 12;
    const monthlyRate = annualInterestRate / 12;
    if (annualInterestRate === 0) {
        return borrowedAmount / totalMonths;
    }
    return (borrowedAmount * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -totalMonths));
}

/**
 * Calculates monthly insurance payment based on current remaining balance.
 * @param {number} remainingBalance - Current remaining loan balance
 * @param {number} annualInsuranceRate - Annual insurance rate (as decimal)
 * @returns {number} Monthly insurance payment
 */
export function calculateMonthlyInsurance(remainingBalance, annualInsuranceRate) {
    return remainingBalance * (annualInsuranceRate / 12);
}

/**
 * Calculates the complete monthly payment breakdown for a specific month.
 * @param {number} borrowedAmount - Initial loan amount
 * @param {number} annualInterestRate - Annual interest rate (as decimal)
 * @param {number} loanDurationYears - Loan duration in years
 * @param {number} annualInsuranceRate - Annual insurance rate (as decimal)
 * @param {number} monthIndex - Month index (0 = first month)
 * @returns {Object} Payment breakdown with principal, interest, insurance, total, and remaining balance
 */
export function calculateMonthlyPaymentBreakdown(
    borrowedAmount, annualInterestRate, loanDurationYears, annualInsuranceRate, monthIndex
) {
    const totalMonths = loanDurationYears * 12;
    if (monthIndex >= totalMonths || borrowedAmount <= 0) {
        return { principal: 0, interest: 0, insurance: 0, total: 0, remainingBalance: 0 };
    }
    const monthlyLoanPayment = calculateLoanMonthlyPayment(borrowedAmount, loanDurationYears, annualInterestRate);
    const remainingAtStart = calculateRemainingBalance(borrowedAmount, annualInterestRate, totalMonths, monthIndex);
    const monthlyRate = annualInterestRate / 12;
    const interest = remainingAtStart * monthlyRate;
    const principal = monthlyLoanPayment - interest;
    const insurance = calculateMonthlyInsurance(remainingAtStart, annualInsuranceRate);
    return {
        principal,
        interest,
        insurance,
        total: monthlyLoanPayment + insurance,
        remainingBalance: Math.max(0, remainingAtStart - principal)
    };
}

/**
 * Calculates cumulative purchase costs up to a specific month (monthly precision).
 * @param {Object} params - All calculation parameters
 * @param {number} monthIndex - Month index (0 to maxMonths-1)
 * @returns {number} Net cumulative purchase costs
 */
export function calculateCumulativePurchaseCosts(params, monthIndex) {
    const {
        price, notaryRate, agencyCommissionRate, fileFees, contribution,
        annualInterestRate, loanDurationYears, annualInsuranceRate,
        annualPropertyTax, annualPropertyTaxRate, buyHousingTax,
        coOwnershipFees, annualAppreciationRate, annualIncomes
    } = params;

    const notaryFees = price * notaryRate;
    const agencyCommissionFees = price * agencyCommissionRate;
    const initialCost = price + notaryFees + agencyCommissionFees + fileFees + contribution;
    const borrowedAmount = Math.max(0, price + notaryFees + agencyCommissionFees + fileFees - contribution);
    const totalLoanMonths = loanDurationYears * 12;

    let cumulativeLoanPayments = 0;
    for (let m = 0; m < Math.min(monthIndex, totalLoanMonths); m++) {
        const breakdown = calculateMonthlyPaymentBreakdown(
            borrowedAmount, annualInterestRate, loanDurationYears, annualInsuranceRate, m
        );
        cumulativeLoanPayments += breakdown.total;
    }

    const monthlyPropertyTax = annualPropertyTax / 12;
    const monthlyPropertyTaxRate = annualPropertyTaxRate / 12;
    const cumulativePropertyTax = geometricSeriesSum(monthlyPropertyTax, monthlyPropertyTaxRate, monthIndex);

    const cumulativeBuyHousingTax = (buyHousingTax / 12) * monthIndex;
    const cumulativeCoOwnership = coOwnershipFees * monthIndex;

    const monthlyAppreciationRate = annualAppreciationRate / 12;
    const propertyValue = price * Math.pow(1 + monthlyAppreciationRate, monthIndex);

    const monthlyIncomes = annualIncomes / 12;
    const cumulativeIncomes = monthlyIncomes * monthIndex;

    return initialCost + cumulativeLoanPayments + cumulativePropertyTax +
           cumulativeBuyHousingTax + cumulativeCoOwnership - propertyValue - cumulativeIncomes;
}

/**
 * Calculates cumulative rent costs up to a specific month (monthly precision).
 * @param {Object} params - Calculation parameters
 * @param {number} monthIndex - Month index (0 to maxMonths-1)
 * @returns {number} Net cumulative rent costs
 */
export function calculateCumulativeRentCosts(params, monthIndex) {
    const { baseMonthlyRent, annualRentRate, monthlyRentingPropertyTax, rentingPropertyTaxRate, annualIncomes } = params;

    const monthlyRentRate = annualRentRate / 12;
    const cumulativeRent = geometricSeriesSum(baseMonthlyRent, monthlyRentRate, monthIndex);

    const monthlyTaxRate = rentingPropertyTaxRate / 12;
    const cumulativeRentingTax = geometricSeriesSum(monthlyRentingPropertyTax, monthlyTaxRate, monthIndex);

    const monthlyIncomes = annualIncomes / 12;
    const cumulativeIncomes = monthlyIncomes * monthIndex;

    return cumulativeRent + cumulativeRentingTax - cumulativeIncomes;
}

/**
 * Finds the exact pivot point where buying becomes more advantageous than renting.
 * Returns object with years, months, and totalMonths for precise reporting.
 * @param {Object} params - All calculation parameters
 * @param {number} params.maxDurationYears - Maximum duration to check (in years)
 * @returns {Object} Pivot point: { years, months, totalMonths }
 */
export function findPivotPoint(params) {
    const maxMonths = params.maxDurationYears * 12;
    let prevPurchase = calculateCumulativePurchaseCosts(params, 0);
    let prevRent = calculateCumulativeRentCosts(params, 0);

    for (let month = 1; month <= maxMonths; month++) {
        const purchase = calculateCumulativePurchaseCosts(params, month);
        const rent = calculateCumulativeRentCosts(params, month);

        if (prevRent <= prevPurchase && rent > purchase) {
            return {
                years: Math.floor((month - 1) / 12),
                months: (month - 1) % 12,
                totalMonths: month - 1
            };
        }
        prevPurchase = purchase;
        prevRent = rent;
    }

    return {
        years: Math.floor(maxMonths / 12),
        months: maxMonths % 12,
        totalMonths: maxMonths
    };
}

// ============================================
// LEGACY FUNCTIONS (Annual-based, CORRECTED)
// ============================================

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
 * Calculates the monthly payment (loan + insurance).
 * Note: Insurance is approximated based on initial borrowed amount for backward compatibility.
 * For precise monthly insurance, use calculateMonthlyPaymentBreakdown.
 * @param {number} borrowedAmount - Loan amount
 * @param {number} loanDuration - Loan duration in years
 * @param {number} interestRateAnnual - Annual interest rate (as decimal)
 * @param {number} insuranceRate - Annual insurance rate (as decimal)
 * @returns {number} Monthly payment (loan + insurance approximation)
 */
export function calculateMonthlyPayment(borrowedAmount, loanDuration, interestRateAnnual, insuranceRate) {
    if (borrowedAmount <= 0 || loanDuration <= 0) {
        console.warn('Invalid borrowed amount or loan duration:', borrowedAmount, loanDuration);
        return 0;
    }
    const loanPayment = calculateLoanMonthlyPayment(borrowedAmount, loanDuration, interestRateAnnual);
    // Approximation: insurance on initial balance (for backward compatibility)
    const insurancePayment = borrowedAmount * (insuranceRate / 12);
    return loanPayment + insurancePayment;
}

/**
 * Calculates the Annual Percentage Rate (APR) using the Newton-Raphson method.
 */
export function calculateAPR() {
    const { insuranceRate, interestRate, fileFees, price, notary, agencyCommission, contribution, loanDuration } = getFormValues();
    const { borrowedAmount } = calculateBorrowedAmount(price, notary, agencyCommission, fileFees, contribution);
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
        if (Math.abs(next - aprMonthly) < epsilon) { aprMonthly = next; break; }
        aprMonthly = next;
    }
    const apr = aprMonthly * 12 * 100;
    return apr > 0 && isFinite(apr) ? apr : 0;
}

function calculateAPRFunction(r, monthlyPayment, totalMonths, borrowedAmount) {
    let sum = 0;
    for (let n = 1; n <= totalMonths; n++) sum += monthlyPayment / Math.pow(1 + r, n);
    return sum - borrowedAmount;
}
function calculateAPRDerivative(r, monthlyPayment, totalMonths) {
    let sum = 0;
    for (let n = 1; n <= totalMonths; n++) sum -= n * monthlyPayment / Math.pow(1 + r, n + 1);
    return sum;
}

/**
 * Calculates the monthly payment (loan + insurance).
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
 * Returns ANNUAL income.
 */
export function extractIncomes() {
    let cumulIncomes = 0;
    const incomesContainer = document.getElementById('incomes-container');
    const incomeContainers = incomesContainer.querySelectorAll('.income-container');
    incomeContainers.forEach(container => {
        const incomeInput = container.querySelector('input[name^="income"]');
        const incomeShareInput = container.querySelector('input[name^="income-share"]');
        const income = incomeInput ? parseFloat(incomeInput.value) || 0 : 0;
        const incomeShare = incomeShareInput ? parseFloat(incomeShareInput.value) || 0 : 0;
        cumulIncomes += income * (incomeShare / 100) * 12; // Annual income
    });
    return cumulIncomes;
}

// ============================================
// LEGACY FUNCTIONS - CORRECTED VERSIONS
// ============================================

/**
 * Calculates cumulative rent losses over time (ANNUAL precision).
 * CORRECTED: Now uses geometric series for rent evolution.
 * @param {number} monthlyRent - Monthly rent amount
 * @param {number} rentDuration - Duration in years
 * @param {number} annualRentRate - Annual rent evolution rate (as decimal)
 * @param {number} annualRentingHousingTax - Annual renting housing tax
 * @param {number} annualRentingPropertyTaxRate - Annual property tax evolution rate for renting
 * @returns {Array} Array of cumulative rent losses for each year
 */
export function calculateRentLosses(monthlyRent, rentDuration, annualRentRate, annualRentingHousingTax, annualRentingPropertyTaxRate = 0) {
    const rentLosses = [];
    for (let year = 1; year <= rentDuration; year++) {
        // Cumulative property tax (geometric series - annual compounding)
        const cumulRentingHousingTax = annualRentingPropertyTaxRate === 0
            ? annualRentingHousingTax * year
            : annualRentingHousingTax * (Math.pow(1 + annualRentingPropertyTaxRate, year) - 1) / annualRentingPropertyTaxRate;

        // Cumulative rent (geometric series - CORRECTED)
        // Formula: 12 * monthlyRent * ((1 + rate)^year - 1) / rate
        const cumulRent = annualRentRate === 0
            ? monthlyRent * 12 * year  // Constant rent
            : 12 * monthlyRent * (Math.pow(1 + annualRentRate, year) - 1) / annualRentRate;

        rentLosses.push(cumulRentingHousingTax + Math.round(cumulRent));
    }
    return rentLosses;
}

/**
 * Finds the pivot year where renting becomes more expensive than buying.
 * CORRECTED: Now uses geometric series for rent evolution and aligns with calculateRentLosses.
 * @param {number} price - Property price
 * @param {number} notaryFees - Notary fees (already calculated)
 * @param {number} agencyCommissionFees - Agency commission fees (already calculated)
 * @param {number} contribution - Personal contribution
 * @param {number} monthlyPayment - Monthly loan payment (including insurance)
 * @param {number} annualPropertyTax - Annual property tax
 * @param {number} annualBuyHousingTax - Annual buy housing tax
 * @param {number} annualRentingHousingTax - Annual renting housing tax
 * @param {number} annualAppreciationRate - Annual property appreciation rate
 * @param {number} maxDuration - Maximum duration in years
 * @param {number} loanDuration - Loan duration in years
 * @param {number} monthlyRent - Monthly rent
 * @param {number} annualRentRate - Annual rent evolution rate
 * @param {number} annualIncomes - Annual incomes
 * @param {number} annualCoOwnershipFees - Annual co-ownership fees
 * @param {number} fileFees - File fees
 * @param {number} annualPropertyTaxRate - Annual property tax evolution rate
 * @param {number} annualRentingPropertyTaxRate - Annual renting property tax evolution rate
 * @returns {number} Pivot year (integer)
 */
export function findPivotYear(
    price, notaryFees, agencyCommissionFees, contribution,
    monthlyPayment, annualPropertyTax, annualBuyHousingTax, annualRentingHousingTax,
    annualAppreciationRate, maxDuration, loanDuration, monthlyRent, annualRentRate,
    annualIncomes, annualCoOwnershipFees, fileFees, annualPropertyTaxRate, annualRentingPropertyTaxRate = 0
) {
    const initialCost = price + notaryFees + agencyCommissionFees + fileFees + contribution;

    for (let year = 1; year <= maxDuration; year++) {
        // Property value
        const resaleValue = price * Math.pow(1 + annualAppreciationRate, year);

        // Cumulative loan payments
        const cumulMonthlyPayments = year <= loanDuration
            ? monthlyPayment * 12 * year
            : monthlyPayment * 12 * loanDuration;

        // Cumulative property tax (geometric series)
        const cumulPropertyTax = annualPropertyTaxRate === 0
            ? annualPropertyTax * year
            : annualPropertyTax * (Math.pow(1 + annualPropertyTaxRate, year) - 1) / annualPropertyTaxRate;

        // Cumulative buy housing tax
        const cumulBuyHousingTax = annualBuyHousingTax * year;

        // Cumulative co-ownership fees
        const cumulativeCoOwnershipFees = annualCoOwnershipFees * year;

        // Net purchase losses
        const netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax +
                                    cumulBuyHousingTax + cumulativeCoOwnershipFees -
                                    resaleValue - (annualIncomes * year);

        // Cumulative rent (geometric series - CORRECTED)
        const cumulRent = annualRentRate === 0
            ? monthlyRent * 12 * year
            : 12 * monthlyRent * (Math.pow(1 + annualRentRate, year) - 1) / annualRentRate;

        // Cumulative renting property tax (geometric series)
        const cumulRentingHousingTax = annualRentingPropertyTaxRate === 0
            ? annualRentingHousingTax * year
            : annualRentingHousingTax * (Math.pow(1 + annualRentingPropertyTaxRate, year) - 1) / annualRentingPropertyTaxRate;

        // Net rent losses (FIXED: subtract incomes for consistency)
        const netRentLosses = cumulRent + cumulRentingHousingTax - (annualIncomes * year);

        if (netRentLosses > netPurchaseLosses) {
            return year - 1;
        }
    }

    console.log('No crossing before ', maxDuration, ' years');
    return maxDuration;
}

/**
 * Calculates cumulative purchase losses over time (ANNUAL precision).
 * @param {number} price - Property price
 * @param {number} notaryFees - Notary fees (already calculated)
 * @param {number} agencyCommissionFees - Agency commission fees (already calculated)
 * @param {number} contribution - Personal contribution
 * @param {number} monthlyPayment - Monthly loan payment
 * @param {number} annualPropertyTax - Annual property tax
 * @param {number} annualBuyHousingTax - Annual buy housing tax
 * @param {number} annualAppreciationRate - Annual property appreciation rate
 * @param {number} maxDuration - Maximum duration in years
 * @param {number} loanDuration - Loan duration in years
 * @param {number} annualIncomes - Annual incomes
 * @param {number} annualCoOwnershipFees - Annual co-ownership fees
 * @param {number} fileFees - File fees
 * @param {number} annualPropertyTaxRate - Annual property tax evolution rate
 * @returns {Array} Array of cumulative purchase losses for each year
 */
export function calculatePurchaseLosses(
    price, notaryFees, agencyCommissionFees, contribution,
    monthlyPayment, annualPropertyTax, annualBuyHousingTax, annualAppreciationRate,
    maxDuration, loanDuration, annualIncomes, annualCoOwnershipFees, fileFees,
    annualPropertyTaxRate
) {
    const purchaseLosses = [];
    const initialCost = price + notaryFees + agencyCommissionFees + fileFees + contribution;

    for (let year = 1; year <= maxDuration; year++) {
        const resaleValue = price * Math.pow(1 + annualAppreciationRate, year);
        const cumulMonthlyPayments = year <= loanDuration
            ? monthlyPayment * 12 * year
            : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = annualPropertyTaxRate === 0
            ? annualPropertyTax * year
            : annualPropertyTax * (Math.pow(1 + annualPropertyTaxRate, year) - 1) / annualPropertyTaxRate;
        const cumulBuyHousingTax = annualBuyHousingTax * year;
        const cumulativeCoOwnershipFees = annualCoOwnershipFees * year;

        const netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax +
                                cumulBuyHousingTax + cumulativeCoOwnershipFees -
                                resaleValue - (annualIncomes * year);

        const roundedLosses = Math.round(netPurchaseLosses);
        purchaseLosses.push(Math.max(0, roundedLosses));
    }

    return purchaseLosses;
}

// ============================================
// FORM UTILITY FUNCTIONS
// ============================================

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
 * Uses safe access to handle missing elements (for tests).
 */
export function getFormValues() {
    const getValue = (id, divisor = 1) => {
        const element = document.getElementById(id);
        return element ? (parseFloat(element.value) / divisor) || 0 : 0;
    };
    return {
        insuranceRate: getValue('insurance-rate', 100),
        interestRate: getValue('interest-rate', 100),
        fileFees: getValue('file-fees'),
        price: getValue('price'),
        notary: getValue('notary', 100),
        agencyCommission: getValue('agency-commission', 100),
        contribution: getValue('contribution'),
        loanDuration: getValue('loanDuration'),
        rentingPropertyTaxRate: getValue('rentingPropertyTaxRate', 100),
    };
}
