const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const loanTermInput = document.getElementById('loanTerm');
const interestTypeSelect = document.getElementById('interestType');
const autoAddOnCheckbox = document.getElementById('autoAddOn');
const calculateBtn = document.getElementById('calculateBtn');
const resultTableBody = document.querySelector('#resultTable tbody');
const totalInterestEl = document.getElementById('totalInterest');
const totalPaymentEl = document.getElementById('totalPayment');

calculateBtn.addEventListener('click', () => {
  const principal = parseFloat(loanAmountInput.value);
  const rate = parseFloat(interestRateInput.value) / 100;
  const months = parseInt(loanTermInput.value);
  const type = interestTypeSelect.value;
  const autoAddOn = autoAddOnCheckbox.checked;

  if (!principal || !rate || !months) return alert('Please fill all fields correctly.');

  let balance = principal;
  let totalInterest = 0;
  let tableHTML = '';

  for (let m = 1; m <= months; m++) {
    let interest = 0;
    let payment = 0;

    if (type === 'simple') {
      interest = principal * rate;
      payment = (principal / months) + interest;
    } else if (type === 'amortized') {
      const monthlyRate = rate;
      payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
      interest = balance * monthlyRate;
    } else if (type === 'compound') {
      interest = balance * rate;
      payment = (principal / months) + interest;
    }

    if (autoAddOn) {
      interest = principal * rate;
      payment = (principal / months) + interest;
    }

    balance -= (payment - interest);
    if (balance < 0) balance = 0;

    totalInterest += interest;

    tableHTML += `
      <tr>
        <td>${m}</td>
        <td>${(payment - interest).toFixed(2)}</td>
        <td>${interest.toFixed(2)}</td>
        <td>${payment.toFixed(2)}</td>
        <td>${balance.toFixed(2)}</td>
      </tr>
    `;
  }

  resultTableBody.innerHTML = tableHTML;
  totalInterestEl.textContent = totalInterest.toFixed(2);
  totalPaymentEl.textContent = (principal + totalInterest).toFixed(2);
});