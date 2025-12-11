let currentDate = new Date();
let monthlyData = {};
let yearlyChart = null;

function getMonthKey() {
    return `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
}

function getYearlyData() {
    const year = currentDate.getFullYear();
    const monthlyStats = [];

    for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}`;
        const data = monthlyData[key];

        if (data) {
            const income = data.firstPaycheck + data.secondPaycheck;
            let expense = 0;
            data.expenseRows.forEach(row => {
                expense += (parseFloat(row.monday) || 0) +
                    (parseFloat(row.tuesday) || 0) +
                    (parseFloat(row.wednesday) || 0) +
                    (parseFloat(row.thursday) || 0) +
                    (parseFloat(row.friday) || 0);
            });
            const balance = income - expense;

            monthlyStats.push({ income, expense, balance });
        } else {
            monthlyStats.push({ income: 0, expense: 0, balance: 0 });
        }
    }

    return monthlyStats;
}

function updateYearlyChart() {
    const ctx = document.getElementById('yearlyChart');
    const yearlyData = getYearlyData();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const income = yearlyData.map(d => d.income);
    const expense = yearlyData.map(d => d.expense);
    const balance = yearlyData.map(d => d.balance);

    if (yearlyChart) {
        yearlyChart.destroy();
    }

    yearlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthNames,
            datasets: [
                {
                    label: 'Income',
                    data: income,
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 184, 148, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: expense,
                    borderColor: '#ff7675',
                    backgroundColor: 'rgba(255, 118, 117, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Balance',
                    data: balance,
                    borderColor: '#6c5ce7',
                    backgroundColor: 'rgba(108, 92, 231, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#e4e6eb',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#2a2f3a',
                    titleColor: '#e4e6eb',
                    bodyColor: '#e4e6eb',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b0b3b8',
                        callback: function (value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b0b3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('expenseTrackerData');
    if (saved) {
        monthlyData = JSON.parse(saved);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('expenseTrackerData', JSON.stringify(monthlyData));
}

function getMonthData() {
    const monthKey = getMonthKey();
    if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
            firstPaycheck: 0,
            secondPaycheck: 0,
            expenseRows: []
        };
    }
    return monthlyData[monthKey];
}

function updateMonthDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent =
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    updateMonthDisplay();
    loadMonthData();
    updateStats();
    renderAddonsTable();
    renderExpenseTable();
    updateYearlyChart();
}

function loadMonthData() {
    const data = getMonthData();
    document.getElementById('firstPaycheck').value = data.firstPaycheck || '';
    document.getElementById('secondPaycheck').value = data.secondPaycheck || '';
    renderAddonsTable();
}

function updateIncome() {
    const data = getMonthData();
    data.firstPaycheck = parseFloat(document.getElementById('firstPaycheck').value) || 0;
    data.secondPaycheck = parseFloat(document.getElementById('secondPaycheck').value) || 0;
    saveToLocalStorage();
    updateStats();
    updateYearlyChart();
}

function updateStats() {
    const data = getMonthData();
    const income = data.firstPaycheck + data.secondPaycheck;

    let expense = 0;
    data.expenseRows.forEach(row => {
        expense += (parseFloat(row.monday) || 0) +
            (parseFloat(row.tuesday) || 0) +
            (parseFloat(row.wednesday) || 0) +
            (parseFloat(row.thursday) || 0) +
            (parseFloat(row.friday) || 0);
    });

    const balance = income - expense;

    document.getElementById('totalIncome').textContent = income.toFixed(2);
    document.getElementById('totalExpense').textContent = expense.toFixed(2);
    document.getElementById('balance').textContent = balance.toFixed(2);
}

function addRow() {
    const data = getMonthData();
    data.expenseRows.unshift({
        type: '',
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0
    });
    saveToLocalStorage();
    renderExpenseTable();
}


function deleteRow(index) {
    const data = getMonthData();
    data.expenseRows.splice(index, 1);
    saveToLocalStorage();
    renderExpenseTable();
    updateStats();
    updateYearlyChart();
}

function calculateRowTotal(row) {
    return (parseFloat(row.monday) || 0) +
        (parseFloat(row.tuesday) || 0) +
        (parseFloat(row.wednesday) || 0) +
        (parseFloat(row.thursday) || 0) +
        (parseFloat(row.friday) || 0);
}

function updateRowValue(index, field, value) {
    const data = getMonthData();
    data.expenseRows[index][field] = value;
    saveToLocalStorage();
    renderExpenseTable();
    updateStats();
    updateYearlyChart();
}

function renderExpenseTable() {
    const data = getMonthData();
    const tbody = document.getElementById('expenseTableBody');

    if (data.expenseRows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    No expense rows yet. Click "Add Row" to start tracking!
                </td>
            </tr>
        `;
        return;
    }

    // Render the rows with drag-and-drop functionality
    tbody.innerHTML = data.expenseRows.map((row, index) => {
        const total = calculateRowTotal(row);
        return `
            <tr draggable="true" id="row-${index}" data-index="${index}" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)">
                <td>
                    <input type="text" 
                           value="${row.type}" 
                           onchange="updateRowValue(${index}, 'type', this.value)"
                           placeholder="e.g., Food, Transport"
                           style="width: 150px; text-align: left;">
                </td>
                <td>
                    <input type="number" 
                           value="${row.monday || ''}" 
                           onchange="updateRowValue(${index}, 'monday', this.value)"
                           placeholder="0"
                           step="0.01">
                </td>
                <td>
                    <input type="number" 
                           value="${row.tuesday || ''}" 
                           onchange="updateRowValue(${index}, 'tuesday', this.value)"
                           placeholder="0"
                           step="0.01">
                </td>
                <td>
                    <input type="number" 
                           value="${row.wednesday || ''}" 
                           onchange="updateRowValue(${index}, 'wednesday', this.value)"
                           placeholder="0"
                           step="0.01">
                </td>
                <td>
                    <input type="number" 
                           value="${row.thursday || ''}" 
                           onchange="updateRowValue(${index}, 'thursday', this.value)"
                           placeholder="0"
                           step="0.01">
                </td>
                <td>
                    <input type="number" 
                           value="${row.friday || ''}" 
                           onchange="updateRowValue(${index}, 'friday', this.value)"
                           placeholder="0"
                           step="0.01">
                </td>
                <td class="total-amount">$${total.toFixed(2)}</td>
                <td>
                    <button class="delete-row-btn" onclick="deleteRow(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function dragStart(event) {
    event.dataTransfer.setData("text", event.target.dataset.index);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();

    const draggedIndex = event.dataTransfer.getData("text");
    const droppedIndex = event.target.closest("tr").dataset.index;

    if (draggedIndex === droppedIndex) {
        return;
    }

    const data = getMonthData();
    const draggedRow = data.expenseRows.splice(draggedIndex, 1)[0];
    data.expenseRows.splice(droppedIndex, 0, draggedRow);

    saveToLocalStorage();
    renderExpenseTable();
    updateStats();
}


loadFromLocalStorage();
updateMonthDisplay();
loadMonthData();
updateStats();
renderExpenseTable();
updateYearlyChart();

function ensureAddonsStructure() {
    if (!monthlyData || typeof monthlyData !== 'object') monthlyData = {};
    Object.keys(monthlyData).forEach(key => {
        if (!monthlyData[key].addons) {
            monthlyData[key].addons = [];
        }
    });

    // Ensure current month entry exists with addons
    const currentKey = getMonthKey();
    if (!monthlyData[currentKey]) {
        monthlyData[currentKey] = {
            firstPaycheck: 0,
            secondPaycheck: 0,
            expenseRows: [],
            addons: []
        };
    } else if (!monthlyData[currentKey].addons) {
        monthlyData[currentKey].addons = [];
    }
}

function addAddon() {
    const data = getMonthData();
    if (!data.addons) data.addons = [];
    data.addons.unshift({
        description: '',
        amount: 0
    });
    saveToLocalStorage();
    renderAddonsTable();
    updateStats();
    updateYearlyChart();
}

function deleteAddon(index) {
    const data = getMonthData();
    if (!data.addons) return;
    data.addons.splice(index, 1);
    saveToLocalStorage();
    renderAddonsTable();
    updateStats();
    updateYearlyChart();
}

function updateAddonValue(index, field, value) {
    const data = getMonthData();
    if (!data.addons || !data.addons[index]) return;

    if (field === 'amount') {
        data.addons[index][field] = parseFloat(value) || 0;
    } else {
        data.addons[index][field] = value;
    }

    saveToLocalStorage();
    renderAddonsTable();
    updateStats();
    updateYearlyChart();
}

function renderAddonsTable() {
    const data = getMonthData();
    const tbody = document.getElementById('addonsTableBody');

    if (!tbody) return; // If HTML for addons is not present, do nothing

    if (!data.addons || data.addons.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    No add-ons yet. Click "Add Add-On" to add extra income!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.addons.map((row, index) => {
        return `
            <tr>
                <td>
                    <input type="text"
                        value="${row.description}"
                        placeholder="e.g., Savings, Gift"
                        onchange="updateAddonValue(${index}, 'description', this.value)"
                        style="width:150px; text-align:left;">
                </td>
                <td>
                    <input type="number"
                        value="${row.amount || ''}"
                        placeholder="0"
                        step="0.01"
                        onchange="updateAddonValue(${index}, 'amount', this.value)">
                </td>
                <td class="total-amount">₱${(parseFloat(row.amount) || 0).toFixed(2)}</td>
                <td>
                    <button class="delete-row-btn" onclick="deleteAddon(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/* ------------------------------------------------------------------
   SAFE EXTENSIONS: wrap the original getYearlyData and updateStats
   to include add-ons while keeping original implementations intact.
   We capture originals, then provide extended versions that call them.
   ------------------------------------------------------------------ */

(function extendForAddons() {
    // Keep originals by reference
    const originalGetYearlyData = getYearlyData;
    const originalUpdateStats = updateStats;

    // Extended getYearlyData: call original, then add add-ons into monthly incomes
    getYearlyData = function () {
        const yearly = originalGetYearlyData();

        const year = currentDate.getFullYear();
        for (let month = 0; month < 12; month++) {
            const key = `${year}-${month}`;
            const data = monthlyData[key];
            if (data && Array.isArray(data.addons) && data.addons.length > 0) {
                const addonSum = data.addons.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
                // Add to income and balance for that month
                if (typeof yearly[month].income === 'number') yearly[month].income += addonSum;
                if (typeof yearly[month].balance === 'number') yearly[month].balance += addonSum;
            }
        }

        return yearly;
    };

    // Extended updateStats: call original updateStats then patch totalIncome & balance to include add-ons
    updateStats = function () {
        // Call original which sets base totalIncome from paychecks and balance accordingly
        originalUpdateStats();

        const data = getMonthData();
        const addonTotal = data.addons ? data.addons.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0) : 0;

        // Update totalIncome display: base paychecks + addons
        const incomeElement = document.getElementById('totalIncome');
        if (incomeElement) {
            const baseIncome = (data.firstPaycheck || 0) + (data.secondPaycheck || 0);
            incomeElement.textContent = (baseIncome + addonTotal).toFixed(2);
        }

        // Recompute expense (original computed and updated expense element already)
        const expense = data.expenseRows.reduce((total, row) => {
            return total +
                (parseFloat(row.monday) || 0) +
                (parseFloat(row.tuesday) || 0) +
                (parseFloat(row.wednesday) || 0) +
                (parseFloat(row.thursday) || 0) +
                (parseFloat(row.friday) || 0);
        }, 0);

        // Update balance display
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            const baseIncome = (data.firstPaycheck || 0) + (data.secondPaycheck || 0);
            balanceElement.textContent = (baseIncome + addonTotal - expense).toFixed(2);
        }
    };
})();

/* Ensure addons exist after loading saved data, render addons if HTML present,
   and recalc stats/chart to reflect addons. */

ensureAddonsStructure();
renderAddonsTable();
updateStats();
updateYearlyChart();
