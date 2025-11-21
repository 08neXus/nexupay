const suggested = { 3:1.5, 6:2, 9:2.5, 12:3, 24:4 };

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

const matrixBtn = document.getElementById('matrixBtn');
const matrixModal = document.getElementById('matrixModal');
const closeMatrix = document.getElementById('closeMatrix');

customInterestEl.disabled = true;
downPaymentEl.disabled = true;

function updateAutoRate(){
  if (!customToggleEl.checked){
    const t = parseInt(termEl.value,10);
    customInterestEl.value = suggested[t] !== undefined ? suggested[t].toFixed(2) : '';
  }
}
termEl.addEventListener('change', updateAutoRate);
updateAutoRate();

customToggleEl.addEventListener('change', () => {
  customInterestEl.disabled = !customToggleEl.checked;
  if (!customToggleEl.checked) updateAutoRate();
});

downToggleEl.addEventListener('change', () => {
  downPaymentEl.disabled = !downToggleEl.checked;
  if (!downToggleEl.checked) downPaymentEl.value = '';
});

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 2400);
}

function toPHP(n){
  return Number(n).toLocaleString('en-PH', { style:'currency', currency:'PHP', maximumFractionDigits:2 });
}

calcBtn.addEventListener('click', () => {
  let price = parseFloat(priceEl.value);
  const term = parseInt(termEl.value,10);
  const interestType = interestTypeEl.value;

  if (!price || price <= 0){
    alert('Enter a valid item price');
    return;
  }

  let downAmt = 0;
  if (downToggleEl.checked){
    downAmt = parseFloat(downPaymentEl.value);
    if (isNaN(downAmt) || downAmt < 0){
      alert('Enter a valid downpayment');
      return;
    }
    if (downAmt >= price){
      alert('Downpayment must be less than item price');
      return;
    }
    price = price - downAmt;
  }

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

  const r = ratePct / 100;
  breakdownTbody.innerHTML = '';
  let monthlyPayment = 0;
  let totalInterest = 0;

  if (interestType === 'simple'){
    totalInterest = price * r * term;
    monthlyPayment = (price + totalInterest)/term;
    const monthlyPrincipal = price/term;
    const monthlyInterest = totalInterest/term;

    for(let i=1;i<=term;i++){
      const endBal = +(price - monthlyPrincipal*i).toFixed(2);
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, price - monthlyPrincipal*(i-1), monthlyInterest, monthlyPrincipal, endBal));
    }
  } else if(interestType === 'amortized'){
    monthlyPayment = r===0? price/term : (price*r)/(1-Math.pow(1+r,-term));
    let remaining = price;
    for(let i=1;i<=term;i++){
      const interest = remaining*r;
      const principal = monthlyPayment - interest;
      const endBal = remaining - principal;
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, remaining, interest, principal, endBal>0?endBal:0));
      remaining = endBal;
      totalInterest += interest;
    }
  } else if(interestType === 'fixed'){
    const interestAmt = price*r;
    const monthlyPrincipal = price/term;
    monthlyPayment = monthlyPrincipal + interestAmt;
    totalInterest = interestAmt * term;
    let balRem = price;
    for(let i=1;i<=term;i++){
      balRem -= monthlyPrincipal;
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, monthlyPrincipal, interestAmt, monthlyPayment, balRem>0?balRem:0));
    }
  } else if(interestType === 'compound'){
    let bal = price;
    monthlyPayment = price/term;
    for(let i=1;i<=term;i++){
      const interest = bal*r;
      const principal = monthlyPayment;
      const endBal = bal + interest - principal;
      breakdownTbody.insertAdjacentHTML('beforeend', row(i, bal, interest, principal, endBal>0?endBal:0));
      totalInterest += interest;
      bal = endBal;
    }
  }

  summaryCard.classList.remove('hidden');
  principalVal.textContent = downToggleEl.checked ? `${toPHP(price)} (after downpayment)` : toPHP(price);
  totalInterestVal.textContent = toPHP(totalInterest);
  monthlyVal.textContent = toPHP(monthlyPayment);

  showToast('Calculation done');
});

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
  principalVal.textContent='—';
  totalInterestVal.textContent='—';
  monthlyVal.textContent