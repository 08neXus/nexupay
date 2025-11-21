/* Suggested monthly interest (%) by term for Simple Add-On */
const suggested = { 3:1.5, 6:2, 9:2.5, 12:3, 24:4 };

/* Elements */
const priceEl = document.getElementById('price');
const termEl = document.getElementById('term');
const interestTypeEl = document.getElementById('interestType');
const customToggleEl = document.getElementById('customToggle');
const customInterestEl = document.getElementById('customInterest');

const downToggleEl = document.getElementById('downToggle');
const downPaymentEl = document.getElementById('downPayment');

const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const breakdownTbody = document.querySelector('#breakdown tbody');
const toast = document.getElementById('toast');
const summaryCard = document.getElementById('summaryCard');
const principalVal = document.getElementById('principalVal');
const totalInterestVal = document.getElementById('totalInterestVal');
const monthlyVal = document.getElementById('monthlyVal');

const totalAfterRow = document.getElementById('totalAfterRow');
const totalAfterVal = document.getElementById('totalAfterVal');

const matrixBtn = document.getElementById('matrixBtn');
const matrixModal = document.getElementById('matrixModal');
const closeMatrix = document.getElementById('closeMatrix');

/* Init states */
customInterestEl.disabled = true;
downPaymentEl.disabled = true;

/* Auto apply suggested rate when term changes unless custom toggled */
function updateAutoRate(){
  if (!customToggleEl.checked){
    const t = parseInt(termEl.value,10);
    customInterestEl.value = suggested[t] !== undefined ? suggested[t].toFixed(2) : '';
  }
}
termEl.addEventListener('change', updateAutoRate);
updateAutoRate();

/* Toggle custom interest input */
customToggleEl.addEventListener('change', () => {
  customInterestEl.disabled = !customToggleEl.checked;
  if (!customToggleEl.checked) updateAutoRate();
});

/* Toggle downpayment input */
downToggleEl.addEventListener('change', () => {
  downPaymentEl.disabled = !downToggleEl.checked;
  if (!downToggleEl.checked) downPaymentEl.value = '';
});

/* Toast helper */
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2400);
}

/* Format PHP currency */
function toPHP(n){
  return Number(n).toLocaleString('en-PH', { style:'currency', currency:'PHP', maximumFractionDigits:2 });
}

/* Build table row */
function row(i,begBal,interestAmt,principalAmt,endBal){
  return `<tr>
    <td>${i}</td>
    <td>${toPHP(begBal)}</td>
    <td>${toPHP(interestAmt)}</td>
    <td>${toPHP(principalAmt)}</td>
    <td>${toPHP(endBal)}</td>
  </tr>`;
}

/* Calculate button */
calcBtn.addEventListener('click', () => {
  let originalPrice = parseFloat(priceEl.value);
  if (isNaN(originalPrice) || originalPrice <= 0){
    alert('Enter a valid item price');
    return;
  }

  const term = parseInt(termEl.value,10);
  const interestType = interestTypeEl.value;

  /* DOWNPAYMENT DEDUCTION */
  let downAmt = 0;
  if (downToggleEl.checked){
    downAmt = parseFloat(downPaymentEl.value);
    if (isNaN(downAmt) || downAmt < 0){
      alert('Enter a valid downpayment');
      return;
    }
    if (downAmt >= originalPrice){
      alert('Downpayment must be less than item price');
      return;
    }
  }

  /* Determine rate */
  let ratePct;
  if (customToggleEl.checked){
    ratePct = parseFloat(customInterestEl.value);
    if (isNaN(ratePct) || ratePct < 0){
      alert('Enter a valid custom interest %');
      return;
    }
  } else {
    ratePct = suggested[term] ?? suggested[6];
  }

  const r = ratePct / 100; // monthly decimal

  /* principal after downpayment */
  const principal = originalPrice - (downToggleEl.checked ? downAmt : 0);

  breakdownTbody.innerHTML = '';
  let monthlyPayment = 0;
  let totalInterest = 0;

  if (interestType === 'simple'){ // monthly add-on
    totalInterest = principal * r * term;
    monthlyPayment = (principal + totalInterest) / term;
    const monthlyPrincipal = principal / term;
    const monthlyInterest = totalInterest / term;

    for (let i=1;i<=term;i++){
      const beginning = +(principal - monthlyPrincipal*(i-1));
      const endBal = +(principal - monthlyPrincipal*i).toFixed(2);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, beginning, monthlyInterest, monthlyPrincipal, endBal>0?endBal:0));
    }

  } else if (interestType === 'amortized'){
    monthlyPayment = r===0 ? principal/term : (principal*r)/(1-Math.pow(1+r,-term));
    let remaining = principal;
    for (let i=1;i<=term;i++){
      const interest = +(remaining * r);
      const principalPaid = +(monthlyPayment - interest);
      const endBal = +(remaining - principalPaid);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, remaining, interest, principalPaid, endBal>0?endBal:0));
      remaining = endBal;
      totalInterest += interest;
    }

  } else if (interestType === 'fixed'){
    const interestAmt = principal * r;
    const monthlyPrincipal = principal / term;
    monthlyPayment = monthlyPrincipal + interestAmt;
    totalInterest = interestAmt * term;
    let balRem = principal;
    for (let i=1;i<=term;i++){
      const beginning = +(balRem);
      balRem = +(balRem - monthlyPrincipal);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, beginning, interestAmt, monthlyPrincipal, balRem>0?balRem:0));
    }

  } else if (interestType === 'compound'){
    let bal = principal;
    monthlyPayment = principal / term;
    for (let i=1;i<=term;i++){
      const interest = +(bal * r);
      const principalPaid = monthlyPayment;
      const endBal = +(bal + interest - principalPaid);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, bal, interest, principalPaid, endBal>0?endBal:0));
      totalInterest += interest;
      bal = endBal;
    }
  }

  /* Populate summary */
  summaryCard.classList.remove('hidden');
  totalAfterRow.classList.remove('hidden');

  principalVal.textContent = downToggleEl.checked ? `${toPHP(principal)} (after downpayment)` : toPHP(principal);
  totalInterestVal.textContent = toPHP(totalInterest);
  monthlyVal.textContent = toPHP(monthlyPayment);

  const totalAfter = principal + totalInterest;
  totalAfterVal.textContent = toPHP(totalAfter);

  showToast('Calculation done');
});

/* Clear button */
clearBtn.addEventListener('click', ()=>{
  priceEl.value='';
  downToggleEl.checked=false;
  downPaymentEl.value='';
  downPaymentEl.disabled=true;

  customToggleEl.checked=false;
  customInterestEl.value='';
  customInterestEl.disabled=true;

  breakdownTbody.innerHTML='';
  summaryCard.classList.add('hidden');
  totalAfterRow.classList.add('hidden');

  principalVal.textContent='—';
  totalInterestVal.textContent='—';
  monthlyVal.textContent='—';
  totalAfterVal.textContent='—';

  showToast('Cleared');
});

/* MATRIX MODAL open/close (liquid glass) */
matrixBtn.addEventListener('click', ()=> {
  matrixModal.classList.add('active');
  matrixModal.setAttribute('aria-hidden', 'false');
});
closeMatrix.addEventListener('click', ()=> {
  matrixModal.classList.remove('active');
  matrixModal.setAttribute('aria-hidden', 'true');
});

/* Also close modal when clicking overlay (outside popup) */
matrixModal.addEventListener('click', (e) => {
  if (e.target === matrixModal) {
    matrixModal.classList.remove('active');
    matrixModal.setAttribute('aria-hidden', 'true');
  }
});