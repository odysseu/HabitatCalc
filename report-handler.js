let myChart = null; // Déclarer une variable pour contenir l'instance du graphique globalement ou dans la portée appropriée

function genererRapport() {
    // Récupérer les valeurs du formulaire
    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const tauxAppreciation = parseFloat(document.getElementById('taux-appreciation').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
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

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = calculerMensualite(montantEmprunte, dureePret, tauxInteret, tauxAssurance) ;
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;
    const cumulLoyers = extraireLoyers();
    const cumulMensuelLoyers = cumulLoyers / 12;
    const TAEG = calculateTAEG();

    const anneeRemboursement = trouverAnneePertesInferieures(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, dureeMax, dureePret, loyerFictif, tauxLoyerFictif, cumulLoyers, fraisCopropriete);
    const maxDuree = Math.max(dureePret, anneeRemboursement) + 1; // 1 more year to see after meeting year
    const cumulLocation = calculerPertesLocation(loyerFictif, maxDuree, tauxLoyerFictif);
    const cumulAchat = calculerPertesAchat(prix, fraisNotaire, fraisCommission, apport, mensualite, taxeFonciere, tauxAppreciation, maxDuree, dureePret, cumulLoyers, fraisCopropriete);

    // Concaténer les résultats et le graphique
    let resultat = `
        <h2>${translations.reportTitle}</h2>

        <div>
            <h3>${translations.reportAchat}</h3>
            <table>
                <tr>
                    <td>${translations.reportPrix}:</td>
                    <td style="text-align: right;">${prix.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportFraisNotaire}:</td>
                    <td style="text-align: right;">${fraisNotaire.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td>${translations.reportTauxAppreciation}:</td>
                    <td style="text-align: right;">${(tauxAppreciation * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                    <td>${translations.reportCommission}:</td>
                    <td style="text-align: right;">${fraisCommission.toFixed(2)} €</td>
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

    // 2. Obtenir l'élément canvas
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = Array.from({ length: maxDuree + 1 }, (_, i) => `${translations.annee} ${i}`);
    // 3. Créer le nouveau graphique
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
            devicePixelRatio: 2,
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

function telechargerPDF() {
    const wasDarkMode = forcerModeClair();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(20, 20, `${translations.reportTitle}`);

    const prix = parseFloat(document.getElementById('prix').value);
    const notaire = parseFloat(document.getElementById('notaire').value) / 100;
    const copropriete = parseFloat(document.getElementById('copropriete').value);
    const tauxAppreciation = parseFloat(document.getElementById('taux-appreciation').value) / 100;
    const tauxLoyerFictif = parseFloat(document.getElementById('taux-loyer-fictif').value) / 100;
    const commission = parseFloat(document.getElementById('commission').value) / 100;
    const apport = parseFloat(document.getElementById('apport').value);
    const tauxInteret = parseFloat(document.getElementById('taux-interet').value) / 100;
    const dureePret = parseInt(document.getElementById('duree-pret').value);
    const tauxAssurance = parseInt(document.getElementById('taux-assurance').value);
    const loyerFictif = parseFloat(document.getElementById('loyer-fictif').value);
    const taxeHabitation = parseFloat(document.getElementById('taxe-habitation').value);
    const taxeFonciere = parseFloat(document.getElementById('taxe-fonciere').value);
    const TAEG = calculateTAEG();

    const fraisNotaire = prix * notaire;
    const fraisCommission = prix * commission;
    const totalAchat = prix + fraisNotaire + fraisCommission;
    const montantEmprunte = totalAchat - apport;
    const mensualite = tauxInteret === 0 ? montantEmprunte / (dureePret * 12) : (montantEmprunte * tauxInteret / 12) / (1 - Math.pow(1 + tauxInteret / 12, -dureePret * 12));
    const coutTotalEmprunt = mensualite * dureePret * 12;
    const coutTotalInterets = coutTotalEmprunt - montantEmprunte;

    // Tableau Achat
    doc.autoTable({
        head: [[`${translations.reportAchat}`, `${translations.reportPrix}`]],
        body: [
            [`${translations.reportPrix}`, `${prix.toFixed(2)} €`],
            [`${translations.reportFraisNotaire}`, `${fraisNotaire.toFixed(2)} €`],
            [`${translations.reportTauxAppreciation}`, `${(tauxAppreciation * 100).toFixed(2)} %`],
            [`${translations.reportCommission}`, `${fraisCommission.toFixed(2)} €`],
            [`${translations.reportTotalAchat}`, `${totalAchat.toFixed(2)} €`],
            [`${translations.reportCopropriete}`, `${copropriete.toFixed(2)} €`]
        ],
        startY: 20
    });

    // Tableau Emprunt
    doc.autoTable({
        head: [[`${translations.reportEmprunt}`, `${translations.reportPrix}`]],
        body: [
            [`${translations.apport}`, `${apport.toFixed(0)} €`],
            [`${translations.reportMontantEmprunte}`, `${montantEmprunte.toFixed(0)} €`],
            [`${translations.reportTauxInteret}`, `${(tauxInteret * 100).toFixed(2)} %`],
            [`${translations.reportTauxAssurance}`, `${(tauxAssurance * 100).toFixed(2)} %`],
            [`${translations.reportTAEG}`, `${(TAEG).toFixed(2)} %`],
            [`${translations.reportMensualite}`, `${mensualite.toFixed(0)} €`],
            [`${translations.reportInteretsTotaux}`, `${coutTotalInterets.toFixed(0)} €`],
            [`${translations.reportCoutTotalEmprunt}`, `${coutTotalEmprunt.toFixed(0)} €`]
        ],
        startY: doc.previousAutoTable.finalY + 10
    });

    // Tableau Financement
    doc.autoTable({
        head: [[`${translations.reportFinancement}`, `${translations.reportPrix}`]],
        body: [
            [`${translations.reportLoyerFictifMensuel}`, `${loyerFictif.toFixed(0)} €`],
            [`${translations.reportTauxEvolutionLoyerFictif}`, `${(tauxLoyerFictif * 100).toFixed(2)} %`],
            [`${translations.reportTaxeHabitationAnnuelle}`, `${taxeHabitation.toFixed(0)} €`],
            [`${translations.reportTaxeFonciereAnnuelle}`, `${taxeFonciere.toFixed(0)} €`]
        ],
        startY: doc.previousAutoTable.finalY + 10
    });

    // Ajouter le graphique au PDF
    const chart = document.getElementById('myChart');
    const chartImage = chart.toDataURL('image/png');
    doc.addImage(chartImage, 'PNG', 15, 200, 180, 90);

    const filename = document.getElementById('pdf-filename').placeholder || translations.pdfFilenamePlaceHolder;
    console.log('pdf-filename : ', document.getElementById('pdf-filename').placeholder);
    const pdfFilename = filename.endsWith('.pdf') ? filename : filename + ".pdf";
    doc.save(pdfFilename);

    restaurerMode(wasDarkMode);
}
