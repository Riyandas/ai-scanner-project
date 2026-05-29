document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusText = document.getElementById('statusText');

    // Load the current state from storage (default is true/ON)
    chrome.storage.local.get(['scannerEnabled'], function(result) {
        let isEnabled = result.scannerEnabled !== false; // If undefined, default to true
        toggleSwitch.checked = isEnabled;
        updateUI(isEnabled);
    });

    // Listen for toggle clicks
    toggleSwitch.addEventListener('change', function() {
        let isEnabled = toggleSwitch.checked;
        
        // Save the new state to storage
        chrome.storage.local.set({ scannerEnabled: isEnabled }, function() {
            updateUI(isEnabled);
        });
    });

    function updateUI(isEnabled) {
        if (isEnabled) {
            statusText.innerText = "Scanner is ON";
            statusText.style.color = "#4CAF50"; // Green
        } else {
            statusText.innerText = "Scanner is OFF";
            statusText.style.color = "#ff4c4c"; // Red
        }
    }
});