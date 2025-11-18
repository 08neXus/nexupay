// Monthly add-on interest rates (lower)
const rates = {
  3: 1.25,
  6: 1.85,
  9: 2.35,
  12: 2.85,
  24: 3.25
};

function toCurrency(num){
  return Number(num).toLocaleString('en-PH', { 
    style:'currency', currency:'PHP', maximumFractionDigits:2 
  });
}

function calculateAddOn(principal, rate, months){
  const r = rate / 100;
  const totalInterest = principal * r * months;
  const totalPayable = principal + totalInterest;
  const monthly = totalPayable / months;

  return { monthly, totalInterest, totalPayable, rate };
}

function calculateAmortized(principal, rate, months){
  const r = rate / 100;
  let monthly, totalPayable, totalInterest;

  if(r === 0){
    monthly = principal / months;
    totalInterest = 0;
    totalPayable = principal;
  } else {
    monthly = (r * principal) / (1 - Math.pow(1 + r, -months));
    totalPayable = monthly * months;
    totalInterest = totalPayable - principal;
  }

  return { monthly, totalInterest, totalPayable, rate };
}

document.getElementById("calc").addEventListener("click", () => {

  const price = parseFloat(document.getElementById("price").value);
  const down = parseFloat(document.getElementById("down").value) || 0;
  const term = parseInt(document.getElementById("term").value);
  const method = document.getElementById("method").value;

  if(!price || price <= 0){
    alert("Please enter a valid price.");
    return;
  }
  if(down < 0 || down >= price){
    alert("Down payment must be between 0 and the item price.");
    return;
  }

  const principal = price - down;
  const rate = rates[term];

  const result = method === "addon"
    ? calculateAddOn(principal, rate, term)
    : calculateAmortized(principal, rate, term);

  // RESULT DISPLAY
  const resultCard = document.getElementById("result");
  resultCard.classList.remove("hidden");
  setTimeout(() => resultCard.classList.add("show"), 10);

  document.getElementById("financed").innerText = toCurrency(principal);
  document.getElementById("interest").innerText = toCurrency(result.totalInterest);
  document.getElementById("total").innerText = toCurrency(result.totalPayable);
  document.getElementById("monthly").innerText = toCurrency(result.monthly);
  document.getElementById("usedRate").innerText = result.rate + "% per month";

  // BREAKDOWN TABLE
  const tbody = document.querySelector("#breakdown tbody");
  tbody.innerHTML = "";

  let balance = principal;

  for(let i = 1; i <= term; i++){
    const interest = method === "addon"
      ? (principal * (rate / 100))
      : (balance * (rate / 100));

    const principalPayment = result.monthly - interest;
    const endBalance = balance - principalPayment;

    let row = `
      <tr>
        <td>${i}</td>
        <td>${toCurrency(balance)}</td>
        <td>${toCurrency(interest)}</td>
        <td>${toCurrency(principalPayment)}</td>
        <td>${toCurrency(endBalance)}</td>
      </tr>
    `;
    tbody.innerHTML += row;

    balance = endBalance;
  }

  const table = document.getElementById("breakdown");
  table.classList.remove("hidden");
  setTimeout(() => table.classList.add("show"), 10);
});


// CLEAR BUTTON
document.getElementById("clear").addEventListener("click", () => {

  // Reset fields
  document.getElementById("price").value = "";
  document.getElementById("down").value = "";
  document.getElementById("term").value = "3";
  document.getElementById("method").value = "addon";

  // Hide sections
  const resultCard = document.getElementById("result");
  const table = document.getElementById("breakdown");
  resultCard.classList.remove("show");
  table.classList.remove("show");

  setTimeout(() => {
    resultCard.classList.add("hidden");
    table.classList.add("hidden");
    document.querySelector("#breakdown tbody").innerHTML = "";
  }, 250);

  // Toast
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
});