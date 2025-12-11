document.addEventListener('DOMContentLoaded', () => {
    // --- 1. STATE & DOM ELEMENTS ---
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalExpensesEl = document.getElementById('total-expenses');
    const emptyState = document.getElementById('empty-state');
    const chartCanvas = document.getElementById('category-chart');
    const dateInput = document.getElementById('date');

    // --- Load initial data from the global variable set by index.php ---
    // 'initialExpenses' is defined in a <script> tag in index.php
    let expenses = initialExpenses; 
    
    let categoryChart; // This will hold the Chart.js instance

    // --- 2. SERVER SYNC FUNCTION ---

    // Save the entire expenses array to the server via PHP
    async function saveExpensesOnServer() {
        try {
            // Post to the dedicated api.php file
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenses) // Send the complete current state
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving data:', errorData.message);
                // You could display a user-facing error message here
            }
        } catch (error) {
            console.error('Network error while saving data:', error);
            // You could display a user-facing error message here
        }
    }

    // --- 3. CORE LOGIC FUNCTIONS ---
    // These functions remain unchanged

    // Render all expenses to the list
    function renderExpenses() {
        expenseList.innerHTML = ''; 
        
        if (expenses.length === 0) {
            expenseList.appendChild(emptyState);
            return;
        }

        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedExpenses.forEach(expense => {
            const item = document.createElement('div');
            item.className = 'flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 rounded-lg';
            
            item.innerHTML = `
                <div class="flex-1">
                    <div class="font-semibold text-gray-800">${expense.description}</div>
                    <div class="text-sm text-gray-500">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">${expense.category}</span>
                        <span class="ml-2">${new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flex items-center">
                    <span class="font-bold text-gray-700 text-lg mr-4">$${expense.amount.toFixed(2)}</span>
                    <button class="delete-btn text-red-500 hover:text-red-700 transition duration-200" data-id="${expense.id}" aria-label="Delete expense">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
            expenseList.appendChild(item);
        });
    }

    // Update the total expenses display
    function updateSummary() {
        const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        totalExpensesEl.textContent = `$${total.toFixed(2)}`;
    }

    // Update the category chart
    function updateChart() {
        const categoryData = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        if (categoryChart) {
            categoryChart.destroy();
        }
        
        categoryChart = new Chart(chartCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spending',
                    data: data,
                    backgroundColor: [
                        '#3b82f6', '#ef4444', '#22c55e', 
                        '#eab308', '#a855f7', '#ec4899'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, boxWidth: 12, font: { size: 14 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // --- 4. EVENT HANDLERS (Now async) ---

    // Handle form submission to add a new expense
    async function handleAddExpense(e) {
        e.preventDefault();

        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!description || !amount || !category || !date) {
            console.warn("Please fill out all fields.");
            return; 
        }

        const newExpense = {
            id: Date.now().toString(),
            description,
            amount,
            category,
            date
        };

        // 1. Update local state
        expenses.push(newExpense);

        // 2. Update UI immediately (optimistic update)
        renderExpenses();
        updateSummary();
        updateChart();

        // 3. Reset form
        expenseForm.reset();
        setDateToToday();
        
        // 4. Asynchronously save the new state to the server
        await saveExpensesOnServer();
    }

    // Handle clicks on the expense list (for deleting)
    async function handleListClick(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            
            // 1. Update local state
            expenses = expenses.filter(expense => expense.id !== id);
            
            // 2. Update UI immediately
            renderExpenses();
            updateSummary();
            updateChart();

            // 3. Asynchronously save the new state to the server
            await saveExpensesOnServer();
        }
    }

    // Set the date input to today's date
    function setDateToToday() {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // --- 5. INITIALIZATION ---
    function initializeApp() {
        // Data is pre-loaded by index.php, so we just need to render
        renderExpenses();
        updateSummary();
        updateChart();
        setDateToToday();

        // Attach event listeners
        // We wrap the async handlers to catch any potential errors
        expenseForm.addEventListener('submit', (e) => {
            handleAddExpense(e).catch(err => console.error("Error adding expense:", err));
        });
        expenseList.addEventListener('click', (e) => {
            handleListClick(e).catch(err => console.error("Error deleting expense:", err));
        });
    }

    // Run the app
    initializeApp();
});