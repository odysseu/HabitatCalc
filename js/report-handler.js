let myChart = null; // graph variable to store the chart instance

import { calculateMonthlyPayment, extractIncomes, calculateAPR, findPivotYear, calculateRentLosses, calculatePurchaseLosses } from './form-handler.js';
import { loadTranslations } from './handle-language.js';
import { forceLightMode, restoreMode } from './dark-mode.js';

export async function generateReport() {
    // get the values from the form
    const price = parseFloat(document.getElementById('price').value);
    const notary = parseFloat(document.getElementById('notary').value) / 100;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100;
    const contribution = parseFloat(document.getElementById('contribution').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const loanDuration = parseInt(document.getElementById('loanDuration').value);
    const insuranceRate = parseInt(document.getElementById('insurance-rate').value) / 100;
    const fictitiousRent = parseFloat(document.getElementById('fictitiousRent').value);
    const HousingTax = parseFloat(document.getElementById('HousingTax').value);
    const propertyTax = parseFloat(document.getElementById('propertyTax').value);
    const fictitiousRentRate = parseFloat(document.getElementById('fictitiousRentRate').value) / 100;
    const coOwnershipFees = parseFloat(document.getElementById('coOwnership').value);
    const maxDuration = 200;
    const fileFees = parseFloat(document.getElementById('file-fees').value);

    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const purchaseTotal = price + notaryFees + agencyCommissionFees + fileFees;
    const borrowedAmount = purchaseTotal - contribution;
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;
    const cumulIncomes = extractIncomes();
    const cumulMonthlyIncomes = cumulIncomes / 12;
    const APR = calculateAPR();

    const repaymentYear = findPivotYear(price, notaryFees, agencyCommissionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees);
    const maxCalculatedDuration = Math.max(loanDuration, repaymentYear + 4); // 4 more year to see after meeting year
    const cumulRent = calculateRentLosses(fictitiousRent, maxCalculatedDuration, fictitiousRentRate);
    const cumulativePurchase = calculatePurchaseLosses(price, notaryFees, agencyCommissionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxCalculatedDuration, loanDuration, cumulIncomes, coOwnershipFees, fileFees);

    // generate the simulation report board
    let translations;
    const language = document.getElementById('language-select').value;
    translations = await loadTranslations(language);
    // const translations = window.translations; // Assuming translations are loaded globally

    let simulation = `
        <h2>${translations.reportTitle}</h2>

        <div>
            <h3>${translations.reportPurchase}</h3>
            <table>
                <tr>
                    <td>${translations.reportPrice}:</td>
                    <td style="text-align: right;">${price.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportNotaryFees}:</td>
                    <td style="text-align: right;">${notaryFees.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportAppreciationRate}:</td>
                    <td style="text-align: right;">${(appreciationRate * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportAgencyCommission}:</td>
                    <td style="text-align: right;">${agencyCommissionFees.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportPurchaseTotal}:</td>
                    <td style="text-align: right;">${purchaseTotal.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportCoOwnership}:</td>
                    <td style="text-align: right;">${coOwnershipFees.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportLoan}</h3>
            <table>
                <tr>
                    <td>${translations.contribution}:</td>
                    <td style="text-align: right;">${contribution.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportBorrowedAmount}:</td>
                    <td style="text-align: right;">${borrowedAmount.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportInsuranceRate}:</td>
                    <td style="text-align: right;">${(insuranceRate * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportInterestRate}:</td>
                    <td style="text-align: right;">${(interestRate * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportAPR}:</td>
                    <td style="text-align: right;">${APR.toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportMonthlyPayment}:</td>
                    <td style="text-align: right;">${monthlyPayment.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTotalInterests}:</td>
                    <td style="text-align: right;">${totalInterestCost.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportLoanTotalCost}:</td>
                    <td style="text-align: right;">${loanTotalCost.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportFinancing}</h3>
            <table>
                <tr>
                    <td>${translations.reportFictitiousMonthlyRent}:</td>
                    <td style="text-align: right;">${fictitiousRent.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportFictitiousRentEvolutionRate}:</td>
                    <td style="text-align: right;">${(fictitiousRentRate * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportHousingTaxAnnuelle}:</td>
                    <td style="text-align: right;">${HousingTax.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportPropertyTaxAnnuelle}:</td>
                    <td style="text-align: right;">${propertyTax.toFixed(2)} €</td>
                </tr>
    `;

    // add monthly incomes if any
    if (cumulMonthlyIncomes > 0) {
        simulation += `
                <tr>
                    <td>${translations.reportMonthlyAgregatedIncome}:</td>
                    <td style="text-align: right;">${cumulMonthlyIncomes.toFixed(2)} €</td>
                </tr>
        `;
    }

    simulation += `
            </table>
        </div>
        <div>
            <h3>${translations.reportAmortization}</h3>
            <p>${translations.reportRepaymentYear}: ${repaymentYear}</p>
        </div>
    `;

    document.getElementById('simulation').innerHTML = simulation;
    // Générer le graphique
    genererGraphique(cumulRent, cumulativePurchase, maxCalculatedDuration);

    const reportButton = `
        <label for="pdf-filename">${translations.pdfFileName}</label>
        <input type="text" id="pdf-filename" name="pdf-filename" placeholder=${translations.pdfFileNamePlaceHolder} required>
        <button id="download-button">${translations.downloadPDF}</button>
    `;

    document.getElementById('report-button').innerHTML = reportButton;

    // Attacher l'événement de téléchargement au bouton
    document.getElementById('download-button').addEventListener('click', downloadPDF);
}

export async function genererGraphique(cumulRent, cumulativePurchase, maxDuration) {
    // 1. Destroy the cart if it exists
    if (myChart) {
        myChart.destroy();
    }

    // 2. get the canvas element and adjust size
    const ctx = document.getElementById('myChart').getContext('2d');
    const canvas = ctx.canvas;
    const parent = canvas.parentNode;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    // Adjust the size of the canvas for all displays
    canvas.width = parentWidth;
    canvas.height = parentHeight;
    // Load translations for the chart
    let translations;
    const language = document.getElementById('language-select').value;
    translations = await loadTranslations(language);

    const labels = Array.from({ length: maxDuration }, (_, i) => `${translations.year} ${i}`);

    const rootStyles = getComputedStyle(document.documentElement);
    // const transparency = rootStyles.getPropertyValue('--graphOpacity').trim();
    const rentColor = rootStyles.getPropertyValue('--graphRentColor').trim();
    const rentFillColor = rootStyles.getPropertyValue('--graphRentFillColor').trim();
    const purchaseColor = rootStyles.getPropertyValue('--graphPurchaseColor').trim();
    const purchaseFillColor = rootStyles.getPropertyValue('--graphPurchaseFillColor').trim();

    // 3. Créer le nouveau graphique avec des options de responsivité
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${translations.reportRentalCumulativeExpenses}`,
                    data: cumulRent,
                    fill: true,
                    borderColor: `${rentColor}`, //'rgb(255, 99, 132)',
                    backgroundColor: `${rentFillColor}`
                },
                {
                    label: `${translations.reportCumulPurchaseLosses}`,
                    data: cumulativePurchase,
                    fill: true,
                    borderColor: `${purchaseColor}`,
                    backgroundColor: `${purchaseFillColor}`
                }
            ]
        },
        options: {
            interaction: {
                intersect: false,
                mode: 'index',
            },
            responsive: true,
            maintainAspectRatio: false, //false, // Désactiver le maintien du ratio d'aspect pour s'adapter à la taille du parent
            scales: {
                y: {
                    ticks: {
                        callback: function (value) {
                            return Intl.NumberFormat(
                                `${translations.currencyFormat}`,
                                {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumSignificantDigits: 5
                                }
                            ).format(value);
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${translations.graphTitle}`
                },
                tooltip: {
                    usePointStyle: true,
                    callbacks: {
                        labelPointStyle: function (context) {
                            return {
                                pointStyle: 'circle',
                                rotation: 0
                            };
                        }
                    }
                }
            }
        }
    });
    // 4. Mettre à jour le contenu HTML de l'élément canvas
    document.getElementById('myChart').innerHTML = myChart;
}

export async function downloadPDF() {
    const wasDarkMode = forceLightMode();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Configuration des marges et positions
    const margin = 20;
    const tableSpacing = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - 2 * margin;

    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    doc.text(margin, margin, `${translations.reportTitle}`);
    var finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : tableSpacing;

    const price = parseFloat(document.getElementById('price').value);
    const notary = parseFloat(document.getElementById('notary').value) / 100;
    const coOwnership = parseFloat(document.getElementById('coOwnership').value);
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const fictitiousRentRate = parseFloat(document.getElementById('fictitiousRentRate').value) / 100;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100;
    const contribution = parseFloat(document.getElementById('contribution').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const loanDuration = parseInt(document.getElementById('loanDuration').value);
    const insuranceRate = parseInt(document.getElementById('insurance-rate').value) / 100;
    const fictitiousRent = parseFloat(document.getElementById('fictitiousRent').value);
    const fileFees = parseFloat(document.getElementById('file-fees').value);
    const HousingTax = parseFloat(document.getElementById('HousingTax').value);
    const propertyTax = parseFloat(document.getElementById('propertyTax').value);
    const APR = calculateAPR();

    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const purchaseTotal = price + notaryFees + agencyCommissionFees;
    const borrowedAmount = purchaseTotal - contribution;
    const monthlyPayment = interestRate === 0 ? borrowedAmount / (loanDuration * 12) : (borrowedAmount * interestRate / 12) / (1 - Math.pow(1 + interestRate / 12, -loanDuration * 12));
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;

    const maxDuration = 100;
    const coOwnershipFees = parseFloat(document.getElementById('coOwnership').value);
    const cumulIncomes = extractIncomes();
    const repaymentYear = findPivotYear(price, notaryFees, agencyCommissionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees);
    // Purchase Board
    doc.autoTable({
        startY: finalY + margin,
        head: [[`${translations.reportPurchase}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportPrice}`, `${price.toFixed(2)} €`],
            [`${translations.reportNotaryFees}`, `${notaryFees.toFixed(2)} €`],
            [`${translations.reportAppreciationRate}`, `${(appreciationRate * 100).toFixed(2)} %`],
            [`${translations.reportAgencyCommission}`, `${agencyCommissionFees.toFixed(2)} €`],
            [`${translations.reportPurchaseTotal}`, `${purchaseTotal.toFixed(2)} €`],
            [`${translations.reportCoOwnership}`, `${coOwnership.toFixed(2)} €`],
            [`${translations.reportfileFees}`, `${fileFees.toFixed(2)} €`]
        ]
    });

    // Tableau Emprunt
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportLoan}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.contribution}`, `${contribution.toFixed(0)} €`],
            [`${translations.reportBorrowedAmount}`, `${borrowedAmount.toFixed(0)} €`],
            [`${translations.reportInterestRate}`, `${(interestRate * 100).toFixed(2)} %`],
            [`${translations.reportInsuranceRate}`, `${(insuranceRate * 100).toFixed(2)} %`],
            [`${translations.reportAPR}`, `${(APR).toFixed(2)} %`],
            [`${translations.reportMonthlyPayment}`, `${monthlyPayment.toFixed(0)} €`],
            [`${translations.reportTotalInterests}`, `${totalInterestCost.toFixed(0)} €`],
            [`${translations.reportLoanTotalCost}`, `${loanTotalCost.toFixed(0)} €`]
        ]
    });

    // Tableau Financement
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportFinancing}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportFictitiousMonthlyRent}`, `${fictitiousRent.toFixed(0)} €`],
            [`${translations.reportFictitiousRentEvolutionRate}`, `${(fictitiousRentRate * 100).toFixed(2)} %`],
            [`${translations.reportHousingTaxAnnuelle}`, `${HousingTax.toFixed(0)} €`],
            [`${translations.reportPropertyTaxAnnuelle}`, `${propertyTax.toFixed(0)} €`]
        ]
    });

    // Add the year at which the rent crosses the purchase
    doc.text(`${translations.reportRepaymentYear}: ${repaymentYear}`, margin, doc.lastAutoTable.finalY + tableSpacing);

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImageData = chart.toDataURL('image/png');

    // Calculer la hauteur de l'image en fonction de la largeur disponible
    const imageWidth = availableWidth;
    const imageHeight = (chart.height * imageWidth) / chart.width;

    // help : addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    let imageY = doc.lastAutoTable.finalY + tableSpacing;
    // Si l'image dépasse la page, on la met sur la page suivante
    if (imageY + imageHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        imageY = margin;
    }
    doc.addImage(
        chartImageData, 'PNG', margin, margin, imageWidth, imageHeight //, margin, doc.lastAutoTable.finalY + tableSpacing
    );

    const filename = document.getElementById('pdf-filename').value || document.getElementById('pdf-filename').placeholder; // || translations.pdfFilenamePlaceHolder;
    const pdfFilename = filename.endsWith('.pdf') ? filename : filename + ".pdf";
    doc.save(pdfFilename);

    restoreMode(wasDarkMode);
}
