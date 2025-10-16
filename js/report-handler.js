let myChart = null; // Global variable to store the chart instance
import { calculateMonthlyPayment, extractIncomes, calculateAPR, findPivotYear, calculateRentLosses, calculatePurchaseLosses } from './form-handler.js';
import { loadTranslations } from './handle-language.js';
import { forceLightMode, restoreMode } from './dark-mode.js';
// import Chart from './chart.js/auto';
// import zoomPlugin from './chartjs-plugin-zoom';

/**
 * Updates the summary section with the repayment year and cumulative purchase losses.
 */
export function updateSummary(repaymentYear, cumulativePurchase) {
    document.getElementById('repaymentYearDisplay').textContent = repaymentYear;
    document.getElementById('cumulativePurchaseDisplay').textContent = `${cumulativePurchase.toFixed(0)}\u00A0€`;
}

/**
 * Generates a financial report based on form inputs.
 */
export async function generateReport() {
    const {
        price, notary, appreciationRate, agencyCommission, contribution,
        interestRate, loanDuration, insuranceRate, fictitiousRent,
        buyHousingTax, rentingHousingTax, propertyTax, fictitiousRentRate,
        coOwnershipFees, fileFees, maxDuration
    } = getReportFormValues();

    const { notaryFees, agencyCommissionFees, purchaseTotal, borrowedAmount } = calculatePurchaseTotals(price, notary, agencyCommission, fileFees, contribution);
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;
    const cumulIncomes = extractIncomes();
    const cumulMonthlyIncomes = cumulIncomes / 12;
    const APR = calculateAPR();
    const repaymentYear = findPivotYear(
        price, notaryFees, agencyCommissionFees, contribution,
        monthlyPayment, propertyTax, buyHousingTax, rentingHousingTax,
        appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees
    );
    const maxCalculatedDuration = Math.max(loanDuration, repaymentYear + 4);
    const cumulRent = calculateRentLosses(fictitiousRent, maxCalculatedDuration, fictitiousRentRate, rentingHousingTax);
    const cumulativePurchase = calculatePurchaseLosses(
        price, notaryFees, agencyCommissionFees, contribution,
        monthlyPayment, propertyTax, buyHousingTax, appreciationRate,
        maxCalculatedDuration, loanDuration, cumulIncomes, coOwnershipFees, fileFees
    );
    const cumulativePurchaseUntilRepayment = cumulativePurchase[repaymentYear];

    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    updateSummary(repaymentYear, cumulativePurchaseUntilRepayment);

    const simulationContainer = document.getElementById('simulation');
    simulationContainer.className = 'simulation';
    simulationContainer.innerHTML = '';
    simulationContainer.appendChild(createSectionTitle(translations.reportTitle));

    simulationContainer.appendChild(createCollapsibleResultsSection(
        translations.reportPurchase,
        [
            { label: translations.reportPrice, value: `${price.toFixed(2)}\u00A0€` },
            { label: translations.reportNotaryFees, value: `${notaryFees.toFixed(2)}\u00A0€` },
            { label: translations.reportAgencyCommission, value: `${agencyCommissionFees.toFixed(2)}\u00A0€` },
            { label: translations.reportPurchaseTotal, value: `${purchaseTotal.toFixed(2)}\u00A0€` },
            { label: translations.reportCoOwnership, value: `${coOwnershipFees.toFixed(2)}\u00A0€` },
            { label: translations.reportBuyHousingTax, value: `${buyHousingTax.toFixed(2)}\u00A0€` },
            { label: translations.reportPropertyTax, value: `${propertyTax.toFixed(2)}\u00A0€` },
            { label: translations.reportAppreciationRate, value: `${(appreciationRate * 100).toFixed(2)}\u00A0%` }
        ]
    ));

    simulationContainer.appendChild(createCollapsibleResultsSection(
        translations.reportLoan,
        [
            { label: translations.contribution, value: `${contribution.toFixed(2)}\u00A0€` },
            { label: translations.reportBorrowedAmount, value: `${borrowedAmount.toFixed(2)}\u00A0€` },
            { label: translations.reportInsuranceRate, value: `${(insuranceRate * 100).toFixed(2)}\u00A0%` },
            { label: translations.reportInterestRate, value: `${(interestRate * 100).toFixed(2)}\u00A0%` },
            { label: translations.reportAPR, value: `${APR.toFixed(2)}\u00A0%` },
            { label: translations.reportMonthlyPayment, value: `${monthlyPayment.toFixed(2)}\u00A0€` },
            { label: translations.reportTotalInterests, value: `${totalInterestCost.toFixed(2)}\u00A0€` },
            { label: translations.reportLoanTotalCost, value: `${loanTotalCost.toFixed(2)}\u00A0€` }
        ]
    ));

    const rentingRows = [
        { label: translations.reportFictitiousMonthlyRent, value: `${fictitiousRent.toFixed(2)}\u00A0€` },
        { label: translations.reportFictitiousRentEvolutionRate, value: `${(fictitiousRentRate * 100).toFixed(2)}\u00A0%` },
        { label: translations.reportRentingHousingTax, value: `${rentingHousingTax.toFixed(2)}\u00A0€` }
    ];
    if (cumulMonthlyIncomes > 0) {
        rentingRows.push({ label: translations.reportMonthlyAgregatedIncome, value: `${cumulMonthlyIncomes.toFixed(2)}\u00A0€` });
    }
    simulationContainer.appendChild(createCollapsibleResultsSection(translations.reportRenting, rentingRows));

    await generateChart(cumulRent, cumulativePurchase, maxCalculatedDuration);
    setupPDFDownloadSection(translations);
    // setupResetZoomButton(translations);
}

/**
 * Generates a chart comparing rent vs. purchase losses with zoom functionality.
 */
export async function generateChart(cumulRent, cumulativePurchase, maxDuration) {
    if (myChart) {
        myChart.destroy();
    }

    // Chart.register(zoomPlugin);

    const ctx = document.getElementById('myChart').getContext('2d');
    const canvas = ctx.canvas;
    const parent = canvas.parentNode;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    const labels = Array.from({ length: maxDuration }, (_, i) => `${translations.year} ${i}`);
    const rootStyles = getComputedStyle(document.body);
    const rentColor = rootStyles.getPropertyValue('--graph-rent-color').trim();
    const rentFillColor = rootStyles.getPropertyValue('--graph-rent-fill-color').trim();
    const purchaseColor = rootStyles.getPropertyValue('--graph-purchase-color').trim();
    const purchaseFillColor = rootStyles.getPropertyValue('--graph-purchase-fill-color').trim();
    const textColor = rootStyles.getPropertyValue('--graph-text-color').trim();

    // Calculate min and max values for the y-axis
    const allData = [...cumulRent, ...cumulativePurchase];
    const yMin = Math.min(...allData) * 0.95; // 5% padding below min
    const yMax = Math.max(...allData) * 1.05; // 5% padding above max

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: translations.reportRentalCumulativeExpenses,
                    data: cumulRent,
                    fill: true,
                    borderColor: rentColor,
                    backgroundColor: rentFillColor
                },
                {
                    label: translations.reportCumulPurchaseLosses,
                    data: cumulativePurchase,
                    fill: true,
                    borderColor: purchaseColor,
                    backgroundColor: purchaseFillColor
                }
            ]
        },
        options: {
            interaction: {
                intersect: false,
                mode: 'index',
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: yMin,
                    max: yMax,
                    ticks: {
                        callback: (value) => Intl.NumberFormat(translations.currencyFormat, {
                            style: 'currency',
                            currency: 'EUR',
                            maximumSignificantDigits: 5
                        }).format(value),
                        color: textColor
                    }
                },
                x: {
                    min: 0, // Only positive x-axis values
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: textColor
                    }
                },
                title: {
                    display: true,
                    text: translations.graphTitle,
                    color: textColor
                },
                tooltip: {
                    usePointStyle: true
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                        },
                        mode: 'xy',
                        onZoom: ({ chart }) => {
                            // Handle pinch zoom direction
                            const mc = new Hammer.Manager(chart.canvas);
                            mc.add(new Hammer.Pinch());

                            mc.on('pinchstart', (e) => {
                                chart.lastPinchScale = e.scale;
                            });

                            mc.on('pinchmove', (e) => {
                                const scaleDiff = e.scale - chart.lastPinchScale;
                                chart.lastPinchScale = e.scale;

                                // Determine if pinch is more horizontal or vertical
                                const deltaX = Math.abs(e.deltaX);
                                const deltaY = Math.abs(e.deltaY);

                                if (deltaX > deltaY) {
                                    // Horizontal pinch, zoom x-axis
                                    chart.options.plugins.zoom.zoom.mode = 'x';
                                } else {
                                    // Vertical pinch, zoom y-axis
                                    chart.options.plugins.zoom.zoom.mode = 'y';
                                }
                            });
                        }
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    }
                }
            }
        }
    });

    // Initialize Hammer.js for pinch detection
    const mc = new Hammer.Manager(canvas);
    mc.add(new Hammer.Pinch());
    mc.on('pinchstart', (e) => {
        myChart.lastPinchScale = e.scale;
    });

    mc.on('pinchmove', (e) => {
        const scaleDiff = e.scale - myChart.lastPinchScale;
        myChart.lastPinchScale = e.scale;

        // Determine if pinch is more horizontal or vertical
        const deltaX = Math.abs(e.deltaX);
        const deltaY = Math.abs(e.deltaY);

        if (deltaX > deltaY) {
            // Horizontal pinch, zoom x-axis
            myChart.options.plugins.zoom.zoom.mode = 'x';
        } else {
            // Vertical pinch, zoom y-axis
            myChart.options.plugins.zoom.zoom.mode = 'y';
        }
    });
}

/**
 * Downloads the report as a PDF.
 */
export async function downloadPDF() {
    const wasDarkMode = forceLightMode();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 20;
    const tableSpacing = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - 2 * margin;

    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    doc.setProperties({
        title: translations.reportTitle,
        subject: translations.reportTitle,
        // author: 'Your Name',
        keywords: 'finance, report, loan, insurance, simulation, purchase, rent, real estate',
        creator: 'https://github.com/odysseu/HabitatCalc'
    });

    const {
        price, notary, appreciationRate, agencyCommission, contribution,
        interestRate, loanDuration, insuranceRate, fictitiousRent,
        buyHousingTax, rentingHousingTax, propertyTax, fictitiousRentRate,
        coOwnershipFees, fileFees, maxDuration
    } = getReportFormValues();

    const { notaryFees, agencyCommissionFees, purchaseTotal, borrowedAmount } = calculatePurchaseTotals(price, notary, agencyCommission, fileFees, contribution);
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const cumulIncomes = extractIncomes();
    const repaymentYear = findPivotYear(
        price, notaryFees, agencyCommissionFees, contribution,
        monthlyPayment, propertyTax, buyHousingTax, rentingHousingTax,
        appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees
    );

    addPDFHeader(doc, translations, margin);
    addPurchaseTable(doc, translations, margin, tableSpacing, price, notaryFees, appreciationRate, agencyCommissionFees, purchaseTotal, coOwnershipFees, buyHousingTax, fileFees, propertyTax);
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;
    const APR = calculateAPR();
    addLoanTable(doc, translations, margin, tableSpacing, contribution, borrowedAmount, interestRate, insuranceRate, APR, monthlyPayment, totalInterestCost, loanTotalCost);
    const cumulMonthlyIncomes = cumulIncomes / 12;
    addRentingTable(doc, translations, margin, tableSpacing, fictitiousRent, fictitiousRentRate, rentingHousingTax, cumulMonthlyIncomes);
    addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear);
    addMonthlyBreakdownTable(doc, translations, margin, tableSpacing, borrowedAmount, interestRate, insuranceRate, loanDuration);
    addYearlyTotalsTable(doc, translations, margin, tableSpacing, borrowedAmount, interestRate, insuranceRate, loanDuration);
    addChartToPDF(doc, margin, availableWidth, tableSpacing);
    // doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing,
    const filename = document.getElementById('pdf-filename') ? document.getElementById('pdf-filename').value || document.getElementById('pdf-filename').placeholder : 'financial_report';
    const pdfFilename = filename.endsWith('.pdf') ? filename : filename + ".pdf";
    doc.save(pdfFilename);
    restoreMode(wasDarkMode);
}

/**
 * Sets up the PDF download section in the UI.
 */
export function setupPDFDownloadSection(translations) {
    const reportButtonContainer = document.getElementById('report-button');
    reportButtonContainer.innerHTML = '';

    const downloadSection = document.createElement('div');
    downloadSection.className = 'report-download-container';

    // const filenameLabel = document.createElement('label');
    // filenameLabel.setAttribute('for', 'pdf-filename');
    // filenameLabel.textContent = translations.pdfFileName;

    const filenameInputs = document.createElement('div');
    filenameInputs.className = 'report-download-inputs';

    const filenameInput = document.createElement('input');
    filenameInput.type = 'text';
    filenameInput.id = 'pdf-filename';
    filenameInput.name = 'pdf-filename';
    filenameInput.placeholder = translations.pdfFileNamePlaceHolder;
    filenameInput.required = true;

    const downloadButton = document.createElement('button');
    downloadButton.id = 'download-button';
    downloadButton.className = 'button';
    downloadButton.textContent = translations.downloadPDF;

    filenameInputs.appendChild(filenameInput);
    filenameInputs.appendChild(downloadButton);
    // downloadSection.appendChild(filenameLabel);
    downloadSection.appendChild(filenameInputs);
    reportButtonContainer.appendChild(downloadSection);

    document.getElementById('download-button').addEventListener('click', downloadPDF);
}

/**
 * Sets up the reset zoom button for the chart.
 */
// function setupResetZoomButton(translations) {
//     const chartContainer = document.getElementById('chart-container');
//     const existingResetButton = document.getElementById('reset-zoom');
//     if (existingResetButton) {
//         existingResetButton.remove();
//     }

//     const resetZoomButton = document.createElement('button');
//     resetZoomButton.id = 'reset-zoom';
//     resetZoomButton.className = 'button';
//     resetZoomButton.textContent = translations.resetZoom || 'Reset Zoom';
//     resetZoomButton.addEventListener('click', () => {
//         if (myChart) {
//             myChart.resetZoom();
//         }
//     });
//     chartContainer.appendChild(resetZoomButton);
// }

/**
 * Extracts form values for the report.
 */
export function getReportFormValues() {
    return {
        price: parseFloat(document.getElementById('price').value),
        notary: parseFloat(document.getElementById('notary').value) / 100,
        appreciationRate: parseFloat(document.getElementById('appreciation-rate').value) / 100,
        agencyCommission: parseFloat(document.getElementById('agency-commission').value) / 100,
        contribution: parseFloat(document.getElementById('contribution').value),
        interestRate: parseFloat(document.getElementById('interest-rate').value) / 100,
        loanDuration: parseInt(document.getElementById('loanDuration').value),
        insuranceRate: parseInt(document.getElementById('insurance-rate').value) / 100,
        fictitiousRent: parseFloat(document.getElementById('fictitiousRent').value),
        buyHousingTax: parseFloat(document.getElementById('buyHousingTax').value),
        rentingHousingTax: parseFloat(document.getElementById('rentingHousingTax').value),
        propertyTax: parseFloat(document.getElementById('propertyTax').value),
        fictitiousRentRate: parseFloat(document.getElementById('fictitiousRentRate').value) / 100,
        coOwnershipFees: parseFloat(document.getElementById('coOwnership').value),
        fileFees: parseFloat(document.getElementById('file-fees').value),
        maxDuration: 200
    };
}

/**
 * Calculates purchase totals (notary fees, agency fees, etc.).
 */
export function calculatePurchaseTotals(price, notary, agencyCommission, fileFees, contribution) {
    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const purchaseTotal = price + notaryFees + agencyCommissionFees + fileFees;
    const borrowedAmount = purchaseTotal - contribution;
    return { notaryFees, agencyCommissionFees, purchaseTotal, borrowedAmount };
}

/**
 * Adds the purchase table to the PDF.
 */
export function addPurchaseTable(doc, translations, margin, tableSpacing, price, notaryFees, appreciationRate, agencyCommissionFees, purchaseTotal, coOwnershipFees, buyHousingTax, fileFees, propertyTax) {
    doc.setFontSize(10);
    doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing,
        head: [[translations.reportPurchase, translations.reportValue]],
        body: [
            [translations.reportPrice, `${price.toFixed(2)} €`],
            [translations.reportNotaryFees, `${notaryFees.toFixed(2)} €`],
            [translations.reportAgencyCommission, `${agencyCommissionFees.toFixed(2)} €`],
            [translations.reportfileFees, `${fileFees.toFixed(2)} €`],
            [translations.reportPurchaseTotal, `${purchaseTotal.toFixed(2)} €`],
            [translations.reportPropertyTax, `${propertyTax.toFixed(0)} €`],
            [translations.reportBuyHousingTax, `${buyHousingTax.toFixed(0)} €`],
            [translations.reportCoOwnership, `${coOwnershipFees.toFixed(2)} €`],
            [translations.reportAppreciationRate, `${(appreciationRate * 100).toFixed(2)} %`]
        ],
        styles: { fontSize: 10, cellPadding: 0.5, overflow: 'linebreak', halign: 'left', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fontStyle: 'bold' }
    });
}

/**
 * Adds the loan table to the PDF.
 */
export function addLoanTable(doc, translations, margin, tableSpacing, contribution, borrowedAmount, interestRate, insuranceRate, APR, monthlyPayment, totalInterestCost, loanTotalCost) {
    doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing,
        head: [[translations.reportLoan, translations.reportValue]],
        body: [
            [translations.contribution, `${contribution.toFixed(0)} €`],
            [translations.reportBorrowedAmount, `${borrowedAmount.toFixed(0)} €`],
            [translations.reportInterestRate, `${(interestRate * 100).toFixed(2)} %`],
            [translations.reportInsuranceRate, `${(insuranceRate * 100).toFixed(2)} %`],
            [translations.reportAPR, `${APR.toFixed(2)} %`],
            [translations.reportMonthlyPayment, `${monthlyPayment.toFixed(0)} €`],
            [translations.reportTotalInterests, `${totalInterestCost.toFixed(0)} €`],
            [translations.reportLoanTotalCost, `${loanTotalCost.toFixed(0)} €`]
        ],
        styles: { fontSize: 10, cellPadding: 0.5, overflow: 'linebreak', halign: 'left', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fontStyle: 'bold' }
    });
}

/**
 * Adds the renting table to the PDF.
 */
export function addRentingTable(doc, translations, margin, tableSpacing, fictitiousRent, fictitiousRentRate, rentingHousingTax, cumulMonthlyIncomes) {
    doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing,
        head: [[translations.reportRenting, translations.reportValue]],
        body: [
            [translations.reportFictitiousMonthlyRent, `${fictitiousRent.toFixed(0)} €`],
            [translations.reportFictitiousRentEvolutionRate, `${(fictitiousRentRate * 100).toFixed(2)} %`],
            [translations.reportRentingHousingTax, `${rentingHousingTax.toFixed(0)} €`]
        ],
        styles: { fontSize: 10, cellPadding: 0.5, overflow: 'linebreak', halign: 'left', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fontStyle: 'bold' }
    });

    if (cumulMonthlyIncomes > 0) {
        doc.autoTable({
            startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing,
            head: [[translations.reportMonthlyAgregatedIncome, translations.reportValue]],
            body: [[translations.reportMonthlyAgregatedIncome, `${cumulMonthlyIncomes.toFixed(2)} €`]],
            styles: { fontSize: 10, cellPadding: 0.5, overflow: 'linebreak', halign: 'left', valign: 'middle', lineWidth: 0.1 },
            headStyles: { fontStyle: 'bold' }
        });
    }
}

/**
 * Adds the repayment year to the PDF.
 */
export function addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear) {
    doc.text(
        `${translations.reportRepaymentYear}: ${repaymentYear}`,
        margin,
        doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing
    );
}

/**
 * Adds the monthly breakdown table to the PDF.
 */
export function addMonthlyBreakdownTable(doc, translations, margin, tableSpacing, borrowedAmount, interestRate, insuranceRate, loanDuration) {
    const monthlyInterestRate = interestRate / 12;
    let remainingBalance = borrowedAmount;
    const monthlyInsurance = borrowedAmount * insuranceRate / 12;
    const monthlyData = [];

    for (let month = 1; month <= loanDuration * 12; month++) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate) - interest - monthlyInsurance;
        remainingBalance -= principal;
        monthlyData.push({ month, loan: principal, interests: interest, insurance: monthlyInsurance });
    }

    doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 2 * tableSpacing : margin + tableSpacing,
        head: [[translations.reportResultTableOrderNumber, translations.reportResultTableLoan, translations.reportResultTableInterests, translations.reportResultTableInsurance]],
        body: monthlyData.map(data => [
            data.month,
            `${data.loan.toFixed(2)} €`,
            `${data.interests.toFixed(2)} €`,
            `${data.insurance.toFixed(2)} €`
        ]),
        styles: { fontSize: 10, cellPadding: 0.5, overflow: 'linebreak', halign: 'left', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fontStyle: 'bold' }
    });
}

/**
 * Adds the yearly totals table to the PDF.
 */
export function addYearlyTotalsTable(doc, translations, margin, tableSpacing, borrowedAmount, interestRate, insuranceRate, loanDuration) {
    const monthlyInterestRate = interestRate / 12;
    let remainingBalance = borrowedAmount;
    const monthlyInsurance = borrowedAmount * insuranceRate / 12;
    const monthlyData = [];
    for (let month = 1; month <= loanDuration * 12; month++) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate) - interest - monthlyInsurance;
        remainingBalance -= principal;
        monthlyData.push({ month, loan: principal, interests: interest, insurance: monthlyInsurance });
    }

    const yearlyData = [];
    let currentYear = 1;
    let yearTotal = { loan: 0, interests: 0, insurance: 0 };
    for (let i = 0; i < monthlyData.length; i++) {
        const data = monthlyData[i];
        yearTotal.loan += data.loan;
        yearTotal.interests += data.interests;
        yearTotal.insurance += data.insurance;
        if ((i + 1) % 12 === 0 || i === monthlyData.length - 1) {
            yearlyData.push({
                year: currentYear,
                loan: yearTotal.loan,
                interests: yearTotal.interests,
                insurance: yearTotal.insurance,
                total: yearTotal.loan + yearTotal.interests + yearTotal.insurance
            });
            currentYear++;
            yearTotal = { loan: 0, interests: 0, insurance: 0 };
        }
    }

    doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing,
        head: [[translations.reportResultTableYear, translations.reportResultTableLoan, translations.reportResultTableTotalInterests, translations.reportResultTableTotalInsurance, translations.reportResultTableTotal]],
        body: yearlyData.map(data => [
            data.year,
            `${data.loan.toFixed(2)} €`,
            `${data.interests.toFixed(2)} €`,
            `${data.insurance.toFixed(2)} €`,
            `${data.total.toFixed(2)} €`
        ]),
        styles: { fontSize: 10, cellPadding: 0.5, overflow: 'linebreak', halign: 'left', valign: 'middle', lineWidth: 0.1 },
        headStyles: { fontStyle: 'bold' }
    });
}

/**
 * Adds the chart to the PDF.
 */
export function addChartToPDF(doc, margin, availableWidth, tableSpacing) {
    const chart = document.getElementById('myChart');
    const chartImageData = chart.toDataURL('image/png');
    const imageWidth = availableWidth;
    const imageHeight = (chart.height * imageWidth) / chart.width;
    let imageY = doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing;
    if (imageY + imageHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        imageY = margin;
    }
    doc.addImage(chartImageData, 'PNG', margin, imageY, imageWidth, imageHeight);
}

/**
 * Adds a header to the PDF.
 */
export function addPDFHeader(doc, translations, margin) {
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(margin, margin, translations.reportTitle);
}

/**
 * Creates a section title.
 */
export function createSectionTitle(text) {
    const title = document.createElement('h2');
    title.textContent = text;
    return title;
}

/**
 * Creates a collapsible results section with a table.
 */
export function createCollapsibleResultsSection(title, rows) {
    const section = document.createElement('div');
    section.className = 'results-section';

    const toggle = document.createElement('button');
    toggle.className = 'results-section-toggle expanded';
    toggle.textContent = title;
    toggle.addEventListener('click', () => {
        content.classList.toggle('collapsed');
        toggle.classList.toggle('expanded');
    });

    const content = document.createElement('div');
    content.className = 'results-section-content';

    const table = document.createElement('table');
    table.className = 'results-table';

    const tbody = document.createElement('tbody');
    rows.forEach(row => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = row.label;
        const tdValue = document.createElement('td');
        tdValue.textContent = row.value;
        tr.appendChild(tdLabel);
        tr.appendChild(tdValue);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    content.appendChild(table);
    section.appendChild(toggle);
    section.appendChild(content);
    return section;
}
