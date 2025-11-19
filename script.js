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

autoInterest(); // initialize on load


function calculate() {
  let price = parseFloat(document.getElementById("price").value);
  let down = parseFloat(document.getElementById("downpayment").value) || 0;
  let term = parseInt(document.getElementById("term").value);
  let interestRate = parseFloat(document.getElementById("interest").value) / 100;

  if (!price) {
    alert("Enter a valid item price.");
    return;
  }

  let balance = price - down;
  let monthlyPayment = (balance * (1 + interestRate * term)) / term;

  let tbody = document.querySelector("#breakdownTable tbody");
  tbody.innerHTML = "";

  let begin = balance;
  let totalInterest = 0;

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
  document.getElementById("interestInfo").innerHTML = "";
  document.querySelector("#breakdownTable tbody").innerHTML = "";
  autoInterest();
}