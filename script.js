document.getElementById("useCustomInterest").addEventListener("change", function () {
    document.getElementById("customInterestRate").disabled = !this.checked;
});

document.getElementById("matrixBtn").onclick = () => {
    document.getElementById("matrixPopup").style.display = "flex";
};

document.getElementById("closeMatrix").onclick = () => {
    document.getElementById("matrixPopup").style.display = "none";
};

document.getElementById("calculateBtn").addEventListener("click", calculate);
document.getElementById("clearBtn").addEventListener("click", () => location.reload());

function calculate() {
    let loan = parseFloat(document.getElementById("loanAmount").value);
    let down = parseFloat(document.getElementById("downPayment").value) || 0;
    let net = loan - down;

    let term = parseInt(document.getElementById("paymentTerm").value);
    let useCustom = document.getElementById("useCustomInterest").checked;
    let customRate = parseFloat(document.getElementById("customInterestRate").value);

    let addOnRates = {
        3: 0.015,
        6: 0.02,
        9: 0.025,
        12: 0.03,
        24: 0.04
    };

    let rate = useCustom ? customRate / 100 : addOnRates[term];

    let totalInterest = net * rate * term;
    let total = net + totalInterest;
    let monthly = total / term;

    document.getElementById("summaryBox").innerHTML = `
        <div class='summary'>
            <strong>Loan Amount:</strong> ₱${loan.toLocaleString()}<br>
            <strong>Down Payment:</strong> ₱${down.toLocaleString()}<br>
            <strong>Net Amount:</strong> ₱${net.toLocaleString()}<br>
            <strong>Interest Rate:</strong> ${(rate * 100).toFixed(2)}%<br>
            <strong>Total Interest:</strong> ₱${totalInterest.toLocaleString()}<br>
            <strong>Monthly Payment:</strong> ₱${monthly.toLocaleString()}
        </div>
    `;

    let tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    let balance = net;

    for (let m = 1; m <= term; m++) {
        let interest = net * rate;
        let principal = monthly - interest;
        balance -= principal;

        tbody.innerHTML += `
            <tr>
                <td>${m}</td>
                <td>₱${(balance + principal).toLocaleString()}</td>
                <td>₱${interest.toLocaleString()}</td>
                <td>₱${principal.toLocaleString()}</td>
                <td>₱${balance.toLocaleString()}</td>
            </tr>
        `;
    }
}