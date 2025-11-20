/* Updated Fixed Monthly Add-On Rates */
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
const toast = document.getElementById('toast');
const summaryCard = document.getElementById('summaryCard');
const principalVal = document.getElementById('principalVal');
const totalInterestVal = document.getElementById('totalInterestVal');
const monthlyVal = document.getElementById('monthlyVal');

/* Auto apply suggested rate */
function updateAutoRate() {
  if (!customToggleEl.checked) {
    const t = parseInt(termEl.value);
    customInterestEl.value = suggested[t].toFixed(2);
  }
}
termEl.addEventListener("change", updateAutoRate);
updateAutoRate();

/* toggle custom */
customToggleEl.addEventListener("change", () => {
  customInterestEl.disabled = !customToggleEl.checked;
  if (!customToggleEl.checked) updateAutoRate();
});

/* show toast */
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 2400);
}

function toPHP(n){
  return Number(n).toLocaleString("en-PH", {
    style:"currency", currency:"PHP", maximumFractionDigits:2
  });
}

/* calculate */
calcBtn.addEventListener("click", () => {
  const price = parseFloat(priceEl.value);
  const term = parseInt(termEl.value);
  const interestType = interestTypeEl.value;

  let ratePct;
  if (customToggleEl.checked){
    ratePct = parseFloat(customInterestEl.value);
  } else {
    ratePct = suggested[term];
  }

  breakdownTbody.innerHTML = "";
  let monthlyPayment = 0, totalInterest = 0;
  const r = ratePct / 100;

  if (interestType === "simple"){
    totalInterest = price * r * term;
    monthlyPayment = (price + totalInterest) / term;

    const monthlyPrincipal = price / term;
    const monthlyInterest = totalInterest / term;

    for (let i=1;i<=term;i++){
      const endBal = +(price - monthlyPrincipal * i).toFixed(2);
      addRow(i, price - monthlyPrincipal*(i-1), monthlyInterest, monthlyPrincipal, endBal);
    }
  }

  summaryCard.classList.remove("hidden");
  principalVal.textContent = toPHP(price);
  totalInterestVal.textContent = toPHP(totalInterest);
  monthlyVal.textContent = toPHP(monthlyPayment);

  showToast("Calculation done");
});

/* Clear all */
clearBtn.addEventListener("click", () => {
  priceEl.value = "";
  customToggleEl.checked = false;
  customInterestEl.value = "";
  customInterestEl.disabled = true;

  breakdownTbody.innerHTML = "";
  summaryCard.classList.add("hidden");
  principalVal.textContent = "—";
  totalInterestVal.textContent = "—";
  monthlyVal.textContent = "—";

  showToast("Cleared");
});

function addRow(i, beg, int, prin, end){
  breakdownTbody.insertAdjacentHTML("beforeend", `
    <tr>
      <td>${i}</td>
      <td>${toPHP(beg)}</td>
      <td>${toPHP(int)}</td>
      <td>${toPHP(prin)}</td>
      <td>${toPHP(end)}</td>
    </tr>
  `);
}