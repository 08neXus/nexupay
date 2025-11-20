// Suggested interest per term (monthly add-on/amortized base rate)
const autoInterestRates = {
    3: 0.0130,
    6: 0.0140,
    9: 0.0150,
    12: 0.0160,
    24: 0.0180
};

let currentRate = autoInterestRates[3];

function updateAutoRate() {
    const term = document.getElementById("term").value;

    if (!document.getElementById("customInterestToggle").checked) {
        currentRate = autoInterestRates[term];
        document.getElementById("customInterest").value = "";
    }
}

function toggleCustomInterest() {
    const manual = document.getElementById("customInterestToggle").checked;
    const customInput = document.getElementById("customInterest");

    if (manual) {
        customInput.disabled = false;
    } else {
        customInput.disabled = true;
        customInput.value = "";
        updateAutoRate();
    }
}

function calculate() {
    const priceInput = document.getElementById("price").value;
    const price = parseFloat(priceInput);
    const term = parseInt(document.getElementById("term").value);
    const interestType = document.getElementById("interestType").value;
    const customInterestEnabled = document.getElementById("customInterestToggle").checked;
    const customInterestValue = parseFloat(document.getElementById("customInterest").value);

    if (!price || price <= 0) {
        alert("Enter a valid price");
        return;
    }

    // get correct interest
    let rate;
    if (customInterestEnabled) {
        if (!customInterestValue || customInterestValue <= 0) {
            alert("Enter a valid custom interest rate");
            return;
        }
        rate = customInterestValue / 100;
    } else {
        rate = autoInterestRates[term];
    }

    currentRate = rate;

    const table = document.querySelector("#breakdown tbody");
    table.innerHTML = "";

    let monthlyPrincipal, monthlyInterest, monthlyTotal;
    let remainingBalance = price;

    if (interestType === "simple") {
        let totalInterest = price * rate * term;
        monthlyTotal = (price + totalInterest) / term;
        monthlyPrincipal = price / term;
        monthlyInterest = totalInterest / term;

        document.getElementById("resultInfo").innerText =
            `Interest applied: ${(rate * 100).toFixed(2)}% | Total Interest: ₱${totalInterest.toFixed(2)}`;

    } else {
        let monthlyRate = rate;
        monthlyTotal = (price * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));

        document.getElementById("resultInfo").innerText =
            `Amortized monthly rate: ${(rate * 100).toFixed(2)}%`;
    }

    for (let i = 1; i <= term; i++) {
        if (interestType === "simple") {
            table.innerHTML += `
                <tr>
                    <td>${i}</td>
                    <td>₱${monthlyPrincipal.toFixed(2)}</td>
                    <td>₱${monthlyInterest.toFixed(2)}</td>
                    <td>₱${monthlyTotal.toFixed(2)}</td>
                </tr>`;
        } else {
            let interestPortion = remainingBalance * rate;
            let principalPortion = monthlyTotal - interestPortion;
            remainingBalance -= principalPortion;

            table.innerHTML += `
                <tr>
                    <td>${i}</td>
                    <td>₱${principalPortion.toFixed(2)}</td>
                    <td>₱${interestPortion.toFixed(2)}</td>
                    <td>₱${monthlyTotal.toFixed(2)}</td>
                </tr>`;
        }
    }
}

function clearForm() {
    document.getElementById("price").value = "";
    document.getElementById("resultInfo").innerText = "";
    document.querySelector("#breakdown tbody").innerHTML = "";

    const toast = document.getElementById("toast");
    toast.style.bottom = "30px";
    setTimeout(() => toast.style.bottom = "-60px", 2000);
}