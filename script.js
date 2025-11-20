// Suggested monthly interest rates based on payment term
const suggestedRates = {
    3: 1.5,
    6: 1.7,
    9: 1.8,
    12: 2.0
};

// Enable/Disable custom interest input
document.getElementById("customToggle").addEventListener("change", function () {
    const customInput = document.getElementById("customInterest");
    customInput.disabled = !this.checked;
});

// Main calculate button
document.querySelector(".calc").addEventListener("click", function () {
    const price = parseFloat(document.getElementById("price").value);
    const term = parseInt(document.getElementById("term").value);
    const interestType = document.getElementById("interestType").value;

    // Determine interest rate
    let interestRate;

    if (document.getElementById("customToggle").checked) {
        interestRate = parseFloat(document.getElementById("customInterest").value);
        if (isNaN(interestRate) || interestRate <= 0) {
            alert("Enter a valid custom interest.");
            return;
        }
    } else {
        interestRate = suggestedRates[term]; // system default rate
    }

    if (!price || price <= 0) {
        alert("Enter a valid item price.");
        return;
    }

    generateTable(price, term, interestRate, interestType);
});

// Clear button
document.querySelector(".clear").addEventListener("click", function () {
    document.getElementById("price").value = "";
    document.getElementById("customInterest").value = "";
    document.getElementById("resultTable").querySelector("tbody").innerHTML = "";
});


// Generate amortization table depending on interest type
function generateTable(price, term, interestRate, interestType) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    let monthlyPrincipal = price / term;
    let monthlyRate = interestRate / 100;

    if (interestType === "amortized") {
        let r = monthlyRate;
        let n = term;

        let monthlyPayment = (price * r) / (1 - Math.pow(1 + r, -n));

        for (let i = 1; i <= term; i++) {
            let interest = price * r;
            let principal = monthlyPayment - interest;

            price -= principal;

            tbody.innerHTML += row(i, principal, interest, monthlyPayment);
        }
    }

    else if (interestType === "simple") {
        let totalInterest = price * monthlyRate * term;
        let interestPerMonth = totalInterest / term;

        for (let i = 1; i <= term; i++) {
            tbody.innerHTML += row(i, monthlyPrincipal, interestPerMonth, monthlyPrincipal + interestPerMonth);
        }
    }

    else if (interestType === "fixed") {
        let fixedInterest = price * monthlyRate;

        for (let i = 1; i <= term; i++) {
            tbody.innerHTML += row(i, monthlyPrincipal, fixedInterest, monthlyPrincipal + fixedInterest);
        }
    }

    else if (interestType === "compound") {
        let remaining = price;

        for (let i = 1; i <= term; i++) {
            let interest = remaining * monthlyRate;
            let totalPayment = monthlyPrincipal + interest;

            remaining = remaining + interest - monthlyPrincipal;

            tbody.innerHTML += row(i, monthlyPrincipal, interest, totalPayment);
        }
    }
}


// Helper to format each table row
function row(i, principal, interest, total) {
    return `
        <tr>
            <td>${i}</td>
            <td>₱${principal.toFixed(2)}</td>
            <td>₱${interest.toFixed(2)}</td>
            <td>₱${total.toFixed(2)}</td>
        </tr>
    `;
}