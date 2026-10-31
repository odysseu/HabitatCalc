let myChart = null; // Global variable to store the chart instance
import { 
    calculateMonthlyPayment, extractIncomes, calculateAPR, 
    findPivotYear, calculateRentLosses, calculatePurchaseLosses,
    findPivotPoint, calculateCumulativeRentCosts, calculateCumulativePurchaseCosts
} from './form-handler.js';
import { loadTranslations } from './handle-language.js';
import { forceLightMode, restoreMode } from './dark-mode.js';
// import Chart from './chart.js/auto';
// import zoomPlugin from './chartjs-plugin-zoom';

/**
 * Updates the summary section with the repayment point (years and months) and cumulative purchase losses.
 * @param {Object|number} pivot - Either a pivot point object {years, months, totalMonths} or a year number
 * @param {number} cumulativePurchase - Cumulative purchase losses at pivot point
 * @param {Object} translations - Translation object
 */
export function updateSummary(pivot, cumulativePurchase, translations = {}) {
    let repaymentYear, repaymentMonth, totalMonths;
    
    // Handle both old format (number) and new format (object)
    if (typeof pivot === 'number') {
        repaymentYear = pivot;
        repaymentMonth = 0;
        totalMonths = pivot * 12;
    } else {
        repaymentYear = pivot.years;
        repaymentMonth = pivot.months || 0;
        totalMonths = pivot.totalMonths;
    }
    
    // Update the year display
    document.getElementById('repaymentYearDisplay').textContent = repaymentYear;
    
    // For the month display and labels, handle based on whether we have monthly precision
    // Check if the new elements exist (they might not in tests or old HTML)
    const repaymentMonthDisplay = document.getElementById('repaymentMonthDisplay');
    const summaryAnd = document.getElementById('summary-and');
    const summaryMonthsLabel = document.getElementById('summary-months-label');
    const summaryYearsLabel = document.getElementById('summary-years-label');
    
    // Only update month-related elements if they all exist
    const hasMonthElements = repaymentMonthDisplay && summaryAnd && summaryMonthsLabel && summaryYearsLabel;
    
    if (hasMonthElements) {
        // Always show years label
        const yearsText = repaymentYear === 1 
            ? (translations.year || 'year') 
            : (translations.years || 'years');
        summaryYearsLabel.textContent = ' ' + yearsText + ' ';
        summaryYearsLabel.style.display = 'inline';
        
        if (repaymentMonth > 0) {
            // Show months with proper translation
            repaymentMonthDisplay.textContent = repaymentMonth;
            summaryAnd.textContent = (translations.and || 'and') + ' ';
            const monthsText = repaymentMonth === 1 
                ? (translations.month || 'month') 
                : (translations.months || 'months');
            summaryMonthsLabel.textContent = ' ' + monthsText;
            summaryAnd.style.display = 'inline';
            repaymentMonthDisplay.style.display = 'inline';
            summaryMonthsLabel.style.display = 'inline';
        } else {
            // Hide month-related elements if no months
            repaymentMonthDisplay.textContent = '';
            summaryAnd.textContent = '';
            summaryMonthsLabel.textContent = '';
            summaryAnd.style.display = 'none';
            repaymentMonthDisplay.style.display = 'none';
            summaryMonthsLabel.style.display = 'none';
        }
    }
    
    document.getElementById('cumulativePurchaseDisplay').innerHTML = `<strong>${cumulativePurchase.toFixed(0)}\u00A0€</strong>`;
    
    // Calculate yearly and monthly averages
    const years = totalMonths / 12;
    const yearlyAverage = years > 0 ? cumulativePurchase / years : 0;
    const monthlyAverage = yearlyAverage / 12;
    
    document.getElementById('yearlyAverageDisplay').innerHTML = `<strong>${yearlyAverage.toFixed(0)}&nbsp;€</strong>`;
    document.getElementById('monthlyAverageDisplay').innerHTML = `<strong>${monthlyAverage.toFixed(0)}&nbsp;€</strong>`;
}

/**
 * Generates a financial report based on form inputs.
 */
export async function generateReport() {
    const {
        price, notary, appreciationRate, agencyCommission, contribution,
        interestRate, loanDuration, insuranceRate, fictitiousRent,
        buyHousingTax, rentingHousingTax, propertyTax, fictitiousRentRate,
        propertyTaxRate, coOwnershipFees, fileFees, maxDuration, rentingPropertyTaxRate
    } = getReportFormValues();

    const { notaryFees, agencyCommissionFees, purchaseTotal, borrowedAmount } = calculatePurchaseTotals(price, notary, agencyCommission, fileFees, contribution);
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;
    const cumulIncomes = extractIncomes();
    const cumulMonthlyIncomes = cumulIncomes / 12;
    const APR = calculateAPR();

    // Use monthly precision calculations with existing functions
    // Map report-handler parameter names to form-handler parameter names
    // Ensure all values are valid numbers (not NaN)
    const safe = (val) => (typeof val === 'number' && !isNaN(val) && isFinite(val)) ? val : 0;
    
    const pivotParams = {
        price: safe(price),
        notaryRate: safe(notary),
        agencyCommissionRate: safe(agencyCommission),
        fileFees: safe(fileFees),
        contribution: safe(contribution),
        annualInterestRate: safe(interestRate),
        loanDurationYears: safe(loanDuration),
        annualInsuranceRate: safe(insuranceRate),
        annualPropertyTax: safe(propertyTax),
        annualPropertyTaxRate: safe(propertyTaxRate),
        buyHousingTax: safe(buyHousingTax),
        coOwnershipFees: safe(coOwnershipFees),
        annualAppreciationRate: safe(appreciationRate),
        annualIncomes: safe(cumulIncomes),
        baseMonthlyRent: safe(fictitiousRent),
        annualRentRate: safe(fictitiousRentRate),
        monthlyRentingPropertyTax: safe(rentingHousingTax) / 12,
        rentingPropertyTaxRate: safe(rentingPropertyTaxRate),
        maxDurationYears: safe(maxDuration)
    };

    // Find pivot point with monthly precision
    const pivot = findPivotPoint(pivotParams);
    
    // Calculate maximum duration to display (in years)
    const maxCalculatedDurationYears = Math.max(loanDuration, Math.ceil(pivot.totalMonths / 12) + 4);

    // Generate annual data for the chart from monthly calculations
    // Note: calculateCumulativePurchaseCosts and calculateCumulativeRentCosts use 0-based monthIndex
    // We use Math.max(0, ...) for purchase to match the behavior of calculatePurchaseLosses
    const cumulRent = [];
    const cumulativePurchase = [];
    
    for (let year = 1; year <= maxCalculatedDurationYears; year++) {
        const monthIndex = year * 12; // Convert to 0-based month index
        cumulRent.push(calculateCumulativeRentCosts(pivotParams, monthIndex));
        // Apply max(0, ...) to match the logic of calculatePurchaseLosses
        const purchaseCost = calculateCumulativePurchaseCosts(pivotParams, monthIndex);
        cumulativePurchase.push(Math.max(0, purchaseCost));
    }

    // Get cumulative purchase cost at pivot point for summary
    const cumulativePurchaseUntilRepayment = calculateCumulativePurchaseCosts(pivotParams, pivot.totalMonths);

    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    updateSummary(pivot, cumulativePurchaseUntilRepayment, translations);

    const simulationContainer = document.getElementById('simulation');
    simulationContainer.className = 'simulation';
    simulationContainer.innerHTML = '';
    simulationContainer.appendChild(createSectionTitle(translations.reportTitle));

    simulationContainer.appendChild(createCollapsibleResultsSection(
        translations.reportPurchase,
        [
            { label: translations.reportPrice, value: `<strong>${price.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportNotaryFees, value: `<strong>${notaryFees.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportAgencyCommission, value: `<strong>${agencyCommissionFees.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportPurchaseTotal, value: `<strong>${purchaseTotal.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportCoOwnership, value: `<strong>${coOwnershipFees.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportBuyHousingTax, value: `<strong>${buyHousingTax.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportPropertyTax, value: `<strong>${propertyTax.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportPropertyTaxRate, value: `${(propertyTaxRate * 100).toFixed(2)}\u00A0%` },
            { label: translations.reportAppreciationRate, value: `${(appreciationRate * 100).toFixed(2)}\u00A0%` }
        ]
    ));

    simulationContainer.appendChild(createCollapsibleResultsSection(
        translations.reportLoan,
        [
            { label: translations.contribution, value: `<strong>${contribution.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportBorrowedAmount, value: `<strong>${borrowedAmount.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportInsuranceRate, value: `${(insuranceRate * 100).toFixed(2)}\u00A0%` },
            { label: translations.reportInterestRate, value: `${(interestRate * 100).toFixed(2)}\u00A0%` },
            { label: translations.reportAPR, value: `${APR.toFixed(2)}\u00A0%` },
            { label: translations.reportMonthlyPayment, value: `<strong>${monthlyPayment.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportTotalInterests, value: `<strong>${totalInterestCost.toFixed(2)}\u00A0€</strong>` },
            { label: translations.reportLoanTotalCost, value: `<strong>${loanTotalCost.toFixed(2)}\u00A0€</strong>` }
        ]
    ));

    const rentingRows = [
        { label: translations.reportFictitiousMonthlyRent, value: `<strong>${fictitiousRent.toFixed(2)}\u00A0€</strong>` },
        { label: translations.reportFictitiousRentEvolutionRate, value: `${(fictitiousRentRate * 100).toFixed(2)}\u00A0%` },
        { label: translations.reportRentingHousingTax, value: `<strong>${rentingHousingTax.toFixed(2)}\u00A0€</strong>` }
    ];
    if (cumulMonthlyIncomes > 0) {
        rentingRows.push({ label: translations.reportMonthlyAgregatedIncome, value: `<strong>${cumulMonthlyIncomes.toFixed(2)}\u00A0€</strong>` });
    }
    simulationContainer.appendChild(createCollapsibleResultsSection(translations.reportRenting, rentingRows));

    await generateChart(cumulRent, cumulativePurchase, maxCalculatedDurationYears);
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
    const labels = Array.from({ length: maxDuration }, (_, i) => `${translations.year} ${i + 1}`);
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
        propertyTaxRate, coOwnershipFees, fileFees, maxDuration, rentingPropertyTaxRate
    } = getReportFormValues();

    const { notaryFees, agencyCommissionFees, purchaseTotal, borrowedAmount } = calculatePurchaseTotals(price, notary, agencyCommission, fileFees, contribution);
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const cumulIncomes = extractIncomes();
    
    // Ensure all values are valid numbers (not NaN)
    const safe = (val) => (typeof val === 'number' && !isNaN(val) && isFinite(val)) ? val : 0;
    
    // Use monthly precision calculations for PDF as well
    const pivotParams = {
        price: safe(price),
        notaryRate: safe(notary),
        agencyCommissionRate: safe(agencyCommission),
        fileFees: safe(fileFees),
        contribution: safe(contribution),
        annualInterestRate: safe(interestRate),
        loanDurationYears: safe(loanDuration),
        annualInsuranceRate: safe(insuranceRate),
        annualPropertyTax: safe(propertyTax),
        annualPropertyTaxRate: safe(propertyTaxRate),
        buyHousingTax: safe(buyHousingTax),
        coOwnershipFees: safe(coOwnershipFees),
        annualAppreciationRate: safe(appreciationRate),
        annualIncomes: safe(cumulIncomes),
        baseMonthlyRent: safe(fictitiousRent),
        annualRentRate: safe(fictitiousRentRate),
        monthlyRentingPropertyTax: safe(rentingHousingTax) / 12,
        rentingPropertyTaxRate: safe(rentingPropertyTaxRate),
        maxDurationYears: safe(maxDuration)
    };
    
    const pivot = findPivotPoint(pivotParams);
    
    // Calculate maximum duration to display (in years)
    const maxCalculatedDurationYears = Math.max(loanDuration, Math.ceil(pivot.totalMonths / 12) + 4);

    // Generate annual data for the vector chart
    const cumulRent = [];
    const cumulativePurchase = [];
    
    for (let year = 1; year <= maxCalculatedDurationYears; year++) {
        const monthIndex = year * 12;
        cumulRent.push(calculateCumulativeRentCosts(pivotParams, monthIndex));
        const purchaseCost = calculateCumulativePurchaseCosts(pivotParams, monthIndex);
        cumulativePurchase.push(Math.max(0, purchaseCost));
    }
    
    // For backward compatibility with PDF functions that expect repaymentYear
    const repaymentYear = pivot.years + (pivot.months > 0 ? 1 : 0);

    addPDFHeader(doc, translations, margin);
    addPurchaseTable(doc, translations, margin, tableSpacing, price, notaryFees, appreciationRate, agencyCommissionFees, purchaseTotal, coOwnershipFees, buyHousingTax, fileFees, propertyTax, propertyTaxRate);
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;
    const APR = calculateAPR();
    addLoanTable(doc, translations, margin, tableSpacing, contribution, borrowedAmount, interestRate, insuranceRate, APR, monthlyPayment, totalInterestCost, loanTotalCost);
    const cumulMonthlyIncomes = cumulIncomes / 12;
    addRentingTable(doc, translations, margin, tableSpacing, fictitiousRent, fictitiousRentRate, rentingHousingTax, cumulMonthlyIncomes);
    addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear, pivot);
    addMonthlyBreakdownTable(doc, translations, margin, tableSpacing, borrowedAmount, interestRate, insuranceRate, loanDuration);
    addYearlyTotalsTable(doc, translations, margin, tableSpacing, borrowedAmount, interestRate, insuranceRate, loanDuration);
    addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxCalculatedDurationYears, pivot, translations);
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
        rentingPropertyTaxRate: parseFloat(document.getElementById('rentingPropertyTaxRate').value) / 100,
        propertyTax: parseFloat(document.getElementById('propertyTax').value),
        propertyTaxRate: parseFloat(document.getElementById('propertyTaxRate').value) / 100,
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
export function addPurchaseTable(doc, translations, margin, tableSpacing, price, notaryFees, appreciationRate, agencyCommissionFees, purchaseTotal, coOwnershipFees, buyHousingTax, fileFees, propertyTax, propertyTaxRate) {
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
            [translations.reportPropertyTaxRate, `${(propertyTaxRate * 100).toFixed(2)} %`],
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
export function addRepaymentYear(doc, translations, margin, tableSpacing, repaymentYear, pivot = null) {
    let displayText = repaymentYear;
    // If pivot with monthly precision is provided, use it
    if (pivot && pivot.years !== undefined) {
        const yearText = pivot.years === 1 ? (translations.year || 'year') : (translations.years || 'years');
        if (pivot.months > 0) {
            const andText = translations.and || 'and';
            const monthText = pivot.months === 1 ? (translations.month || 'month') : (translations.months || 'months');
            displayText = `${pivot.years} ${yearText} ${andText} ${pivot.months} ${monthText}`;
        } else {
            displayText = `${pivot.years} ${yearText}`;
        }
    }
    
    doc.text(
        `${translations.reportRepaymentYear}: ${displayText}`,
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
 * Adds a vector chart to the PDF with the given data.
 * This creates a clean, non-pixelated chart that takes half the page height.
 * Falls back to PNG image if vector drawing is not supported.
 */
export function addVectorChartToPDF(doc, margin, availableWidth, tableSpacing, cumulRent, cumulativePurchase, maxDuration, pivot, translations) {
    // Check if doc has the required vector drawing methods
    const hasVectorSupport = doc && 
        typeof doc.setDrawColor === 'function' &&
        typeof doc.setFillColor === 'function' &&
        typeof doc.line === 'function' &&
        typeof doc.rect === 'function' &&
        typeof doc.text === 'function' &&
        typeof doc.moveTo === 'function' &&
        typeof doc.lineTo === 'function' &&
        typeof doc.stroke === 'function' &&
        typeof doc.fill === 'function' &&
        typeof doc.setLineWidth === 'function' &&
        typeof doc.setFontSize === 'function';
    
    // If no vector support, fall back to PNG image
    if (!hasVectorSupport) {
        addChartToPDF(doc, margin, availableWidth, tableSpacing);
        return;
    }
    
    // Calculate chart dimensions (half of page height)
    const pageHeight = doc.internal.pageSize.getHeight();
    const chartHeight = (pageHeight - 2 * margin) / 2;
    let chartY = doc.lastAutoTable ? doc.lastAutoTable.finalY + tableSpacing : margin + tableSpacing;
    
    // Check if we need a new page
    if (chartY + chartHeight > pageHeight - margin) {
        doc.addPage();
        chartY = margin;
    }
    
    // Set up colors (hex format for jsPDF v4)
    const rentColor = '#FF6384';      // Red
    const purchaseColor = '#36A2EB';  // Blue
    const textColor = '#000000';
    const gridColor = '#C8C8C8';
    const whiteColor = '#FFFFFF';
    const blackColor = '#000000';
    const pivotLineColor = '#000000';
    
    // Calculate value ranges - force Y-axis to start at 0
    const allValues = [...cumulRent, ...cumulativePurchase];
    const minValue = 0; // Force Y-axis to start at 0
    const maxValue = Math.max(...allValues, 0) * 1.05; // Ensure max is at least 0
    const valueRange = maxValue - minValue;
    
    // Helper functions for coordinate conversion
    const valueToY = (value) => {
        if (valueRange === 0) return chartY + chartHeight / 2;
        // With minValue = 0, we want 0 at the bottom (chartY + chartHeight) and maxValue at the top (chartY)
        return chartY + chartHeight - ((value - minValue) / valueRange * chartHeight);
    };
    const yearToX = (year) => {
        if (maxDuration <= 1) return margin + availableWidth / 2;
        return margin + (availableWidth * (year - 1) / (maxDuration - 1));
    };
    
    // Helper function to format currency with spaces as thousand separator
    const formatCurrency = (value) => {
        const rounded = Math.round(value);
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(rounded).replace(/\u202F|\u00A0|\u2009|\u205F/g, ' ');
    };
    
    // Draw chart border only - no fill to show paper color through
    doc.setDrawColor(gridColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, chartY, availableWidth, chartHeight, 'S');
    
    // Draw grid lines (horizontal) with nice rounded values
    doc.setDrawColor(gridColor);
    doc.setLineWidth(0.2);
    
    // Always show 5 horizontal grid lines with nicely rounded currency values
    for (let i = 0; i <= 5; i++) {
        const yPos = chartY + (chartHeight * i / 5);
        doc.line(margin, yPos, margin + availableWidth, yPos);
        
        // Calculate the value at this grid line
        const value = maxValue - (valueRange * i / 5);
        
        // Round to nearest nice value (5000, 10000, 25000, 50000, etc.)
        let roundedValue;
        if (value >= 1000000) {
            roundedValue = Math.round(value / 100000) * 100000;
        } else if (value >= 500000) {
            roundedValue = Math.round(value / 50000) * 50000;
        } else if (value >= 100000) {
            roundedValue = Math.round(value / 25000) * 25000;
        } else if (value >= 50000) {
            roundedValue = Math.round(value / 10000) * 10000;
        } else {
            roundedValue = Math.round(value / 5000) * 5000;
        }
        
        // Add value label on the left
        doc.setTextColor(textColor);
        doc.setFontSize(7);
        const valueText = formatCurrency(roundedValue);
        const textWidth = doc.getTextWidth(valueText);
        doc.text(valueText, margin - textWidth - 2, yPos + 1);
    }
    
    // Draw axes
    doc.setDrawColor(textColor);
    doc.setLineWidth(0.5);
    doc.line(margin, chartY, margin, chartY + chartHeight);        // Y-axis
    doc.line(margin, chartY + chartHeight, margin + availableWidth, chartY + chartHeight); // X-axis
    
    // Draw X-axis labels (years)
    doc.setFontSize(8);
    const labelStep = Math.max(1, Math.ceil(maxDuration / 5));
    for (let year = 1; year <= maxDuration; year += labelStep) {
        const xPos = yearToX(year);
        const label = `${translations.year || 'Year'} ${year}`;
        const textWidth = doc.getTextWidth(label);
        doc.text(label, xPos - textWidth / 2, chartY + chartHeight + 4);
    }
    
    // Draw purchase curve (blue) - thin lines, no fill to avoid overlay issues
    doc.setDrawColor(purchaseColor);
    doc.setLineWidth(0.5);
    
    if (cumulativePurchase.length > 0) {
        const startX = yearToX(1);
        const startY = valueToY(cumulativePurchase[0]);
        doc.moveTo(startX, startY);
        for (let year = 2; year <= maxDuration; year++) {
            doc.lineTo(yearToX(year), valueToY(cumulativePurchase[year - 1]));
        }
        doc.stroke();
        
        // Add legend
        doc.setFontSize(9);
        doc.setTextColor(purchaseColor);
        doc.text(translations.reportCumulPurchaseLosses || 'Purchase', margin + availableWidth - 80, chartY + 16);
    }
    
    // Draw rent curve (red) - thin lines, no fill to avoid overlay issues
    doc.setDrawColor(rentColor);
    doc.setLineWidth(0.5);
    
    if (cumulRent.length > 0) {
        const startX = yearToX(1);
        const startY = valueToY(cumulRent[0]);
        doc.moveTo(startX, startY);
        for (let year = 2; year <= maxDuration; year++) {
            doc.lineTo(yearToX(year), valueToY(cumulRent[year - 1]));
        }
        doc.stroke();
        
        // Add legend
        doc.setFontSize(9);
        doc.setTextColor(rentColor);
        doc.text(translations.reportRentalCumulativeExpenses || 'Rent', margin + availableWidth - 80, chartY + 8);
    }
    
    // Draw pivot point vertical line - precise to the month
    if (pivot && pivot.years !== undefined) {
        // Calculate exact position including months (pivot.totalMonths is the exact crossing point)
        const pivotYearExact = pivot.totalMonths / 12;
        const pivotX = yearToX(pivotYearExact);
        
        doc.setDrawColor(pivotLineColor);
        doc.setLineWidth(0.5);
        if (typeof doc.setLineDash === 'function') {
            doc.setLineDash([2, 2]);
        }
        doc.line(pivotX, chartY, pivotX, chartY + chartHeight);
        
        // Add label with year and month
        doc.setFontSize(7);
        doc.setTextColor(blackColor);
        if (typeof doc.setLineDash === 'function') {
            doc.setLineDash([]);
        }
        const yearLabel = pivot.years || 0;
        const monthLabel = pivot.months || 0;
        const label = `${yearLabel} ${translations.year || 'Year'} ${monthLabel} ${translations.months || translations.month || 'Month'}`;
        const textWidth = doc.getTextWidth(label);
        doc.text(label, pivotX - textWidth / 2, chartY + chartHeight + 8);
    }
    
    // Add horizontal line at crossing point and value on Y-axis
    if (pivot && typeof pivot.totalMonths === 'number' && Array.isArray(cumulRent) && cumulRent.length > pivot.totalMonths) {
        try {
            const pivotYearExact = pivot.totalMonths / 12;
            const crossingValue = cumulRent[pivot.totalMonths];
            const crossingY = valueToY(crossingValue);
            const pivotX = yearToX(pivotYearExact);
            
            // Only draw if crossingY is within visible chart area
            if (!isNaN(crossingY) && crossingY >= chartY && crossingY <= chartY + chartHeight) {
                // Draw horizontal line across the entire chart at crossing Y
                doc.setDrawColor('#999999'); // Medium gray, visible on both light and dark backgrounds
                doc.setLineWidth(0.5);
                doc.line(margin, crossingY, margin + availableWidth, crossingY);
                
                // Add crossing value on the Y-axis (left side) like other values
                const valueText = formatCurrency(crossingValue);
                const textWidth = doc.getTextWidth(valueText);
                doc.setTextColor(textColor);
                doc.setFontSize(7);
                doc.text(valueText, margin - textWidth - 2, crossingY + 1);
            }
        } catch (e) {
            console.error('Error drawing crossing line:', e);
        }
    }
}

/**
 * Adds a header to the PDF.
 */
export function addPDFHeader(doc, translations, margin) {
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(translations.reportTitle, margin, margin);
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
        tdValue.innerHTML = row.value;
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
