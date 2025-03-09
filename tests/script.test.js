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
  expect(tauxAssuranceInput).toBeInTheDocument();
  expect(tauxLoyerFictifInput).toBeInTheDocument();
  expect(commissionInput).toBeInTheDocument();
  expect(apportInput).toBeInTheDocument();
  expect(tauxInteretInput).toBeInTheDocument();
  expect(dureePretInput).toBeInTheDocument();
  expect(loyerFictifInput).toBeInTheDocument();
  expect(taxeHabitationInput).toBeInTheDocument();
  expect(taxeFonciereInput).toBeInTheDocument();
  expect(calculerButton).toBeInTheDocument();
  expect(rapportBouton).toBeInTheDocument();
});

// Tests que les fonctions utilisées dans form-handler.js existent
test('vérifie que les fonctions utilisées dans form-handler.js existent', () => {
  expect(typeof dom.window.resetForm).toBe('function');
  expect(typeof dom.window.ajouterLoyer).toBe('function');
  expect(typeof dom.window.supprimerLoyer).toBe('function');
  expect(typeof dom.window.extraireLoyers).toBe('function');
  expect(typeof dom.window.trouverAnneePertesInferieures).toBe('function');
  expect(typeof dom.window.calculerPertesAchat).toBe('function');
  expect(typeof dom.window.calculerPertesLocation).toBe('function');
});

// Tests que les fonctions utilisées dans dark-mode.js existent
test('vérifie que les fonctions utilisées dans dark-mode.js existent', () => {
  expect(typeof dom.window.forcerModeClair).toBe('function');
  expect(typeof dom.window.restaurerMode).toBe('function');
});
