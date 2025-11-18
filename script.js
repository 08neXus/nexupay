// Monthly add-on rates (editable)
const rates = {
  3: 1.75,
  6: 2.25,
  9: 2.75,
  12: 3.25,
  24: 4.00
};

function toCurrency(num){
  return Number(num).toLocaleString('en-PH',
    { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });
}

function calculateAddOn(principal, rate, months){
  const r = rate / 100;
  const totalInterest = principal * r * months;
  const totalPayable = principal + totalInterest;
  const monthly = totalPayable / months;
  return { totalInterest, totalPayable, monthly };
}

function calculateAmortized(principal, rate, months){
  const r = rate / 100;
  if(r === 0){
    return { totalInterest: 0, totalPayable: principal, monthly: principal/months };
  }
  const m = (r * principal) / (1 - Math.pow(1 + r, -months));
  const total = m * months;
  return { totalInterest: total - principal, totalPayable: total, monthly: m };
}

document.getElementById("calc").addEventListener("click", ()=>{

  const price = parseFloat(document.getElementById("price").value);
  const term = parseInt(document.getElementById("term").value);
  const method = document.getElementById("method").value;
  const down = parseFloat(document.getElementById("down").value) || 0;

  if(!price || price <= 0){
    alert("Please enter a valid price.");
    return;
  }
  if(down < 0 || down >= price){
    alert("Down payment must be between 0 and the item price.");
    return;
  }

  const principal = price - down;
  const rate = rates[term] || 0;

  const res = method === "addon"
    ? calculateAddOn(principal, rate, term)
    : calculateAmortized(principal, rate, term);

  // Display results
  document.getElementById("financed").textContent = toCurrency(principal);
  document.getElementById("totalInterest").textContent = toCurrency(res.totalInterest);
  document.getElementById("totalPayable").textContent = toCurrency(res.totalPayable);
  document.getElementById("monthly").textContent = toCurrency(res.monthly);
  document.getElementById("usedRate").textContent = rate + " % / month";
});

// Reset
document.getElementById("reset").addEventListener("click", ()=>{
  document.getElementById("price").value = "";
  document.getElementById("term").value = 3;
  document.getElementById("method").value = "addon";
  document.getElementById("down").value = 0;
  document.getElementById("financed").textContent = "—";
  document.getElementById("totalInterest").textContent = "—";
  document.getElementById("totalPayable").textContent = "—";
  document.getElementById("monthly").textContent = "—";
  document.getElementById("usedRate").textContent = "—";
});
