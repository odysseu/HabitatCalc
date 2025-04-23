
const { addIncome, calculateAPR, extractIncomes, calculateMonthlyPayment, trouverAnneePertesInferieures, calculatePurchaseLosses, calculateRentLosses } = require('../form-handler');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

let dom;
let document;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  document = dom.window.document;
});

describe('form-handler.js methods', () => {
// Tests que les identifiants utilisés dans welcome-message-handler.js existent dans le .html
  test('vérifie que les identifiants utilisés dans welcome-message-handler.js existent', () => {
    const welcomeMessage = htmlBody.querySelector('#welcome-message');
    const closeWelcome = htmlBody.querySelector('#close-welcome');

    expect(welcomeMessage).toBeInTheDocument();
    expect(closeWelcome).toBeInTheDocument();
  });

  // Tests que les identifiants utilisés dans dark-mode.js existent dans le .html
  test('vérifie que les identifiants utilisés dans dark-mode.js existent', () => {
    const toggleSwitch = htmlBody.querySelector('#dark-mode-toggle');
    const homeLogo = htmlBody.querySelector('#home-logo');
    const favicon = htmlHead.querySelector('#favicon');
    const githubLogo = htmlBody.querySelector('#github-logo');

    expect(toggleSwitch).toBeInTheDocument();
    expect(homeLogo).toBeInTheDocument();
    expect(favicon).toBeInTheDocument();
    expect(githubLogo).toBeInTheDocument();
  });

  // Tests que les identifiants utilisés dans form-handler.js existent dans le .html
  test('checks that the elements used in form-handler.js exist', () => {
    const form = htmlBody.querySelector('#form-calculator');
    const simulation = htmlBody.querySelector('#simulation');
    const myChart = htmlBody.querySelector('#myChart');
    const incomesContainer = htmlBody.querySelector('#incomes-container');
    const priceInput = htmlBody.querySelector('#price');
    const notaryInput = htmlBody.querySelector('#notary');
    const coOwnershipInput = htmlBody.querySelector('#coOwnership');
    const appreciationRateInput = htmlBody.querySelector('#appreciation-rate');
    const fictitiousRentRateInput = htmlBody.querySelector('#fictitiousRentRate');
    const agencyCommissionInput = htmlBody.querySelector('#agency-commission');
    const contributionInput = htmlBody.querySelector('#contribution');
    const interestRateInput = htmlBody.querySelector('#interest-rate');
    const loanDurationInput = htmlBody.querySelector('#loanDuration');
    const insuranceRateInput = htmlBody.querySelector('#insuranceRate');
    const fictitiousRentInput = htmlBody.querySelector('#fictitiousRent');
    const HousingTaxInput = htmlBody.querySelector('#HousingTax');
    const propertyTaxInput = htmlBody.querySelector('#propertyTax');
    const calculateButton = htmlBody.querySelector('#calculate-button');
    const reportButton = htmlBody.querySelector('#report-button');

    expect(form).toBeInTheDocument();
    expect(simulation).toBeInTheDocument();
    expect(myChart).toBeInTheDocument();
    expect(incomesContainer).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(notaryInput).toBeInTheDocument();
    expect(coOwnershipInput).toBeInTheDocument();
    expect(appreciationRateInput).toBeInTheDocument();
    expect(insuranceRateInput).toBeInTheDocument();
    expect(fictitiousRentRateInput).toBeInTheDocument();
    expect(agencyCommissionInput).toBeInTheDocument();
    expect(contributionInput).toBeInTheDocument();
    expect(interestRateInput).toBeInTheDocument();
    expect(loanDurationInput).toBeInTheDocument();
    expect(fictitiousRentInput).toBeInTheDocument();
    expect(HousingTaxInput).toBeInTheDocument();
    expect(propertyTaxInput).toBeInTheDocument();
    expect(calculateButton).toBeInTheDocument();
    expect(reportButton).toBeInTheDocument();
  });

  // Tests that the function used in fom-handler.js exist
  test('vérifie que les fonctions utilisées dans form-handler.js existent', () => {
    expect(typeof htmlWindow.resetForm).toBe('function');
    expect(typeof htmlWindow.addIncome).toBe('function');
    expect(typeof htmlWindow.deleteIncome).toBe('function');
    expect(typeof htmlWindow.extractIncomes).toBe('function');
    expect(typeof htmlWindow.calculateMonthlyPayment).toBe('function');
    expect(typeof htmlWindow.trouverAnneePertesInferieures).toBe('function');
    expect(typeof htmlWindow.calculatePurchaseLosses).toBe('function');
    expect(typeof htmlWindow.calculateRentLosses).toBe('function');
  });

  // Tests que les fonctions utilisées dans dark-mode.js existent
  test('vérifie que les fonctions utilisées dans dark-mode.js existent', () => {
    expect(typeof htmlWindow.forcerModeClair).toBe('function');
    expect(typeof htmlWindow.restaurerMode).toBe('function');
  });
});