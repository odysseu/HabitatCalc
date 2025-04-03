let myChart = null; // Déclarer une variable pour contenir l'instance du graphique globalement ou dans la portée appropriée

function genererRapport() {
    // Récupérer les valeurs du formulaire
    const price = parseFloat(document.getElementById('price').value);
    const notary = parseFloat(document.getElementById('notary').value) / 100;
    const tauxAppreciation = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const tauxInteret = parseFloat(document.getElementById('taux-interet').value) / 100;
    const dureePret = parseInt(document.getElementById('duree-pret').value);
    const tauxAssurance = parseInt(document.getElementById('taux-assurance').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe-habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe-fonciere').value);
    const tauxLoyerFictif = parseFloat(document.getElementById('taux-loyer-fictif').value) / 100;
    const fraisCopropriete = parseFloat(document.getElementById('copropriete').value);
    const dureeMax = 500;

    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const totalAchat = price + notaryFees + agencyCommissionFees;
    const montantEmprunte = totalAchat - apport;
    const mensualite = calculerMensualite(montantEmprunte, dureePret, tauxInteret, tauxAssurance);
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;
    const cumulLoyers = extraireLoyers();
    const cumulMensuelLoyers = cumulLoyers / 12;
    const TAEG = calculateTAEG();

    const anneeRemboursement = trouverAnneePertesInferieures(price, notaryFees, agencyCommissionFees, apport, mensualite, taxeFonciere, tauxAppreciation, dureeMax, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers, fraisCopropriete);
    const maxDuree = Math.max(dureePret, anneeRemboursement) + 1; // 1 more year to see after meeting year
    const cumulLocation = calculerPertesLocation(loyerFictif, maxDuree, tauxLoyerFictif);
    const cumulAchat = calculerPertesAchat(price, notaryFees, agencyCommissionFees, apport, mensualite, taxeFonciere, tauxAppreciation, maxDuree, dureePret, cumulLoyers, fraisCopropriete);

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
                    <td>${translations.reportTauxAppreciation}:</td>
                    <td style="text-align: right;">${(tauxAppreciation * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportAgencyCommission}:</td>
                    <td style="text-align: right;">${agencyCommissionFees.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTotalAchat}:</td>
                    <td style="text-align: right;">${totalAchat.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportCopropriete}:</td>
                    <td style="text-align: right;">${fraisCopropriete.toFixed(2)} €</td>
                </tr>
            </table>
        </div>
        <div>
            <h3>${translations.reportEmprunt}</h3>
            <table>
                <tr>
                    <td>${translations.apport}:</td>
                    <td style="text-align: right;">${apport.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportMontantEmprunte}:</td>
                    <td style="text-align: right;">${montantEmprunte.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxAssurance}:</td>
                    <td style="text-align: right;">${(tauxAssurance * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxInteret}:</td>
                    <td style="text-align: right;">${(tauxInteret * 100).toFixed(2)} %</td>
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
                    <td>${translations.reportInteretsTotaux}:</td>
                    <td style="text-align: right;">${coutTotalInterets.toFixed(2)} €</td>
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
                    <td>${translations.reportLoyerFictifMensuel}:</td>
                    <td style="text-align: right;">${loyerFictif.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxEvolutionLoyerFictif}:</td>
                    <td style="text-align: right;">${(tauxLoyerFictif * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportTaxeHabitationAnnuelle}:</td>
                    <td style="text-align: right;">${taxeHabitation.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTaxeFonciereAnnuelle}:</td>
                    <td style="text-align: right;">${taxeFonciere.toFixed(2)} €</td>
                </tr>
    `;

    // Ajouter les loyers au résultat
    if (cumulMensuelLoyers > 0) {
        resultat += `
                <tr>
                    <td>${translations.reportLoyerMoyenTouche}:</td>
                    <td style="text-align: right;">${cumulMensuelLoyers.toFixed(2)} €</td>
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
        <input type="text" id="pdf-filename" name="pdf-filename" placeholder="rapport-immobilier.pdf" required>
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
    const copropriete = parseFloat(document.getElementById('copropriete').value);
    const tauxAppreciation = parseFloat(document.getElementById('appreciation-rate').value) / 100;
    const tauxLoyerFictif = parseFloat(document.getElementById('taux-loyer-fictif').value) / 100;
    const agencyCommission = parseFloat(document.getElementById('agency-commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const tauxInteret = parseFloat(document.getElementById('taux-interet').value) / 100;
    const dureePret = parseInt(document.getElementById('duree-pret').value);
    const tauxAssurance = parseInt(document.getElementById('taux-assurance').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe-habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe-fonciere').value);
    const TAEG = calculateTAEG();

    const notaryFees = price * notary;
    const agencyCommissionFees = price * agencyCommission;
    const totalAchat = price + notaryFees + agencyCommissionFees;
    const montantEmprunte = totalAchat - apport;
    const mensualite = tauxInteret === 0 ? montantEmprunte / (dureePret * 12) : (montantEmprunte * tauxInteret / 12) / (1 - Math.pow(1 + tauxInteret / 12, -dureePret * 12));
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    const dureeMax = 500;
    const fraisCopropriete = parseFloat(document.getElementById('copropriete').value);
    const cumulLoyers = extraireLoyers();
    const anneeRemboursement = trouverAnneePertesInferieures(price, notaryFees, agencyCommissionFees, apport, mensualite, taxeFonciere, tauxAppreciation, dureeMax, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers, fraisCopropriete);
    // Tableau Achat
    doc.autoTable({
        startY: finalY + margin,
        head: [[`${translations.reportAchat}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportPrice}`, `${pripricex.toFixed(2)} €`],
            [`${translations.reportnotaryFees}`, `${notaryFees.toFixed(2)} €`],
            [`${translations.reportTauxAppreciation}`, `${(tauxAppreciation * 100).toFixed(2)} %`],
            [`${translations.reportAgencyCommission}`, `${agencyCommissionFees.toFixed(2)} €`],
            [`${translations.reportTotalAchat}`, `${totalAchat.toFixed(2)} €`],
            [`${translations.reportCopropriete}`, `${copropriete.toFixed(2)} €`]
        ]
    });

    // Tableau Emprunt
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportEmprunt}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.apport}`, `${apport.toFixed(0)} €`],
            [`${translations.reportMontantEmprunte}`, `${montantEmprunte.toFixed(0)} €`],
            [`${translations.reportTauxInteret}`, `${(tauxInteret * 100).toFixed(2)} %`],
            [`${translations.reportTauxAssurance}`, `${(tauxAssurance * 100).toFixed(2)} %`],
            [`${translations.reportTAEG}`, `${(TAEG).toFixed(2)} %`],
            [`${translations.reportMensualite}`, `${mensualite.toFixed(0)} €`],
            [`${translations.reportInteretsTotaux}`, `${coutTotalInterets.toFixed(0)} €`],
            [`${translations.reportCoutTotalEmprunt}`, `${coutTotalEmprunt.toFixed(0)} €`]
        ]
    });

    // Tableau Financement
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + tableSpacing,
        head: [[`${translations.reportFinancement}`, `${translations.reportPrice}`]],
        body: [
            [`${translations.reportLoyerFictifMensuel}`, `${loyerFictif.toFixed(0)} €`],
            [`${translations.reportTauxEvolutionLoyerFictif}`, `${(tauxLoyerFictif * 100).toFixed(2)} %`],
            [`${translations.reportTaxeHabitationAnnuelle}`, `${taxeHabitation.toFixed(0)} €`],
            [`${translations.reportTaxeFonciereAnnuelle}`, `${taxeFonciere.toFixed(0)} €`]
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
