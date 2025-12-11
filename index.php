<?php
// Define the path to the data file
$dataFile = 'expenses_data.json';

// --- Handle GET request (Load Page) ---
// This part executes when the page is first loaded in the browser
$expenses_json = '[]'; // Default to an empty array
if (file_exists($dataFile)) {
    // If the file exists, read its content
    $expenses_json = file_get_contents($dataFile);
    // Ensure it's not empty, otherwise default back to '[]'
    if (empty($expenses_json)) {
        $expenses_json = '[]';
    }
}
// We will echo $expenses_json into the JavaScript variable in the <script> tag
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense Tracker (PHP)</title>
    
    <!-- 1. Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- 2. Load Chart.js for visualization -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- 3. Link to external CSS file -->
    <link rel="stylesheet" href="style.css">
    
    <!-- 4. Configure Tailwind to use the "Inter" font -->
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            },
          }
        }
      }
    </script>
</head>
<body class="bg-gray-100 antialiased">

    <div class="container mx-auto max-w-6xl p-4 md:p-8">
        
        <!-- Header -->
        <header class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-blue-600 text-center">
                My Expense Tracker (PHP)
            </h1>
        </header>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

            <!-- Left Column: Summary & Form -->
            <div class="md:col-span-1 flex flex-col gap-6">
                
                <!-- Summary Card -->
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Total Expenses</h2>
                    <div class="text-4xl font-bold text-blue-600" id="total-expenses">
                        $0.00
                    </div>
                </div>

                <!-- Add Expense Form Card -->
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Add New Expense</h2>
                    <form id="expense-form" class="space-y-4">
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-600">Description</label>
                            <input type="text" id="description" name="description" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Coffee" required>
                        </div>
                        
                        <div>
                            <label for="amount" class="block text-sm font-medium text-gray-600">Amount</label>
                            <input type="number" id="amount" name="amount" min="0.01" step="0.01" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 4.50" required>
                        </div>
                        
                        <div>
                            <label for="category" class="block text-sm font-medium text-gray-600">Category</label>
                            <select id="category" name="category" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label for="date" class="block text-sm font-medium text-gray-600">Date</label>
                            <input type="date" id="date" name="date" class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
                        </div>
                        
                        <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-md">
                            Add Expense
                        </button>
                    </form>
                </div>

            </div>

            <!-- Right Column: Chart & List -->
            <div class="md:col-span-2 flex flex-col gap-6">

                <!-- Chart Card -->
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Spending by Category</h2>
                    <div class="relative h-64 md:h-80">
                         <canvas id="category-chart"></canvas>
                    </div>
                </div>

                <!-- Expense List Card -->
                <div class="bg-white p-6 rounded-lg shadow-lg">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Expense History</h2>
                    <div id="expense-list" class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        <!-- Expenses will be dynamically inserted here -->
                        <p id="empty-state" class="text-gray-500 text-center py-4">No expenses added yet.</p>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Pass initial data from PHP to JavaScript -->
    <script>
        const initialExpenses = <?php echo $expenses_json; ?>;
    </script>
    
    <!-- Link to external JavaScript file -->
    <script src="script.js"></script>

</body>
</html>