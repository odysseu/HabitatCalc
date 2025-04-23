// description: This script handles the event listeners for the form and other UI interactions.

// Import functions from form-handler.js if using modules
// import { resetForm, calculateAPR, addIncome, deleteIncome } from './form-handler.js';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('insuranceRate').addEventListener('input', calculateAPR);
    document.getElementById('interest-rate').addEventListener('input', calculateAPR);
    document.getElementById('file-fees').addEventListener('input', calculateAPR);
    document.getElementById('price').addEventListener('input', calculateAPR);
    document.getElementById('notary').addEventListener('input', calculateAPR);
    document.getElementById('agency-commission').addEventListener('input', calculateAPR);
    document.getElementById('contribution').addEventListener('input', calculateAPR);
    document.getElementById('loanDuration').addEventListener('input', calculateAPR);

    document.getElementById('reset-button').addEventListener('click', resetForm);
    document.getElementById('add-income-button').addEventListener('click', addIncome(document));
});


