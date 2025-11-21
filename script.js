document.addEventListener("DOMContentLoaded", function(){

  /* Add-On Rates */
  const suggested = { 3:1.5, 6:2, 9:2.5, 12:3, 24:4 };

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

  /* Matrix modal */
  const matrixBtn = document.getElementById("matrixBtn");
  const matrixModal = document.getElementById("matrixModal");
  const closeMatrix = document.getElementById("closeMatrix");

  /* Auto-set rate */
  function updateAutoRate() {
    if(!customToggleEl.checked){
      const t = parseInt(termEl.value);
      customInterestEl.value = suggested[t].toFixed(2);
    }
  }
  updateAutoRate();
  termEl.addEventListener("change", updateAutoRate);

  customToggleEl.addEventListener("change",()=>{
    customInterestEl.disabled = !customToggleEl.checked;
    if(!customToggleEl.checked) updateAutoRate();
  });

  /* Toast */
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(()=>toast.classList.remove("show"),2400);
  }

  /* Currency */
  function toPHP(n){return Number(n).toLocaleString('en-PH',{style:'currency',currency:'PHP'});}

  /* Row */
  function row(i,beg,int,prin,end){
    return `<tr>
      <td>${i}</td>
      <td>${toPHP(beg)}</td>
      <td>${toPHP(int)}</td>
      <td>${toPHP(prin)}</td>
      <td>${toPHP(end)}</td>
    </tr>`;
  }

  /* Calculate */
  calcBtn.addEventListener("click",()=>{
    const price = parseFloat(priceEl.value);
    const term = parseInt(termEl.value);
    const interestType = interestTypeEl.value;
    if(!price || price<=0){alert("Enter valid price");return;}

    let rate = customToggleEl.checked ? parseFloat(customInterestEl.value) : suggested[term];
    if(!rate || rate<=0){alert("Invalid rate");return;}
    rate/=100;

    breakdownTbody.innerHTML = "";
    summaryCard.classList.remove("hidden");

    let monthlyPayment=0,totalInterest=0,remaining=price;

    if(interestType==="simple"){
      totalInterest = price*rate*term;
      const totalPay = price+totalInterest;
      monthlyPayment = totalPay/term;
      const monthlyPrincipal = price/term;
      const monthlyInterest = totalInterest/term;

      for(let i=1;i<=term;i++){
        const begBal = price - monthlyPrincipal*(i-1);
        const endBal = price - monthlyPrincipal*i;
        breakdownTbody.insertAdjacentHTML("beforeend",row(i,begBal,monthlyInterest,monthlyPrincipal,endBal));
      }

    } else if(interestType==="amortized"){
      monthlyPayment = rate===0 ? price/term : (price*rate)/(1-Math.pow(1+rate,-term));
      remaining=price;
      totalInterest=0;
      for(let i=1;i<=term;i++){
        const interest = remaining*rate;
        const principal = monthlyPayment - interest;
        const endBal = remaining-principal;
        breakdownTbody.insertAdjacentHTML("beforeend",row(i,remaining,interest,principal,endBal>0?endBal:0));
        totalInterest+=interest; remaining=endBal;
      }
    } else if(interestType==="fixed"){
      const interestAmt = price*rate;
      const monthlyPrincipal = price/term;
      monthlyPayment = monthlyPrincipal+interestAmt;
      totalInterest = interestAmt*term;
      remaining=price;
      for(let i=1;i<=term;i++){
        remaining -= monthlyPrincipal;
        breakdownTbody.insertAdjacentHTML("beforeend",row(i,remaining+monthlyPrincipal,interestAmt,monthlyPrincipal,remaining));
      }
    } else if(interestType==="compound"){
      let bal = price;
      monthlyPayment = price/term;
      totalInterest=0;
      for(let i=1;i<=term;i++){
        const interest = bal*rate;
        const principal = monthlyPayment;
        const endBal = bal+interest-principal;
        breakdownTbody.insertAdjacentHTML("beforeend",row(i,bal,interest,principal,endBal>0?endBal:0));
        totalInterest+=interest; bal=endBal;
      }
    }

    principalVal.textContent=toPHP(price);
    totalInterestVal.textContent=toPHP(totalInterest);
    monthlyVal.textContent=toPHP(monthlyPayment);
    showToast("Calculation done");
  });

  /* Clear */
  clearBtn.addEventListener("click",()=>{
    priceEl.value="";
    breakdownTbody.innerHTML="";
    summaryCard.classList.add("hidden");
    principalVal.textContent="—";
    totalInterestVal.textContent="—";
    monthlyVal.textContent="—";
    showToast("Cleared");
  });

  /* MATRIX MODAL */
  matrixBtn.addEventListener("click",()=>{matrixModal.style.display="flex"});
  closeMatrix.addEventListener("click",()=>{matrixModal.style.display="none"});
  matrixModal.addEventListener("click",(e)=>{if(e.target===matrixModal) matrixModal.style.display="none"});
});