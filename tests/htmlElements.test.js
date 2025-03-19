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
  const loyersContainer = htmlBody.querySelector('#loyers-container');
  const prixInput = htmlBody.querySelector('#prix');
  const notaireInput = htmlBody.querySelector('#notaire');
  const coproprieteInput = htmlBody.querySelector('#copropriete');
  const tauxAppreciationInput = htmlBody.querySelector('#taux-appreciation');
  const tauxLoyerFictifInput = htmlBody.querySelector('#taux-loyer-fictif');
  const commissionInput = htmlBody.querySelector('#commission');
  const apportInput = htmlBody.querySelector('#apport');
  const tauxInteretInput = htmlBody.querySelector('#taux-interet');
  const dureePretInput = htmlBody.querySelector('#duree-pret');
  const tauxAssuranceInput = htmlBody.querySelector('#taux-assurance');
  const loyerFictifInput = htmlBody.querySelector('#loyer-fictif');
  const taxeHabitationInput = htmlBody.querySelector('#taxe-habitation');
  const taxeFonciereInput = htmlBody.querySelector('#taxe-fonciere');
  const calculerButton = htmlBody.querySelector('#calculer-button');
  const rapportBouton = htmlBody.querySelector('#rapport-bouton');

  expect(form).toBeInTheDocument();
  expect(resultat).toBeInTheDocument();
  expect(myChart).toBeInTheDocument();
  expect(loyersContainer).toBeInTheDocument();
  expect(prixInput).toBeInTheDocument();
  expect(notaireInput).toBeInTheDocument();
  expect(coproprieteInput).toBeInTheDocument();
  expect(tauxAppreciationInput).toBeInTheDocument();
  expect(tauxLoyerFictifInput).toBeInTheDocument();
  expect(commissionInput).toBeInTheDocument();
  expect(apportInput).toBeInTheDocument();
  expect(tauxInteretInput).toBeInTheDocument();
  expect(dureePretInput).toBeInTheDocument();
  expect(tauxAssuranceInput).toBeInTheDocument();
  expect(loyerFictifInput).toBeInTheDocument();
  expect(taxeHabitationInput).toBeInTheDocument();
  expect(taxeFonciereInput).toBeInTheDocument();
  expect(calculerButton).toBeInTheDocument();
  expect(rapportBouton).toBeInTheDocument();
});
