// Monthly add-on interest rates
const rates = {
  3: 1.25,
  6: 1.85,
  9: 2.35,
  12: 2.85,
  24: 3.25
};

function toCurrency(num){
  return Number(num).toLocaleString('en-PH', { style:'currency', currency:'PHP', maximumFractionDigits:2 });
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
  const monthly = (r === 0) ? principal/months : (r * principal) / (1 - Math.pow(1 + r, -months));
  const totalPayable = monthly * months;
  const totalInterest = totalPayable - principal;
  return { monthly, totalInterest, totalPayable, rate };
}

function generateBreakdown(principal, totalInterest, months, method){
  const tbody = document.querySelector("#breakdown tbody");
  tbody.innerHTML = "";

  if(method === "addon"){
    const monthlyPrincipal = principal / months;
    const monthlyInterest = totalInterest / months;
    let remaining = principal;
    for(let i=1;i<=months;i++){
      remaining -= monthlyPrincipal;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i}</td>
        <td>${toCurrency(monthlyPrincipal)}</td>
        <td>${toCurrency(monthlyInterest)}</td>
        <td>${toCurrency(remaining)}</td>
        <td>${toCurrency(monthlyPrincipal + monthlyInterest)}</td>
      `;
      tbody.appendChild(row);
    }
  } else { // amortized
    let remaining = principal;
    const ratePerMonth = rates[months] / 100;
    for(let i=1;i<=months;i++){
      const monthlyInterest = remaining * (totalInterest / principal) / months; // approximate
      const monthlyPrincipal = (totalInterest + principal)/months - monthlyInterest;
      remaining -= monthlyPrincipal;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i}</td>
        <td>${toCurrency(monthlyPrincipal)}</td>
        <td>${toCurrency(monthlyInterest)}</td>
        <td>${toCurrency(remaining > 0 ? remaining : 0)}</td>
        <td>${toCurrency(monthlyPrincipal + monthlyInterest)}</td>
      `;
      tbody.appendChild(row);
    }
  }
}

document.getElementById("calc").addEventListener("click", ()=>{
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

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("financed").innerText = toCurrency(principal);
  document.getElementById("interest").innerText = toCurrency(result.totalInterest);
  document.getElementById("total").innerText = toCurrency(result.totalPayable);
  document.getElementById("monthly").innerText = toCurrency(result.monthly);
  document.getElementById("usedRate").innerText = result.rate + " % / month";

  generateBreakdown(principal, result.totalInterest, term, method);
});