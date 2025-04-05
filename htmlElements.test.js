global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

let dom;
let htmlBody;
let htmlHead;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  htmlBody = dom.window.document.body;
  htmlHead = dom.window.document.head;
});

test('vérifie que les identifiants utilisés dans welcome-message-handler.js existent', () => {
  const welcomeMessage = htmlBody.querySelector('#welcome-message');
  const closeWelcome = htmlBody.querySelector('#close-welcome');

  expect(welcomeMessage).toBeInTheDocument();
  expect(closeWelcome).toBeInTheDocument();
});

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

test('vérifie que les identifiants utilisés dans form-handler.js existent', () => {
  const form = htmlBody.querySelector('#calculette-form');
  const resultat = htmlBody.querySelector('#resultat');
  const myChart = htmlBody.querySelector('#myChart');
  const incomesContainer = htmlBody.querySelector('#incomes-container');
  const priceInput = htmlBody.querySelector('#price');
  const notaryInput = htmlBody.querySelector('#notary');
  const coOwnershipInput = htmlBody.querySelector('#coOwnership');
  const appreciationRateInput = htmlBody.querySelector('#appreciation-rate');
  const fictitiousRentRateInput = htmlBody.querySelector('#fictitiousRentRate');
  const commissionInput = htmlBody.querySelector('#commission');
  const contributionInput = htmlBody.querySelector('#contribution');
  const interestRateInput = htmlBody.querySelector('#interest-rate');
  const laonDurationInput = htmlBody.querySelector('#laonDuration');
  const insuranceRateInput = htmlBody.querySelector('#insuranceRate');
  const fictitiousRentInput = htmlBody.querySelector('#fictitiousRent');
  const HousingTaxInput = htmlBody.querySelector('#HousingTax');
  const propertyTaxInput = htmlBody.querySelector('#propertyTax');
  const calculerButton = htmlBody.querySelector('#calculate-button');
  const rapportBouton = htmlBody.querySelector('#rapport-bouton');

  expect(form).toBeInTheDocument();
  expect(resultat).toBeInTheDocument();
  expect(myChart).toBeInTheDocument();
  expect(incomesContainer).toBeInTheDocument();
  expect(priceInput).toBeInTheDocument();
  expect(notaryInput).toBeInTheDocument();
  expect(coOwnershipInput).toBeInTheDocument();
  expect(appreciationRateInput).toBeInTheDocument();
  expect(fictitiousRentRateInput).toBeInTheDocument();
  expect(commissionInput).toBeInTheDocument();
  expect(contributionInput).toBeInTheDocument();
  expect(interestRateInput).toBeInTheDocument();
  expect(laonDurationInput).toBeInTheDocument();
  expect(insuranceRateInput).toBeInTheDocument();
  expect(fictitiousRentInput).toBeInTheDocument();
  expect(HousingTaxInput).toBeInTheDocument();
  expect(propertyTaxInput).toBeInTheDocument();
  expect(calculerButton).toBeInTheDocument();
  expect(rapportBouton).toBeInTheDocument();
});
