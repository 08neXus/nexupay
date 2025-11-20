/* Ultra-clean Material UI calculator logic */

/* Suggested monthly interest (%) by term */
const suggested = { 3:1.3, 6:1.4, 9:1.5, 12:1.6, 24:1.8 };

/* Elements */
const priceEl = document.getElementById('price');
const termEl = document.getElementById('term');
const interestTypeEl = document.getElementById('interestType');
const customToggleEl = document.getElementById('customToggle');
const customInterestEl = document.getElementById('customInterest');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const breakdownTbody = document.querySelector('#breakdown tbody');
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
updateAutoRate();

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

  let monthlyPayment = 0;
  let totalInterest = 0;
  let remaining = price;

  if (interestType === 'simple'){ // monthly add-on (simple)
    totalInterest = price * r * term;
    const totalPayable = price + totalInterest;
    monthlyPayment = totalPayable / term;

    const monthlyPrincipal = price / term;
    const monthlyInterest = totalInterest / term;

    for (let i=1;i<=term;i++){
      const endBal = +(price - monthlyPrincipal * i).toFixed(2);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, price - monthlyPrincipal*(i-1), monthlyInterest, monthlyPrincipal, endBal));
      totalInterest += 0; // already accounted
    }

    // show summary
    summaryCard.classList.remove('hidden');
    principalVal.textContent = toPHP(price);
    totalInterestVal.textContent = toPHP(totalInterest);
    monthlyVal.textContent = toPHP(monthlyPayment);

  } else if (interestType === 'amortized'){
    // standard amortization on reducing balance
    if (r === 0){
      monthlyPayment = price / term;
    } else {
      monthlyPayment = (price * r) / (1 - Math.pow(1 + r, -term));
    }
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

    summaryCard.classList.remove('hidden');
    principalVal.textContent = toPHP(price);
    totalInterestVal.textContent = toPHP(totalInterest);
    monthlyVal.textContent = toPHP(monthlyPayment);

  } else if (interestType === 'fixed'){
    // fixed monthly interest amount based on original price
    const interestAmt = price * r;
    const monthlyPrincipal = price / term;
    monthlyPayment = monthlyPrincipal + interestAmt;
    totalInterest = interestAmt * term;
    let balRem = price;
    for (let i=1;i<=term;i++){
      balRem = +(balRem - monthlyPrincipal);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, +(monthlyPrincipal), +(interestAmt), +(monthlyPayment), balRem>0?balRem:0));
    }
    summaryCard.classList.remove('hidden');
    principalVal.textContent = toPHP(price);
    totalInterestVal.textContent = toPHP(totalInterest);
    monthlyVal.textContent = toPHP(monthlyPayment);

  } else if (interestType === 'compound'){
    // compound monthly (balance grows by interest then principal paid)
    let bal = price;
    monthlyPayment = price / term; // keep principal equal each month (compound accrues interest)
    totalInterest = 0;
    for (let i=1;i<=term;i++){
      const interest = +(bal * r);
      const principal = monthlyPayment;
      const endBal = +(bal + interest - principal);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, bal, interest, principal, endBal>0?endBal:0));
      totalInterest += interest;
      bal = endBal;
    }
    summaryCard.classList.remove('hidden');
    principalVal.textContent = toPHP(price);
    totalInterestVal.textContent = toPHP(totalInterest);
    monthlyVal.textContent = toPHP(monthlyPayment);
  }

  // show small feedback
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