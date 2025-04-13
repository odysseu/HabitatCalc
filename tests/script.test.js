global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptContentForm = fs.readFileSync(path.resolve(__dirname, '../form-handler.js'), 'utf8');
const scriptContentDarkMode = fs.readFileSync(path.resolve(__dirname, '../dark-mode.js'), 'utf8');
// const scriptContentWelcomeMessage = fs.readFileSync(path.resolve(__dirname, '../welcome-message-handler.js'), 'utf8');

let dom;
let htmlBody;
let htmlHead;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  htmlBody = dom.window.document.body;
  htmlHead = dom.window.document.head;

  // Inject form-handler.js
  const scriptElementForm = dom.window.document.createElement('script');
  scriptElementForm.textContent = scriptContentForm;
  dom.window.document.head.appendChild(scriptElementForm);

  // Inject dark-mode.js
  const scriptElementDarkMode = dom.window.document.createElement('script');
  scriptElementDarkMode.textContent = scriptContentDarkMode;
  dom.window.document.head.appendChild(scriptElementDarkMode);

});

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
test('vérifie que les identifiants utilisés dans form-handler.js existent', () => {
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
  const calculerButton = htmlBody.querySelector('#calculate-button');
  const rapportBouton = htmlBody.querySelector('#report-button');

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
  expect(calculerButton).toBeInTheDocument();
  expect(rapportBouton).toBeInTheDocument();
});

// Tests que les fonctions utilisées dans form-handler.js existent
test('vérifie que les fonctions utilisées dans form-handler.js existent', () => {
  expect(typeof dom.window.resetForm).toBe('function');
  expect(typeof dom.window.addIncome).toBe('function');
  expect(typeof dom.window.deleteIncome).toBe('function');
  expect(typeof dom.window.extractIncomes).toBe('function');
  expect(typeof dom.window.calculateMonthlyPayment).toBe('function');
  expect(typeof dom.window.trouverAnneePertesInferieures).toBe('function');
  expect(typeof dom.window.calculatePurchaseLosses).toBe('function');
  expect(typeof dom.window.calculerPertesLocation).toBe('function');
});

// Tests que les fonctions utilisées dans dark-mode.js existent
test('vérifie que les fonctions utilisées dans dark-mode.js existent', () => {
  expect(typeof dom.window.forcerModeClair).toBe('function');
  expect(typeof dom.window.restaurerMode).toBe('function');
});
