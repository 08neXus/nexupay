// Updated monthly add-on interest rates
const rates = {
  3: 1.25,
  6: 1.85,
  9: 2.35,
  12: 2.85,
  24: 3.25
};

function toCurrency(num){
  return Number(num).toLocaleString('en-PH',
    { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });
}

function calculateAddOn(principal, rate, months){
  const r = rate / 100;
  const totalInterest = principal * r * months;
  const totalPayable = principal + totalInterest;
  return { 
    monthly: totalPayable / months, 
    totalInterest, 
    totalPayable 
  };
}

function calculateAmortized(principal, rate, months){
  const r = rate / 100;
  if(r === 0){
    return { monthly: principal/months, totalInterest: 0, totalPayable: principal };
  }
  const m = (r * principal) / (1 - Math.pow(1 + r, -months));
  const total = m * months;
  return { monthly: m, totalInterest: total - principal, totalPayable: total };
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
  const result = 
      method === "addon"
      ? calculateAddOn(principal, rate, term)
      : calculateAmortized(principal, rate, term);

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("monthly").innerText = toCurrency(result.monthly);
  document.getElementById("interest").innerText = toCurrency(result.totalInterest);
  document.getElementById("total").innerText = toCurrency(result.totalPayable);
});