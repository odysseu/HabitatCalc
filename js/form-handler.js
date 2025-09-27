// description: This script handles the form submission, validation, and calculation of APR and other financial metrics.
import { loadTranslations, updateContent } from './handle-language.js';
import { generateReport } from './report-handler.js';

export async function resetForm() {
    // Properly reset the incomes-container by setting its innerHTML
    document.getElementById('incomes-container').innerHTML = '<div class="income-container"> <div class="income-inputs"> <input type="number" id="income-0" name="income-0" placeholder="Revenu mensuel (€)" required> <input type="number" step="0.01" id="income-share-0" name="income-share-0" placeholder="Durée (% de l\'année)" required> </div> <button type="button" id="change-income-button">+</button> </div>';
    // console.log("First incomes-container:", document.getElementById('incomes-container').innerHTML);
    document.getElementById('form-calculator').reset();
    // console.log("Second incomes-container:", document.getElementById('incomes-container').innerHTML);
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
    // console.log("third incomes-container:", document.getElementById('incomes-container').innerHTML);
    updateContent(translation);
    // console.log("Final incomes-container:", document.getElementById('incomes-container').innerHTML);
}
/**
 * Calculates the Annual Percentage Rate (APR) based on form values.
 * Note: This is a simplified estimation and does not follow the official APR calculation (which requires solving for the rate in the present value equation of all cash flows).
 */
export function calculateAPR() {
    const insuranceRate = parseFloat(document.getElementById('insurance-rate').value) / 100 || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100 || 0;
    const fileFees = parseFloat(document.getElementById('file-fees').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const notary = parseFloat(document.getElementById('notary').value) / 100 || 0;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100 || 0;
    const contribution = parseFloat(document.getElementById('contribution').value) || 0;
    const loanDuration = parseFloat(document.getElementById('loanDuration').value) || 0;

    const notaryFees = price * notary;
    const commissionFees = price * agencyCommission;
    const borrowedAmount = Math.max(0, price + notaryFees + commissionFees + fileFees - contribution);

    if (borrowedAmount <= 0 || loanDuration <= 0) {
        console.warn('Invalid borrowed amount or loan duration:', borrowedAmount, loanDuration);
        return 0;
    }

    // Calculate total monthly payment (loan + insurance)
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    // console.log('Monthly payment calculated:', monthlyPayment);

    // Official APR calculation requires solving for the rate (r) in the equation:
    // borrowedAmount = Σ [monthlyPayment / (1 + r)^n], for n = 1 to total months
    // We'll use the Newton-Raphson method for approximation

    const totalMonths = loanDuration * 12;
    let guess = interestRate / 12; // initial guess (monthly rate)
    let aprMonthly = guess;
    let epsilon = 1e-7;
    let maxIter = 10000;

    function f(r) {
        let sum = 0;
        for (let n = 1; n <= totalMonths; n++) {
            sum += monthlyPayment / Math.pow(1 + r, n);
        }
        return sum - borrowedAmount;
    }

    function fPrime(r) {
        let sum = 0;
        for (let n = 1; n <= totalMonths; n++) {
            sum -= n * monthlyPayment / Math.pow(1 + r, n + 1);
        }
        return sum;
    }

    // Newton-Raphson iteration
    for (let i = 0; i < maxIter; i++) {
        let y = f(aprMonthly);
        let yPrime = fPrime(aprMonthly);
        if (Math.abs(yPrime) < 1e-10) break; // Avoid division by zero
        let next = aprMonthly - y / yPrime;
        if (Math.abs(next - aprMonthly) < epsilon) {
            aprMonthly = next;
            break;
        }
        aprMonthly = next;
    }

    // APR annualized and as a percentage
    let apr = aprMonthly * 12 * 100;
    // console.log('APR calculated:', apr);
    return apr > 0 && isFinite(apr) ? apr : 0;
}


export function addIncome() {
    const container = document.getElementById('incomes-container');
    const incomeContainers = container.querySelectorAll('.income-container');
    const incomeCount = incomeContainers.length;

    // Récupérer les valeurs du dernier conteneur
    const lastIncomeContainer = incomeContainers[0];
    const currentIncomeValue = lastIncomeContainer.querySelector('input[name^="income-"]').value.trim();
    const currentTimeShareValue = lastIncomeContainer.querySelector('input[name^="income-share-"]').value.trim();

    // Verify that inputs are valid numbers and within expected ranges
    if (!isValidNumber(currentIncomeValue) || !isValidPercentage(currentTimeShareValue)) {
        console.log("Invalid input detected:", {
            income: currentIncomeValue,
            duration: currentTimeShareValue
        });
        return;
    }

    // Créer un nouveau conteneur
    const newIncomeContainer = document.createElement('div');
    newIncomeContainer.className = 'income-container';

    // Créer la div pour les inputs
    const incomeInputsDiv = document.createElement('div');
    incomeInputsDiv.className = 'income-inputs';

    // create income inputs
    const inputIncome = document.createElement('input');
    inputIncome.type = 'number';
    inputIncome.id = `income-${incomeCount}`;
    inputIncome.name = `income-${incomeCount}`;
    inputIncome.placeholder = 'Revenu mensuel (€)';
    inputIncome.required = true;
    inputIncome.value = currentIncomeValue;

    const inputDuration = document.createElement('input');
    inputDuration.type = 'number';
    inputDuration.step = '0.01';
    inputDuration.id = `income-share-${incomeCount}`;
    inputDuration.name = `income-share-${incomeCount}`;
    inputDuration.placeholder = 'Durée (% de l\'année)';
    inputDuration.required = true;
    inputDuration.value = currentTimeShareValue;

    // Add inputs to the div
    incomeInputsDiv.appendChild(inputIncome);
    incomeInputsDiv.appendChild(inputDuration);
    newIncomeContainer.appendChild(incomeInputsDiv);

    // create delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'change-income-button';
    deleteButton.textContent = '-';
    deleteButton.onclick = function() { deleteIncome(this); };

    // Add delete button to the new income container
    newIncomeContainer.appendChild(deleteButton);

    // Add the new income container to the main container
    container.appendChild(newIncomeContainer);

    // Reset the input fields in the last container
    lastIncomeContainer.querySelector('input[name^="income-"]').value = "";
    lastIncomeContainer.querySelector('input[name^="income-share-"]').value = "";
}

function isValidNumber(value) {
    try {
        if (value === "" || value === null || value === undefined) {
            return false;
        }

        const num = parseFloat(value);
        return !isNaN(num) && isFinite(num) && num >= 0;
    } catch (error) {
        console.warn("Error checking if value is a valid number:", { value, error });
        return false;
    }
}

function isValidPercentage(value) {
    try {
        if (value === "" || value === null || value === undefined) {
            return false;
        }

        const num = parseFloat(value);
        return !isNaN(num) && isFinite(num) && num >= 0 && num <= 100;
    } catch (error) {
        console.warn("Error checking if value is a valid percentage:", { value, error });
        return false;
    }
}

export function deleteIncome(button) {
    const incomeContainer = button.parentElement;
    incomeContainer.remove();
    generateReport();
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
    const monthlyInterestRate = interestRateAnnuel / 12;
    const loanMonthlyPayment = interestRateAnnuel === 0
        ? borrowedAmount / numberMonths
        : (borrowedAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberMonths));
    const assuranceMonthlyPayment = borrowedAmount * (insuranceRate / 12);
    
    return loanMonthlyPayment + assuranceMonthlyPayment;
}


export function findPivotYear(price, notaryFees, agencyCommisionFees, contribution, monthlyPayment, propertyTax, buyHousingTax, rentingHousingTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees) {
    const initialCost = price + notaryFees + agencyCommisionFees + fileFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        // Purchase
        const resaleValue = price * Math.pow(1 + appreciationRate, t);
        const cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulBuyHousingTax = buyHousingTax * t;
        const cumulativeCoOwnershipFees = coOwnershipFees * t;
        const netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax + cumulBuyHousingTax + cumulativeCoOwnershipFees - resaleValue - cumulIncomes;
        // rent
        const cumulRentingHousingTax = rentingHousingTax * t;
        const netRentLosses = cumulRentingHousingTax + (fictitiousRent * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        if (netRentLosses > netPurchaseLosses) {
            return t - 1; // crossing of losses
        }
    }
    console.log('No crossing before ', maxDuration, ' years');
    return maxDuration; // no crossing of losses
}

export function calculatePurchaseLosses(price, notaryFees, agencyCommisionFees, contribution, monthlyPayment, propertyTax, buyHousingTax, appreciationRate, maxDuration, loanDuration, cumulIncomes, coOwnershipFees, fileFees) {
    const purchaseLosses = [];
    const initialCost = price + notaryFees + agencyCommisionFees + fileFees - contribution;
    for (let t = 1; t <= maxDuration; t++) {
        const resaleValue = price * Math.pow(1 + appreciationRate, t);
        const cumulMonthlyPayments = t <= loanDuration ? monthlyPayment * 12 * t : monthlyPayment * 12 * loanDuration;
        const cumulPropertyTax = propertyTax * t;
        const cumulBuyHousingTax = buyHousingTax * t;
        const cumulativeCoOwnershipFees = coOwnershipFees * t;
        let netPurchaseLosses = initialCost + cumulMonthlyPayments + cumulPropertyTax  + cumulBuyHousingTax + cumulativeCoOwnershipFees - resaleValue - cumulIncomes;
        netPurchaseLosses = Math.round(netPurchaseLosses, 0);
        purchaseLosses.push(netPurchaseLosses);
    }
    return purchaseLosses;
}

export function calculateRentLosses(income, rentDuration, fictitiousRentRate, rentingHousingTax) {
    const rentLosses = [];
    for (let t = 1; t <= rentDuration; t++) {
        let cumulRentingHousingTax = rentingHousingTax * t;
        let cumulIncome = (income * Math.pow(1 + fictitiousRentRate, t)) * 12 * t;
        cumulIncome = Math.round(cumulIncome, 0);
        rentLosses.push(cumulRentingHousingTax + cumulIncome);
    }
    return rentLosses;
}
