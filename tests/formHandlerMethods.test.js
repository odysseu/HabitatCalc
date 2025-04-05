// Description: Tests for form-handler.js
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
require('@testing-library/jest-dom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptContentForm = fs.readFileSync(path.resolve(__dirname, '../form-handler.js'), 'utf8');

let dom;
let container;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  container = dom.window.document.body;
  const scriptElement = dom.window.document.createElement('script');
  scriptElement.textContent = scriptContentForm;
  dom.window.document.head.appendChild(scriptElement);
});

test('vérifie que les fonctions existent', () => {
  expect(typeof dom.window.resetForm).toBe('function');
  expect(typeof dom.window.calculateTAEG).toBe('function');
  expect(typeof dom.window.addIncome).toBe('function');
  expect(typeof dom.window.deleteIncome).toBe('function');
  expect(typeof dom.window.extractIncomes).toBe('function');
  expect(typeof dom.window.isValidNumber).toBe('function');
  expect(typeof dom.window.calculerMensualite).toBe('function');
  expect(typeof dom.window.trouverAnneePertesInferieures).toBe('function');
  expect(typeof dom.window.calculerPertesAchat).toBe('function');
  expect(typeof dom.window.calculerPertesLocation).toBe('function');
});

test('vérifie que les éléments du DOM sont utilisés correctement', () => {
  const priceInput = container.querySelector('#price');
  expect(priceInput).toBeInTheDocument();
  const notaryInput = container.querySelector('#notary');
  expect(notaryInput).toBeInTheDocument();

//   // Test resetForm function
//   dom.window.resetForm();
//   expect(container.querySelector('#resultat').innerHTML).toBe('');
//   const canvas = container.querySelector('#myChart');
//   const context = canvas.getContext('2d');
//   expect(context.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)).toBe(false);

  // Test addIncome function
  const incomeInput = container.querySelector('input[name="income-0"]');
  const incomeShareInput = container.querySelector('input[name="income-share-0"]');
  incomeInput.value = '1000';
  incomeShareInput.value = '50';
  dom.window.addIncome();
  expect(container.querySelectorAll('.income-container').length).toBe(2);
  expect(incomeInput.value).toBe('');
  expect(incomeShareInput.value).toBe('');

  // Test deleteIncome function
  const incomeContainers = container.querySelectorAll('.income-container');
  const removeButton = incomeContainers[1].querySelector('button');
  dom.window.deleteIncome(removeButton);
  expect(container.querySelectorAll('.income-container').length).toBe(1);

  // Test extractIncomes function
  incomeInput.value = '1200';
  incomeShareInput.value = '75';
  dom.window.addIncome();
  const cumulIncomes = dom.window.extractIncomes();
  expect(cumulIncomes).toBeCloseTo(1200 * (75 / 100) * 12);

  // Test trouverAnneePertesInferieures function
  // trouverAnneePertesInferieures(price, notaryFees, commisionFees, contribution, mensualite, propertyTax, appreciationRate, duree, laonDuration, fictitiousRent, fictitiousRentRate, cumulIncomes)
  const anneePertes = dom.window.trouverAnneePertesInferieures(
    200000,                 // price
    (8/100) * 200000,       // notaryFees
    0,                      // fraisCommision
    5000,                   // contribution
    1000,                   // mensualite
    1000,                   // propertyTax
    0.02,                   // appreciationRate
    30,                     // duree
    20,                     // laonDuration
    1100,                   // fictitiousRent
    0.01,                   // fictitiousRentRate
    0,                      // cumulIncomes
    0                       // coOwnershipFees
  );
  expect(anneePertes).toEqual(2);

  // Test calculerMensualite function avec zéro emprunt
  const mensualite0 = dom.window.calculerMensualite(0, 20, 1/100, 0);
  expect(mensualite0).toEqual(0);

  // Test calculerMensualite function avec zéro emprunt
  const taegDefault = dom.window.calculateTAEG();
  expect(taegDefault).toBeCloseTo(10, 0);
  
  // Test calculerMensualite function avec un emprunt de 324000 sur 20 ans à 1% d'intérêt
  const mensualite324000 = dom.window.calculerMensualite(324000, 20, 1/100, 0);
  expect(mensualite324000).toBeCloseTo(1490, 0);
  

  // Test calculerPertesAchat function
  const pertesAchat = dom.window.calculerPertesAchat(200000, 10000, 5000, 50000, 1000, 1000, 0.02, 30, 20, cumulIncomes, 0);
  expect(pertesAchat.length).toEqual(30);

  // Test calculerPertesAchat function
  const pertesAchatOneYear = dom.window.calculerPertesAchat(300000, 17000, 6000, 50000, 0, 0, 0, 1, 1, 0, 0);
  expect(pertesAchatOneYear).toEqual([17000 + 6000 - 50000]);

  // Test calculerPertesLocation function
  const pertesLocation = dom.window.calculerPertesLocation(1500, 30, 0.03);
  console.log("pertesLocation: ", pertesLocation);
  expect(pertesLocation.length).toEqual(30);
});
