const suggestedInterest = {
    3: 1.0,
    6: 1.3,
    9: 1.5,
    12: 1.7,
    24: 2.1
};

document.getElementById("useCustom").addEventListener("change", function() {
    const customInput = document.getElementById("customInterest");
    customInput.disabled = !this.checked;
});

function calculate() {
    let price = parseFloat(document.getElementById("price").value);
    let term = parseInt(document.getElementById("term").value);

    let interestType = document.getElementById("interestType").value;
    let useCustom = document.getElementById("useCustom").checked;

    let interestRate = useCustom
        ? parseFloat(document.getElementById("customInterest").value)
        : suggestedInterest[term];

    if (!price || interestRate === "" || term === "") {
        alert("Please fill in all required fields.");
        return;
    }

    let resultDiv = document.getElementById("result");
    let tableDiv = document.getElementById("tableContainer");

    let rows = "";
    let totalInterest = 0;
    let monthlyPayment = 0;

    // SIMPLE INTEREST (Monthly Add-On)
    if (interestType === "simple") {
        let interest = price * (interestRate / 100) * term;
        let totalAmount = price + interest;
        monthlyPayment = totalAmount / term;

        resultDiv.innerHTML = `
            <h2>Results</h2>
            Total Loan Payment: ₱${totalAmount.toFixed(2)}<br>
            Total Interest: ₱${interest.toFixed(2)}
        `;

        let remaining = totalAmount;

        for (let m = 1; m <= term; m++) {
            let monthlyInterest = (price * (interestRate / 100));
            let principal = monthlyPayment - monthlyInterest;
            remaining -= monthlyPayment;

            rows += `
                <tr>
                    <td>${m}</td>
                    <td>${monthlyPayment.toFixed(2)}</td>
                    <td>${monthlyInterest.toFixed(2)}</td>
                    <td>${principal.toFixed(2)}</td>
                    <td>${remaining <= 0 ? "0.00" : remaining.toFixed(2)}</td>
                </tr>
            `;
        }
    }

    // AMORTIZED
    else {
        let r = interestRate / 100;
        monthlyPayment = (price * r) / (1 - Math.pow(1 + r, -term));

        resultDiv.innerHTML = `
            <h2>Results</h2>
            Monthly Payment: ₱${monthlyPayment.toFixed(2)}
        `;

        let balance = price;

        for (let m = 1; m <= term; m++) {
            let interestPayment = balance * r;
            let principal = monthlyPayment - interestPayment;
            balance -= principal;

            rows += `
                <tr>
                    <td>${m}</td>
                    <td>${monthlyPayment.toFixed(2)}</td>
                    <td>${interestPayment.toFixed(2)}</td>
                    <td>${principal.toFixed(2)}</td>
                    <td>${balance <= 0 ? "0.00" : balance.toFixed(2)}</td>
                </tr>
            `;
        }
    }

    tableDiv.innerHTML = `
        <h2>Payment Breakdown</h2>
        <table>
            <tr>
                <th>Month</th>
                <th>Monthly Payment</th>
                <th>Interest</th>
                <th>Principal</th>
                <th>Balance</th>
            </tr>
            ${rows}
        </table>
    `;
}

function resetForm() {
    document.getElementById("price").value = "";
    document.getElementById("customInterest").value = "";
    document.getElementById("useCustom").checked = false;
    document.getElementById("customInterest").disabled = true;
    document.getElementById("result").innerHTML = "";
    document.getElementById("tableContainer").innerHTML = "";
}