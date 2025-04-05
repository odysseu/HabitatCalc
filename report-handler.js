let myChart = null; // Déclarer une variable pour contenir l'instance du graphique globalement ou dans la portée appropriée

function generateReport() {
    // Récupérer les valeurs du formulaire
    const price = parseFloat(document.getElementById('price').value);
    const notary = parseFloat(document.getElementById('notary').value) / 100;
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const contribution = parseFloat(document.getElementById('contribution').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const laonDuration = parseInt(document.getElementById('laonDuration').value);
    const insuranceRate = parseInt(document.getElementById('insuranceRate').value);
    const fictitiousRent = parseFloat(document.getElementById('fictitiousRent').value);
    const HousingTax = parseFloat(document.getElementById('HousingTax').value);
    const propertyTax = parseFloat(document.getElementById('propertyTax').value);
    const fictitiousRentRate = parseFloat(document.getElementById('fictitiousRentRate').value) / 100;
    const coOwnershipFees = parseFloat(document.getElementById('coOwnership').value);
    const dureeMax = 500;

    const notaryFees = price * notary;
    const commisionFees = price * commission;
    const totalAchat = price + notaryFees + commisionFees;
    const borrowedAmount = totalAchat - contribution;
    const mensualite = calculerMensualite(borrowedAmount, laonDuration, interestRate, insuranceRate);
    const coutTotalEmprunt = mensualite * laonDuration * 12;
    const totalInterestCost = coutTotalEmprunt - borrowedAmount;
    const cumulIncomes = extractIncomes();
    const cumulMonthlyIncomes = cumulIncomes / 12;
    const TAEG = calculateTAEG();

    const anneeRemboursement = trouverAnneePertesInferieures(price, notaryFees, commisionFees, contribution, mensualite, propertyTax, appreciationRate, dureeMax, laonDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees);
    const maxDuree = Math.max(laonDuration, anneeRemboursement) + 1; // 1 more year to see after meeting year
    const cumulLocation = calculerPertesLocation(fictitiousRent, maxDuree, fictitiousRentRate);
    const cumulAchat = calculerPertesAchat(price, notaryFees, commisionFees, contribution, mensualite, propertyTax, appreciationRate, maxDuree, laonDuration, cumulIncomes, coOwnershipFees);

    // Concaténer les résultats et le graphique
    let resultat = `
        <h2>${translations.reportTitle}</h2>

        <div>
            <h3>${translations.reportAchat}</h3>
            <table>
                <tr>
                    <td>${translations.reportPrice}:</td>
                    <td style="text-align: right;">${price.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportnotaryFees}:</td>
                    <td style="text-align: right;">${notaryFees.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportAppreciationRate}:</td>
                    <td style="text-align: right;">${(appreciationRate * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportCommission}:</td>
                    <td style="text-align: right;">${commisionFees.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTotalAchat}:</td>
                    <td style="text-align: right;">${totalAchat.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportCoOwnership}:</td>
                    <td style="text-align: right;">${coOwnershipFees.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportEmprunt}</h3>
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
                    <td>${translations.reportTAEG}:</td>
                    <td style="text-align: right;">${(TAEG).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportMensualite}:</td>
                    <td style="text-align: right;">${mensualite.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTotalInterests}:</td>
                    <td style="text-align: right;">${totalInterestCost.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportCoutTotalEmprunt}:</td>
                    <td style="text-align: right;">${coutTotalEmprunt.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportFinancement}</h3>
            <table>
                <tr>
                    <td>${translations.reportFictitiousMonthlyRent}:</td>
                    <td style="text-align: right;">${fictitiousRent.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxEvolutionFictitiousRent}:</td>
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

    // Ajouter les incomes au résultat
    if (cumulMonthlyIncomes > 0) {
        resultat += `
                <tr>
                    <td>${translations.reportMonthlyAgregatedIncome}:</td>
                    <td style="text-align: right;">${cumulMonthlyIncomes.toFixed(2)} €</td>
                </tr>
        `;
    }

    resultat += `
            </table>
        </div>
        <div>
            <h3>${translations.reportAmortissement}</h3>
            <p>${translations.reportAnneeRemboursement}: ${anneeRemboursement}</p>
        </div>
    `;

    document.getElementById('resultat').innerHTML = resultat;
    // Générer le graphique
    genererGraphique(cumulLocation, cumulAchat, maxDuree);

    const rapportBouton = `
        <label for="pdf-filename">${translations.pdfFileName}</label>
        <input type="text" id="pdf-filename" name="pdf-filename" placeholder=${translations.pdfFileNamePlaceHolder} required>
        <button id="telecharger-button">${translations.downloadPDF}</button>
    `;

    document.getElementById('rapport-bouton').innerHTML = rapportBouton;

    // Attacher l'événement de téléchargement au bouton
    document.getElementById('telecharger-button').addEventListener('click', telechargerPDF);
}

function genererGraphique(cumulLocation, cumulAchat, maxDuree) {
    // 1. Détruire le graphique existant s'il existe
    if (myChart) {
        myChart.destroy();
    }

    // 2. Obtenir l'élément canvas et ajuster sa taille
    const ctx = document.getElementById('myChart').getContext('2d');
    const canvas = ctx.canvas;
    const parent = canvas.parentNode;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    // Ajuster la taille du canvas en fonction de la taille de l'écran
    canvas.width = parentWidth;
    canvas.height = parentHeight;
    const labels = Array.from({ length: maxDuree + 1 }, (_, i) => `${translations.annee} ${i}`);
    // 3. Créer le nouveau graphique avec des options de responsivité
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${translations.reportCumulDepensesLocation}`,
                    data: cumulLocation,
                    borderColor: 'rgb(255, 99, 132)',
                    fill: false
                },
                {
                    label: `${translations.reportCumulDepensesAchat}`,
                    data: cumulAchat,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, //false, // Désactiver le maintien du ratio d'aspect pour s'adapter à la taille du parent
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `${translations.reportTitle}`
                }
            }
        }
    });
    // 4. Mettre à jour le contenu HTML de l'élément canvas
    document.getElementById('myChart').innerHTML = myChart;
}

async function telechargerPDF() {
    const wasDarkMode = forcerModeClair();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Configuration des marges et positions
    const margin = 20;
    const tableSpacing = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - 2 * margin;

    doc.text(margin, margin, `${translations.reportTitle}`);
    var finalY = doc.lastAutoTable.finalY || tableSpacing

    const price = parseFloat(document.getElementById('price').value);
    const notary = parseFloat(document.getElementById('notary').value) / 100;
    const coOwnership = parseFloat(document.getElementById('coOwnership').value);
    const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const fictitiousRentRate = parseFloat(document.getElementById('fictitiousRentRate').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const contribution = parseFloat(document.getElementById('contribution').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const laonDuration = parseInt(document.getElementById('laonDuration').value);
    const insuranceRate = parseInt(document.getElementById('insuranceRate').value);
    const fictitiousRent = parseFloat(document.getElementById('fictitiousRent').value);
    const HousingTax = parseFloat(document.getElementById('HousingTax').value);
    const propertyTax = parseFloat(document.getElementById('propertyTax').value);
    const TAEG = calculateTAEG();

    const notaryFees = price * notary;
    const commisionFees = price * commission;
    const totalAchat = price + notaryFees + commisionFees;
    const borrowedAmount = totalAchat - contribution;
    const mensualite = interestRate === 0 ? borrowedAmount / (laonDuration * 12) : (borrowedAmount * interestRate / 12) / (1 - Math.pow(1 + interestRate / 12, -laonDuration * 12));
    const coutTotalEmprunt = mensualite * laonDuration * 12;
    const totalInterestCost = coutTotalEmprunt - borrowedAmount;

    const dureeMax = 500;
    const coOwnershipFees = parseFloat(document.getElementById('coOwnership').value);
    const cumulIncomes = extractIncomes();
    const anneeRemboursement = trouverAnneePertesInferieures(price, notaryFees, commisionFees, contribution, mensualite, propertyTax, appreciationRate, dureeMax, laonDuration, fictitiousRent, fictitiousRentRate, cumulIncomes, coOwnershipFees);
    // Tableau Achat
    doc.autoTable({
        startY: finalY + margin,
        head: [[`${translations.reportAchat}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportPrice}`, `${price.toFixed(2)} €`],
            [`${translations.reportnotaryFees}`, `${notaryFees.toFixed(2)} €`],
            [`${translations.reportAppreciationRate}`, `${(appreciationRate * 100).toFixed(2)} %`],
            [`${translations.reportCommission}`, `${commisionFees.toFixed(2)} €`],
            [`${translations.reportTotalAchat}`, `${totalAchat.toFixed(2)} €`],
            [`${translations.reportCoOwnership}`, `${coOwnership.toFixed(2)} €`]
        ]
    });

    // Tableau Emprunt
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportEmprunt}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.contribution}`, `${contribution.toFixed(0)} €`],
            [`${translations.reportBorrowedAmount}`, `${borrowedAmount.toFixed(0)} €`],
            [`${translations.reportInterestRate}`, `${(interestRate * 100).toFixed(2)} %`],
            [`${translations.reportInsuranceRate}`, `${(insuranceRate * 100).toFixed(2)} %`],
            [`${translations.reportTAEG}`, `${(TAEG).toFixed(2)} %`],
            [`${translations.reportMensualite}`, `${mensualite.toFixed(0)} €`],
            [`${translations.reportTotalInterests}`, `${totalInterestCost.toFixed(0)} €`],
            [`${translations.reportCoutTotalEmprunt}`, `${coutTotalEmprunt.toFixed(0)} €`]
        ]
    });

    // Tableau Financement
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportFinancement}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportFictitiousMonthlyRent}`, `${fictitiousRent.toFixed(0)} €`],
            [`${translations.reportTauxEvolutionFictitiousRent}`, `${(fictitiousRentRate * 100).toFixed(2)} %`],
            [`${translations.reportHousingTaxAnnuelle}`, `${HousingTax.toFixed(0)} €`],
            [`${translations.reportPropertyTaxAnnuelle}`, `${propertyTax.toFixed(0)} €`]
        ]
    });
    doc.addPage();

    // Ajouter la phrase de rappel
    doc.text(`${translations.reportAnneeRemboursement}: ${anneeRemboursement}`, margin, doc.lastAutoTable.finalY + tableSpacing);
    doc.text(`${translations.reportRappelRentabilite}: ${anneeRemboursement}`, margin, doc.lastAutoTable.finalY + tableSpacing * 2);

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImageData = chart.toDataURL('image/png');

    // Calculer la hauteur de l'image en fonction de la largeur disponible
    const imageWidth = availableWidth;
    const imageHeight = (chart.height * imageWidth) / chart.width;

    doc.addImage(
        chartImageData, 'PNG', margin, margin, imageWidth, imageHeight
    );
    // addImage(imageData, format, x, y, width, height, alias, compression, rotation)

    const filename = document.getElementById('pdf-filename').placeholder || translations.pdfFilenamePlaceHolder;
    // console.log('pdf-filename : ', document.getElementById('pdf-filename').placeholder);
    const pdfFilename = filename.endsWith('.pdf') ? filename : filename + ".pdf";
    doc.save(pdfFilename);

    restaurerMode(wasDarkMode);
}
