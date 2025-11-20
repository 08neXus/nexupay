/* Ultra-clean Material UI calculator logic */

/* Suggested monthly interest (%) by term (Fixed Monthly Add-On Rate) */
const suggested = {
  3: 1.5,
  6: 2.0,
  9: 2.5,
  12: 3.0,
  24: 4.0
};

/* Elements */
const priceEl = document.getElementById('price');
const termEl = document.getElementById('term');
const interestTypeEl = document.getElementById('interestType');
const customToggleEl = document.getElementById('customToggle');
const customInterestEl = document.getElementById('customInterest');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const breakdownTbody = document.querySelector('#breakdown tbody');
const computationSummary = document.getElementById('computationSummary');
const toast = document.getElementById('toast');
const summaryCard = document.getElementById('summaryCard');
const principalVal = document.getElementById('principalVal');
const totalInterestVal = document.getElementById('totalInterestVal');
const monthlyVal = document.getElementById('monthlyVal');

/* Initialize custom interest disabled */
customInterestEl.disabled = true;

/* Auto apply suggested rate when term changes unless custom toggled */
function updateAutoRate(){
  if (!customToggleEl.checked){
    const t = parseInt(termEl.value,10);
    customInterestEl.value = suggested[t] !== undefined ? suggested[t].toFixed(2) : '';
  }
}
termEl.addEventListener('change', updateAutoRate);
updateAutoRate(); // run on load

/* Toggle custom interest input */
customToggleEl.addEventListener('change', () => {
  customInterestEl.disabled = !customToggleEl.checked;
  if (!customToggleEl.checked) updateAutoRate();
  else customInterestEl.focus();
});

/* Show toast helper */
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2400);
}

/* Format PHP currency */
function toPHP(n){
  return Number(n).toLocaleString('en-PH', { style:'currency', currency:'PHP', maximumFractionDigits:2 });
}

/* Calculate flow */
calcBtn.addEventListener('click', () => {
  const price = parseFloat(priceEl.value);
  const term = parseInt(termEl.value,10);
  const interestType = interestTypeEl.value;
  let ratePct;

  if (customToggleEl.checked){
    ratePct = parseFloat(customInterestEl.value);
    if (isNaN(ratePct) || ratePct <= 0){
      alert('Enter a valid custom interest %');
      return;
    }
  } else {
    ratePct = suggested[term] ?? suggested[6];
  }

  if (!price || price <= 0){
    alert('Enter a valid item price');
    return;
  }

  const r = ratePct / 100; // monthly decimal
  breakdownTbody.innerHTML = '';
  computationSummary.classList.remove('hidden');

  let monthlyPayment = 0;
  let totalInterest = 0;
  let remaining = price;

  /* Show computation summary above table */
  if (interestType === 'simple') {
    const totalInterestCalc = price * r * term;
    const monthlyPaymentCalc = (price + totalInterestCalc) / term;
    computationSummary.innerHTML = `
      <span>Monthly Add-On Calculation:</span><br>
      Total Interest = ${toPHP(price)} × ${ratePct.toFixed(2)}% × ${term} months = ${toPHP(totalInterestCalc)}<br>
      Monthly Payment = (${toPHP(price)} + ${toPHP(totalInterestCalc)}) ÷ ${term} = ${toPHP(monthlyPaymentCalc)}
    `;
  } else {
    computationSummary.innerHTML = `<span>Computation:</span> Interest Rate = ${ratePct.toFixed(2)}% per month, Term = ${term} months`;
  }

  if (interestType === 'simple'){ 
    totalInterest = price * r * term;
    monthlyPayment = (price + totalInterest) / term;
    const monthlyPrincipal = price / term;
    const monthlyInterest = totalInterest / term;

    for (let i=1;i<=term;i++){
      const endBal = +(price - monthlyPrincipal * i).toFixed(2);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, price - monthlyPrincipal*(i-1), monthlyInterest, monthlyPrincipal, endBal));
    }

  } else if (interestType === 'amortized'){
    monthlyPayment = r===0 ? price/term : (price * r) / (1 - Math.pow(1 + r, -term));
    totalInterest = 0;
    remaining = price;
    for (let i=1;i<=term;i++){
      const interest = +(remaining * r);
      const principal = +(monthlyPayment - interest);
      const endBal = +(remaining - principal);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, remaining, interest, principal, endBal>0?endBal:0));
      remaining = endBal;
      totalInterest += interest;
    }

  } else if (interestType === 'fixed'){
    const interestAmt = price * r;
    const monthlyPrincipal = price / term;
    monthlyPayment = monthlyPrincipal + interestAmt;
    totalInterest = interestAmt * term;
    let balRem = price;
    for (let i=1;i<=term;i++){
      balRem = +(balRem - monthlyPrincipal);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, monthlyPrincipal, interestAmt, monthlyPayment, balRem>0?balRem:0));
    }

  } else if (interestType === 'compound'){
    let bal = price;
    monthlyPayment = price / term;
    totalInterest = 0;
    for (let i=1;i<=term;i++){
      const interest = +(bal * r);
      const principal = monthlyPayment;
      const endBal = +(bal + interest - principal);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, bal, interest, principal, endBal>0?endBal:0));
      totalInterest += interest;
      bal = endBal;
    }
  }

  // Show summary card
  summaryCard.classList.remove('hidden');
  principalVal.textContent = toPHP(price);
  totalInterestVal.textContent = toPHP(totalInterest);
  monthlyVal.textContent = toPHP(monthlyPayment);

  showToast('Calculation done');
});

/* Clear */
clearBtn.addEventListener('click', ()=>{
  priceEl.value = '';
  customToggleEl.checked = false;
  customInterestEl.value = '';
  customInterestEl.disabled = true;
  breakdownTbody.innerHTML = '';
  summaryCard.classList.add('hidden');
  computationSummary.classList.add('hidden');
  computationSummary.innerHTML = '';
  principalVal.textContent = '—';
  totalInterestVal.textContent = '—';
  monthlyVal.textContent = '—';
  showToast('Cleared');
});

/* helper - build row html */
function row(i, begBal, interestAmt, principalAmt, endBal){
  return `<tr>
    <td>${i}</td>
    <td>${toPHP(begBal)}</td>
    <td>${toPHP(interestAmt)}</td>
    <td>${toPHP(principalAmt)}</td>
    <td>${toPHP(endBal)}</td>
  </tr>`;
}