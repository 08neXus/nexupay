const interestRates = {
    3: 0.0130,
    6: 0.0130,
    9: 0.0130,
    12: 0.0130,
    24: 0.0130
};

function calculate() {
    const price = parseFloat(document.getElementById("price").value);
    const term = parseInt(document.getElementById("term").value);
    const type = document.getElementById("interestType").value;

    if (!price || price <= 0) {
        alert("Enter a valid price");
        return;
    }

    const rate = interestRates[term];
    const table = document.querySelector("#breakdown tbody");
    table.innerHTML = "";

    let monthlyPrincipal, monthlyInterest, monthlyTotal;

    if (type === "simple") {
        let totalInterest = price * rate * term;
        let totalPayable = price + totalInterest;

        monthlyTotal = totalPayable / term;
        monthlyPrincipal = price / term;
        monthlyInterest = totalInterest / term;

        document.getElementById("resultInfo").innerText =
            `Monthly Interest: ${(rate * 100).toFixed(2)}% | Total Interest: ₱${totalInterest.toFixed(2)}`;

    } else {
        let monthlyRate = rate;
        monthlyTotal = (price * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));

        document.getElementById("resultInfo").innerText =
            `Amortized monthly rate: ${(rate * 100).toFixed(2)}%`;
    }

    for (let i = 1; i <= term; i++) {
        if (type === "simple") {
            let row = `
                <tr>
                    <td>${i}</td>
                    <td>₱${monthlyPrincipal.toFixed(2)}</td>
                    <td>₱${monthlyInterest.toFixed(2)}</td>
                    <td>₱${monthlyTotal.toFixed(2)}</td>
                </tr>`;
            table.innerHTML += row;
        } else {
            let interestPortion = price * rate;
            let principalPortion = monthlyTotal - interestPortion;
            price -= principalPortion;

            let row = `
                <tr>
                    <td>${i}</td>
                    <td>₱${principalPortion.toFixed(2)}</td>
                    <td>₱${interestPortion.toFixed(2)}</td>
                    <td>₱${monthlyTotal.toFixed(2)}</td>
                </tr>`;
            table.innerHTML += row;
        }
    }
}

function clearForm() {
    document.getElementById("price").value = "";
    document.getElementById("resultInfo").innerText = "";
    document.querySelector("#breakdown tbody").innerHTML = "";

    let toast = document.getElementById("toast");
    toast.style.bottom = "30px";
    setTimeout(() => { toast.style.bottom = "-60px"; }, 2000);
}