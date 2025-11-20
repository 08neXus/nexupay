/* Updated Add-On Interest Rates */
const suggested = {
  3: 1.5,
  6: 2.0,
  9: 2.5,
  12: 3.0,
  24: 4.0
};

/* Elements */
const priceEl = document.getElementById("price");
const termEl = document.getElementById("term");
const interestTypeEl = document.getElementById("interestType");
const customToggleEl = document.getElementById("customToggle");
const customInterestEl = document.getElementById("customInterest");
const calcBtn = document.getElementById("calcBtn");
const clearBtn = document.getElementById("clearBtn");
const breakdownTbody = document.querySelector("#breakdown tbody");

const summaryCard = document.getElementById("summaryCard");
const principalVal = document.getElementById("principalVal");
const totalInterestVal = document.getElementById("totalInterestVal");
const monthlyVal = document.getElementById("monthlyVal");

const toast = document.getElementById("toast");

/* Auto set default rate */
function updateAutoRate() {
  if (!customToggleEl.checked) {
    const t = parseInt(termEl.value);
    customInterestEl.value = suggested[t].toFixed(2);
  }
}
updateAutoRate();
termEl.addEventListener("change", updateAutoRate);

customToggleEl.addEventListener("change", () => {
  customInterestEl.disabled = !customToggleEl.checked;
  if (!customToggleEl.checked) updateAutoRate();
});

/* Helpers */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function toPHP(amount) {
  return Number(amount).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP"
  });
}

/* Calculation */
calcBtn.addEventListener("click", () => {
  const price = parseFloat(priceEl.value);
  const term = parseInt(termEl.value);
  const interestType = interestTypeEl.value;

  if (!price || price <= 0) {
    alert("Enter a valid item price");
    return;
  }

  let rate = customToggleEl.checked
    ? parseFloat(customInterestEl.value)
    : suggested[term];

  if (!rate || rate <= 0) {
    alert("Invalid interest rate");
    return;
  }

  rate = rate / 100;
  breakdownTbody.innerHTML = "";
  summaryCard.classList.remove("hidden");

  let monthlyPayment = 0;
  let totalInterest = 0;
  let remaining = price;

  if (interestType === "simple") {
    totalInterest = price * rate * term;
    const totalPayable = price + totalInterest;
    monthlyPayment = totalPayable / term;

    const monthlyPrincipal = price / term;
    const monthlyInterest = totalInterest / term;

    for (let i = 1; i <= term; i++) {
      const begBal = price - monthlyPrincipal * (i - 1);
      const endBal = price - monthlyPrincipal * i;

      breakdownTbody.insertAdjacentHTML(
        "beforeend",
        row(i, begBal, monthlyInterest, monthlyPrincipal, endBal)
      );
    }

  } else if (interestType === "amortized") {
    if (rate === 0) {
      monthlyPayment = price / term;
    } else {
      monthlyPayment = (price * rate) / (1 - Math.pow(1 + rate, -term));
    }

    remaining = price;
    totalInterest = 0;

    for (let i = 1; i <= term; i++) {
      const interest = remaining * rate;
      const principal = monthlyPayment - interest;
      const endBal = remaining - principal;

      breakdownTbody.insertAdjacentHTML(
        "beforeend",
        row(i, remaining, interest, principal, endBal > 0 ? endBal : 0)
      );

      totalInterest += interest;
      remaining = endBal;
    }

  } else if (interestType === "fixed") {
    const interestAmt = price * rate;
    const monthlyPrincipal = price / term;
    monthlyPayment = monthlyPrincipal + interestAmt;
    totalInterest = interestAmt * term;

    remaining = price;

    for (let i = 1; i <= term; i++) {
      remaining -= monthlyPrincipal;

      breakdownTbody.insertAdjacentHTML(
        "beforeend",
        row(i, remaining + monthlyPrincipal, interestAmt, monthlyPrincipal, remaining)
      );
    }

  } else if (interestType === "compound") {
    let bal = price;
    monthlyPayment = price / term;

    totalInterest = 0;

    for (let i = 1; i <= term; i++) {
      const interest = bal * rate;
      const principal = monthlyPayment;
      const endBal = bal + interest - principal;

      breakdownTbody.insertAdjacentHTML(
        "beforeend",
        row(i, bal, interest, principal, endBal)
      );

      totalInterest += interest;
      bal = endBal;
    }
  }

  principalVal.textContent = toPHP(price);
  totalInterestVal.textContent = toPHP(totalInterest);
  monthlyVal.textContent = toPHP(monthlyPayment);

  showToast("Calculation done");
});

/* Clear */
clearBtn.addEventListener("click", () => {
  priceEl.value = "";
  breakdownTbody.innerHTML = "";
  summaryCard.classList.add("hidden");
  principalVal.textContent = "—";
  totalInterestVal.textContent = "—";
  monthlyVal.textContent = "—";
  showToast("Cleared");
});

/* Table row */
function row(i, beg, int, prin, end) {
  return `
    <tr>
      <td>${i}</td>
      <td>${toPHP(beg)}</td>
      <td>${toPHP(int)}</td>
      <td>${toPHP(prin)}</td>
      <td>${toPHP(end)}</td>
    </tr>`;
}

/* --- MATRIX MODAL --- */
const matrixBtn = document.getElementById("matrixBtn");
const matrixModal = document.getElementById("matrixModal");
const closeMatrix = document.getElementById("closeMatrix");

matrixBtn.addEventListener("click", () => {
  matrixModal.style.display = "flex";
});

closeMatrix.addEventListener("click", () => {
  matrixModal.style.display = "none";
});

matrixModal.addEventListener("click", (e) => {
  if (e.target === matrixModal) matrixModal.style.display = "none";
});