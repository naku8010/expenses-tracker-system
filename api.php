<?php
// Define the path to the data file
$dataFile = 'expenses_data.json';

// --- Handle POST request (Save Data) ---
// This part executes if the JavaScript sends data via fetch()
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw JSON data from the request body
    $data = file_get_contents('php://input');
    
    // Attempt to write the data to the file
    // file_put_contents returns the number of bytes written, or false on failure
    if (file_put_contents($dataFile, $data) !== false) {
        // Send back a success response
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'message' => 'Data saved.']);
    } else {
        // Send back an error response
        header('Content-Type: application/json', true, 500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save data. Check server permissions.']);
    }
    // Stop script execution after handling the API request
    exit;
} else {
    // If someone tries to access this file directly via GET
    header('Content-Type: application/json', true, 405); // 405 Method Not Allowed
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}
?>