let myChart = null; // graph variable to store the chart instance
import { calculateMonthlyPayment, extractIncomes, calculateAPR, findPivotYear, calculateRentLosses, calculatePurchaseLosses } from './form-handler.js';
import { loadTranslations } from './handle-language.js';
import { forceLightMode, restoreMode } from './dark-mode.js';

function updateSummary(repaymentYear, cumulativePurchase) {
    document.getElementById('repaymentYearDisplay').textContent = repaymentYear;
    document.getElementById('cumulativePurchaseDisplay').textContent = `${cumulativePurchase.toFixed(0)}\u00A0€`;
}

export async function generateReport() {
    // Get the values from the form
    const price = parseFloat(document.getElementById('price').value);
    const notary = parseFloat(document.getElementById('notary').value) / 100;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100;
    const contribution = parseFloat(document.getElementById('contribution').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const loanDuration = parseInt(document.getElementById('loanDuration').value);
    const insuranceRate = parseInt(document.getElementById('insurance-rate').value) / 100;
    const fictitiousRent = parseFloat(document.getElementById('fictitiousRent').value);
    const buyHousingTax = parseFloat(document.getElementById('buyHousingTax').value);
    const rentingHousingTax = parseFloat(document.getElementById('rentingHousingTax').value);
    const propertyTax = parseFloat(document.getElementById('propertyTax').value);
    const fictitiousRentRate = parseFloat(document.getElementById('fictitiousRentRate').value) / 100;
    const coOwnershipFees = parseFloat(document.getElementById('coOwnership').value);
    const maxDuration = 200;
    const fileFees = parseFloat(document.getElementById('file-fees').value);
    // Calculations
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
    const repaymentYear = findPivotYear(price, notaryFees, agencyCommissionFees, contribution, monthlyPayment, propertyTax, buyHousingTax, rentingHousingTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees);
    const maxCalculatedDuration = Math.max(loanDuration, repaymentYear + 4);
    const cumulRent = calculateRentLosses(fictitiousRent, maxCalculatedDuration, fictitiousRentRate, rentingHousingTax);
    const cumulativePurchase = calculatePurchaseLosses(price, notaryFees, agencyCommissionFees, contribution, monthlyPayment, propertyTax, buyHousingTax, appreciationRate, maxCalculatedDuration, loanDuration, cumulIncomes, coOwnershipFees, fileFees);
    // const cumulRentUntilRepayment = cumulRent.slice(0, repaymentYear + 1);
    const cumulativePurchaseUntilRepayment = cumulativePurchase.slice(0, repaymentYear + 1)[repaymentYear];
    // Load translations
    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    updateSummary(repaymentYear, cumulativePurchaseUntilRepayment);
    // Create the main simulation container
    const simulationContainer = document.getElementById('simulation');
    simulationContainer.className = 'simulation';
    simulationContainer.innerHTML = '';
    simulationContainer.appendChild(createSectionTitle(translations.reportTitle));
    // Purchase Section (collapsible)
    simulationContainer.appendChild(createCollapsibleResultsSection(
        translations.reportPurchase,
        [
            { label: translations.reportPrice, value: `${price.toFixed(2)}\u00A0€` },
            { label: translations.reportNotaryFees, value: `${notaryFees.toFixed(2)}\u00A0€` },
            { label: translations.reportAppreciationRate, value: `${(appreciationRate * 100).toFixed(2)}\u00A0%` },
            { label: translations.reportAgencyCommission, value: `${agencyCommissionFees.toFixed(2)}\u00A0€` },
            { label: translations.reportPurchaseTotal, value: `${purchaseTotal.toFixed(2)}\u00A0€` },
            { label: translations.reportCoOwnership, value: `${coOwnershipFees.toFixed(2)}\u00A0€` },
            { label: translations.reportBuyHousingTax, value: `${buyHousingTax.toFixed(2)}\u00A0€` }
        ]
    ));
    // Loan Section (collapsible)
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
    // Renting Section (collapsible)
    const rentingRows = [
        { label: translations.reportFictitiousMonthlyRent, value: `${fictitiousRent.toFixed(2)}\u00A0€` },
        { label: translations.reportFictitiousRentEvolutionRate, value: `${(fictitiousRentRate * 100).toFixed(2)}\u00A0%` },
        { label: translations.reportRentingHousingTax, value: `${rentingHousingTax.toFixed(2)}\u00A0€` },
        { label: translations.reportPropertyTax, value: `${propertyTax.toFixed(2)}\u00A0€` }
    ];
    if (cumulMonthlyIncomes > 0) {
        rentingRows.push({ label: translations.reportMonthlyAgregatedIncome, value: `${cumulMonthlyIncomes.toFixed(2)}\u00A0€` });
    }
    simulationContainer.appendChild(createCollapsibleResultsSection(translations.reportRenting, rentingRows));
    // Chart generation
    await generateChart(cumulRent, cumulativePurchase, maxCalculatedDuration);
    // PDF download section
    const reportButtonContainer = document.getElementById('report-button');
    reportButtonContainer.innerHTML = '';
    const downloadSection = document.createElement('div');
    downloadSection.className = 'report-download-container';
    const filenameLabel = document.createElement('label');
    filenameLabel.setAttribute('for', 'pdf-filename');
    filenameLabel.textContent = translations.pdfFileName;
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
    downloadSection.appendChild(filenameLabel);
    downloadSection.appendChild(filenameInputs);
    reportButtonContainer.appendChild(downloadSection);
    // Add event listener
    document.getElementById('download-button').addEventListener('click', downloadPDF);
}

// Utility function to create section title
function createSectionTitle(text) {
    const title = document.createElement('h2');
    title.textContent = text;
    return title;
}

// Utility function to create a collapsible results section with a table
function createCollapsibleResultsSection(title, rows) {
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

export async function generateChart(cumulRent, cumulativePurchase, maxDuration) {
    // 1. Destroy the chart if it exists
    if (myChart) {
        myChart.destroy();
    }
    // 2. Get the canvas element and adjust size
    const ctx = document.getElementById('myChart').getContext('2d');
    const canvas = ctx.canvas;
    const parent = canvas.parentNode;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    // Adjust the size of the canvas for all displays
    canvas.width = parentWidth;
    canvas.height = parentHeight;
    // Load translations for the chart
    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);
    const labels = Array.from({ length: maxDuration }, (_, i) => `${translations.year} ${i}`);
    const rootStyles = getComputedStyle(document.body);
    const rentColor = rootStyles.getPropertyValue('--graph-rent-color').trim();
    const rentFillColor = rootStyles.getPropertyValue('--graph-rent-fill-color').trim();
    const purchaseColor = rootStyles.getPropertyValue('--graph-purchase-color').trim();
    const purchaseFillColor = rootStyles.getPropertyValue('--graph-purchase-fill-color').trim();
    const textColor = rootStyles.getPropertyValue('--graph-text-color').trim();
    // 3. Create the new chart with responsive options
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${translations.reportRentalCumulativeExpenses}`,
                    data: cumulRent,
                    fill: true,
                    borderColor: `${rentColor}`,
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
            maintainAspectRatio: false,
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
                        },
                        color: `${textColor}`
                    }
                },
                x: {
                    ticks: {
                        color: `${textColor}`
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: `${textColor}`
                    }
                },
                title: {
                    display: true,
                    text: `${translations.graphTitle}`,
                    color: `${textColor}`
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
    // 4. Update the global variable
    // document.getElementById('myChart').innerHTML = myChart;
}

export async function downloadPDF() {
    const wasDarkMode = forceLightMode();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Configuration of margins and positions
    const margin = 20;
    const tableSpacing = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - 2 * margin;
    const language = document.getElementById('language-select').value;
    const translations = await loadTranslations(language);

    // Add a header to the PDF
    doc.setProperties({
        title: translations.reportTitle,
        subject: translations.reportTitle,
        author: 'Your Name',
        keywords: 'finance, report, loan, insurance',
        creator: 'Your Application'
    });

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(margin, margin, translations.reportTitle);

    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : tableSpacing;

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
    const buyHousingTax = parseFloat(document.getElementById('buyHousingTax').value);
    const rentingHousingTax = parseFloat(document.getElementById('rentingHousingTax').value);
    const propertyTax = parseFloat(document.getElementById('propertyTax').value);
    const APR = calculateAPR();
    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const purchaseTotal = price + notaryFees + agencyCommissionFees;
    const borrowedAmount = purchaseTotal - contribution;
    const monthlyPayment = calculateMonthlyPayment(borrowedAmount, loanDuration, interestRate, insuranceRate);
    const loanTotalCost = monthlyPayment * loanDuration * 12;
    const totalInterestCost = loanTotalCost - borrowedAmount;
    const maxDuration = 100;
    const coOwnershipFees = parseFloat(document.getElementById('coOwnership').value);
    const cumulIncomes = extractIncomes();
    const cumulMonthlyIncomes = cumulIncomes / 12;
    const repaymentYear = findPivotYear(price, notaryFees, agencyCommissionFees, contribution, monthlyPayment, propertyTax, appreciationRate, maxDuration, loanDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees, fileFees);

    // Style the tables
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);

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
            [`${translations.reportBuyHousingTax}`, `${buyHousingTax.toFixed(0)} €`],
            [`${translations.reportfileFees}`, `${fileFees.toFixed(2)} €`]
        ],
        styles: {
            fontSize: 10,
            cellPadding: 0.5,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            // fillColor: 240, 240, 240,
            // textColor: 40, 40, 40,
            // lineColor: 200, 200, 200,
            lineWidth: 0.1
        },
        headStyles: {
            // fillColor: 220, 220, 220,
            // textColor: 40, 40, 40,
            fontStyle: 'bold'
        }
    });

    // Loan Table
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
        ],
        styles: {
            fontSize: 10,
            cellPadding: 0.5,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            // fillColor: 240, 240, 240,
            // textColor: 40, 40, 40,
            // lineColor: 200, 200, 200,
            lineWidth: 0.1
        },
        headStyles: {
            // fillColor: 220, 220, 220,
            // textColor: 40, 40, 40,
            fontStyle: 'bold'
        }
    });

    // Renting Table
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportRenting}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportFictitiousMonthlyRent}`, `${fictitiousRent.toFixed(0)} €`],
            [`${translations.reportFictitiousRentEvolutionRate}`, `${(fictitiousRentRate * 100).toFixed(2)} %`],
            [`${translations.reportRentingHousingTax}`, `${rentingHousingTax.toFixed(0)} €`],
            [`${translations.reportPropertyTax}`, `${propertyTax.toFixed(0)} €`]
        ],
        styles: {
            fontSize: 10,
            cellPadding: 0.5,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            // fillColor: 240, 240, 240,
            // textColor: 40, 40, 40,
            // lineColor: 200, 200, 200,
            lineWidth: 0.1
        },
        headStyles: {
            // fillColor: 220, 220, 220,
            // textColor: 40, 40, 40,
            fontStyle: 'bold'
        }
    });

    // Add the cumulative incomes to the PDF
    if (cumulMonthlyIncomes > 0) {
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + tableSpacing,
            head: [[`${translations.reportMonthlyAgregatedIncome}`, `${translations.reportPrice}`]],
            body: [
                [`${translations.reportMonthlyAgregatedIncome}`, `${cumulMonthlyIncomes.toFixed(2)} €`]
            ],
            styles: {
                fontSize: 10,
                cellPadding: 0.5,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                // fillColor: 240, 240, 240,
                // textColor: 40, 40, 40,
                // lineColor: 200, 200, 200,
                lineWidth: 0.1
            },
            headStyles: {
                // fillColor: 220, 220, 220,
                // textColor: 40, 40, 40,
                fontStyle: 'bold'
            }
        });
    }

    // Add the year at which the rent crosses the purchase
    doc.text(`${translations.reportRepaymentYear}: ${repaymentYear}`, margin, doc.lastAutoTable.finalY + tableSpacing);

    // Calculate monthly breakdown
    const monthlyInterestRate = interestRate / 12;
    let remainingBalance = borrowedAmount;
    const monthlyInsurance = borrowedAmount * insuranceRate / 12;
    const monthlyData = [];

    for (let month = 1; month <= loanDuration * 12; month++) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = monthlyPayment - interest - monthlyInsurance;
        remainingBalance -= principal;

        monthlyData.push({
            month: month,
            loan: principal,
            interests: interest,
            insurance: monthlyInsurance
        });
    }

    // Group by year and calculate yearly totals
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

    // Add the monthly breakdown table to the PDF
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`Month`, `Loan`, `Interests`, `Borrower Insurance`]],
        body: monthlyData.map(data => [
            data.month,
            `${data.loan.toFixed(2)} €`,
            `${data.interests.toFixed(2)} €`,
            `${data.insurance.toFixed(2)} €`
        ]),
        styles: {
            fontSize: 10,
            cellPadding: 0.5,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            // fillColor: 240, 240, 240,
            // textColor: 40, 40, 40,
            // lineColor: 200, 200, 200,
            lineWidth: 0.1
        },
        headStyles: {
            // fillColor: 220, 220, 220,
            // textColor: 40, 40, 40,
            fontStyle: 'bold'
        }
    });

    // Add the yearly totals table to the PDF
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`Year`, `Loan`, `Interests`, `Borrower Insurance`, `Total`]],
        body: yearlyData.map(data => [
            data.year,
            `${data.loan.toFixed(2)} €`,
            `${data.interests.toFixed(2)} €`,
            `${data.insurance.toFixed(2)} €`,
            `${data.total.toFixed(2)} €`
        ]),
        styles: {
            fontSize: 10,
            cellPadding: 0.5,
            overflow: 'linebreak',
            halign: 'left',
            valign: 'middle',
            // fillColor: 240, 240, 240,
            // textColor: 40, 40, 40,
            // lineColor: 200, 200, 200,
            lineWidth: 0.1
        },
        headStyles: {
            // fillColor: 220, 220, 220,
            // textColor: 40, 40, 40,
            fontStyle: 'bold'
        }
    });

    // Add the chart to the PDF
    const chart = document.getElementById('myChart');
    const chartImageData = chart.toDataURL('image/png');
    // Calculate the height of the image based on the available width
    const imageWidth = availableWidth;
    const imageHeight = (chart.height * imageWidth) / chart.width;
    // If the image exceeds the page, put it on the next page
    let imageY = doc.lastAutoTable.finalY + tableSpacing;
    if (imageY + imageHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        imageY = margin;
    }
    doc.addImage(
        chartImageData, 'PNG', margin, imageY, imageWidth, imageHeight
    );

    const filename = document.getElementById('pdf-filename').value || document.getElementById('pdf-filename').placeholder;
    const pdfFilename = filename.endsWith('.pdf') ? filename : filename + ".pdf";
    doc.save(pdfFilename);
    restoreMode(wasDarkMode);
}
