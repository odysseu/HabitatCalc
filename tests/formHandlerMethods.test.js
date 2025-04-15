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
let htmlBody;
let domWindow;

beforeEach(() => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  domWindow = dom.window;
  htmlBody = domWindow.document.body;
  const scriptElement = domWindow.document.createElement('script');
  scriptElement.textContent = scriptContentForm;
  domWindow.document.head.appendChild(scriptElement);
});

// method to log incomes
function logIncomeInputs(text) {
  let inputs = domWindow.document.querySelectorAll('input[name^="income-"]');
  let inputValues = {};
  inputs.forEach(input => {
    inputValues[input.name] = input.value;
  });
  console.log(text, " :\n", inputValues);
}

test('vérifie que les fonctions existent', () => {
  expect(typeof domWindow.resetForm).toBe('function');
  expect(typeof domWindow.calculateAPR).toBe('function');
  expect(typeof domWindow.addIncome).toBe('function');
  expect(typeof domWindow.deleteIncome).toBe('function');
  expect(typeof domWindow.extractIncomes).toBe('function');
  expect(typeof domWindow.isValidNumber).toBe('function');
  expect(typeof domWindow.calculateMonthlyPayment).toBe('function');
  expect(typeof domWindow.trouverAnneePertesInferieures).toBe('function');
  expect(typeof domWindow.calculatePurchaseLosses).toBe('function');
  expect(typeof domWindow.calculateRentLosses).toBe('function');
});

test('vérifie que les éléments du DOM sont utilisés correctement', () => {
  const priceInput = htmlBody.querySelector('#price');
  expect(priceInput).toBeInTheDocument();
  const notaryInput = htmlBody.querySelector('#notary');
  expect(notaryInput).toBeInTheDocument();

  //   // Test resetForm function
  //   domWindow.resetForm();
  //   expect(htmlBody.querySelector('#simulation').innerHTML).toBe('');
  //   const canvas = htmlBody.querySelector('#myChart');
  //   const context = canvas.getContext('2d');
  //   expect(context.getImageData(0, 0, canvas.width, canvas.height).data.some(channel => channel !== 0)).toBe(false);

  // const container = document.getElementById('incomes-container');
  // // Get values from the first fields
  // const currentIncomeValue = container.querySelector('input[name="income-0"]').value.trim();
  // const currentTimeShareValue = container.querySelector('input[name="income-share-0"]').value.trim();
  // Test addIncome function
  let incomeInput0 = htmlBody.querySelectorAll('input[name="income-0"]');
  let incomeShareInput0 = htmlBody.querySelectorAll('input[name="income-share-0"]');

  expect(incomeInput0.value).toBe(undefined);
  expect(incomeShareInput0.value).toBe(undefined);
  incomeInput0.value = '1000';
  incomeShareInput0.value = '50';
  expect(incomeInput0.value).toBe('1000');
  expect(incomeShareInput0.value).toBe('50');
  let totalIncome = domWindow.extractIncomes();
  expect(totalIncome).toBe(0);
  // logIncomeInputs("Before addIncome");
  // domWindow.addIncome();
  // logIncomeInputs("After addIncome");
  // totalIncome = domWindow.extractIncomes();
  // expect(totalIncome).toBeCloseTo(1000 * 50/100 * 12, 2);
  // const incomeInput1 = domWindow.document.querySelectorAll('input[name="income-1"]');
  // const incomeShareInput1 = domWindow.document.querySelectorAll('input[name="income-share-1"]');
  // expect(incomeInput1.value).toBe(1000);
  // expect(incomeShareInput1.value).toBe(50);
  // incomeInput0 = htmlBody.querySelectorAll('input[name="income-0"]');
  // incomeShareInput0 = htmlBody.querySelectorAll('input[name="income-share-0"]');
  // expect(incomeInput0.value).toBe(undefined);
  // expect(incomeShareInput0.value).toBe(undefined);
  // totalIncome = domWindow.extractIncomes();
  // expect(totalIncome).toBeCloseTo(1000 * 50/100 * 12, 2);
  // const incomeContainer = htmlBody.querySelectorAll('.income-container');
  // expect(incomeContainer.length).toBe(3);
  // // test added values
  // const currentIncomeValue = htmlBody.querySelector('input[name="income-1"]').value.trim();
  // const currentTimeShareValue = htmlBody.querySelector('input[name="income-share-1"]').value.trim();
  // logIncomeInputs();
  // expect(currentIncomeValue).toBe(undefined);
  // expect(currentTimeShareValue).toBe(undefined);
  // // Test deleteIncome function
  // const removeButton = incomeContainer[1].querySelector('button');
  // domWindow.deleteIncome(removeButton);
  // expect(htmlBody.querySelectorAll('.income-container').length).toBe(2);
  //
  // // Test extractIncomes function
  // const cumulIncomes0 = domWindow.extractIncomes();
  // const incomeInput = htmlBody.querySelectorAll('input[name="income-0"]');
  // const incomeShareInput = htmlBody.querySelectorAll('input[name="income-share-0"]');
  // incomeInput.value = '1200';
  // incomeShareInput.value = '75';
  // domWindow.addIncome();
  // const cumulIncomes = domWindow.extractIncomes();
  // expect(cumulIncomes).toBeCloseTo(cumulIncomes0 + 1200 * (75 / 100) * 12);

  // Test trouverAnneePertesInferieures function
  // trouverAnneePertesInferieures(price, notaryFees, commisionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes)
  const lossesYear = domWindow.trouverAnneePertesInferieures(
    200000,                 // price
    (8/100) * 200000,       // notaryFees
    0,                      // commissionFees
    5000,                   // contribution
    1000,                   // monthlyPayment
    1000,                   // propertyTax
    0.02,                   // appreciationRate
    30,                     // maxDuration
    20,                     // loanDuration
    1100,                   // fictitiousRent
    0.01,                   // fictitiousRentRate
    0,                      // cumulIncomes
    0                       // coOwnershipFees
  );
  expect(lossesYear).toEqual(2);

  // Test calculateMonthlyPayment function with zero loan
  const monthlyPayment0 = domWindow.calculateMonthlyPayment(0, 20, 1/100, 0);
  expect(monthlyPayment0).toEqual(0);

  // Test calculateMonthlyPayment function with zero loan
  const aprDefault = domWindow.calculateAPR();
  expect(aprDefault).toBeCloseTo(10, 0);
  
  // Test calculateMonthlyPayment function with a 324000 loan on 20 years at 1% interest rate
  const monthlyPayment324000 = domWindow.calculateMonthlyPayment(324000, 20, 1/100, 0);
  expect(monthlyPayment324000).toBeCloseTo(1490, 0);
  

  // Test calculatePurchaseLosses function
  const purchaseLosses = domWindow.calculatePurchaseLosses(200000, 10000, 5000, 50000, 1000, 1000, 0.02, 30, 20, cumulIncomes, 0);
  expect(purchaseLosses.length).toEqual(30);

  // Test calculatePurchaseLosses function
  const purchaseLossesOneYear = domWindow.calculatePurchaseLosses(300000, 17000, 6000, 50000, 0, 0, 0, 1, 1, 0, 0);
  expect(purchaseLossesOneYear).toEqual([17000 + 6000 - 50000]);

  // Test calculateRentLosses function
  const rentLosses = domWindow.calculateRentLosses(1500, 30, 0.03);
  console.log("rentLosses: ", rentLosses);
  expect(rentLosses.length).toEqual(30);
});
