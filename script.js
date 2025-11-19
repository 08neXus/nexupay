function autoInterest() {
  const term = parseInt(document.getElementById("term").value);
  const interestField = document.getElementById("interest");

  const rates = {
    3: 1.4,
    6: 1.5,
    9: 1.6,
    12: 1.7,
    24: 2.0
  };

  interestField.value = rates[term];
}

autoInterest();


function calculate() {
  let price = parseFloat(document.getElementById("price").value);
  let down = parseFloat(document.getElementById("downpayment").value) || 0;
  let term = parseInt(document.getElementById("term").value);
  let interestType = document.getElementById("interestType").value;
  let interestRate = parseFloat(document.getElementById("interest").value) / 100;

  if (!price) {
    showSnackbar("Enter item price");
    return;
  }

  let balance = price - down;
  let tbody = document.querySelector("#breakdownTable tbody");
  tbody.innerHTML = "";

  let monthlyPayment = 0;
  let totalInterest = 0;

  // ADD-ON INTEREST
  if (interestType === "addon") {
    monthlyPayment = (balance * (1 + interestRate * term)) / term;

  // AMORTIZED INTEREST
  } else {
    monthlyPayment = (balance * interestRate) /
      (1 - Math.pow(1 + interestRate, -term));
  }

  let begin = balance;

  for (let i = 1; i <= term; i++) {
    let interest = begin * interestRate;
    let principal = monthlyPayment - interest;
    let end = begin - principal;

    totalInterest += interest;

    tbody.innerHTML += `
      <tr>
        <td>${i}</td>
        <td>₱${begin.toFixed(2)}</td>
        <td>₱${interest.toFixed(2)}</td>
        <td>₱${principal.toFixed(2)}</td>
        <td>₱${end.toFixed(2)}</td>
      </tr>
    `;

    begin = end;
  }

  document.getElementById("interestInfo").innerHTML =
    `Total interest applied: <b>₱${totalInterest.toFixed(2)}</b>`;
}



function clearAll() {
  document.getElementById("price").value = "";
  document.getElementById("downpayment").value = "";
  document.querySelector("#breakdownTable tbody").innerHTML = "";
  document.getElementById("interestInfo").innerHTML = "";
  autoInterest();
  showSnackbar("Cleared successfully!");
}



/* Snackbar */
function showSnackbar(message) {
  const bar = document.getElementById("snackbar");
  bar.innerText = message;
  bar.className = "show";

  setTimeout(() => {
    bar.className = bar.className.replace("show", "");
  }, 2800);
}