let isScannerEnabled = true; // Default state
let currentHoveredElement = null;
let scanTimeout = null;

// 1. Fetch initial state when the page loads
chrome.storage.local.get(['scannerEnabled'], function(result) {
    if (result.scannerEnabled !== undefined) {
        isScannerEnabled = result.scannerEnabled;
    }
});

// 2. Listen for real-time changes if the user clicks the toggle while on the page
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.scannerEnabled) {
        isScannerEnabled = changes.scannerEnabled.newValue;
        // If turned off, clear any active outlines immediately
        if (!isScannerEnabled && currentHoveredElement) {
            currentHoveredElement.style.outline = "";
            currentHoveredElement = null;
        }
    }
});

document.addEventListener("mouseover", function(event) {
    // 3. EXIT IMMEDIATELY IF EXTENSION IS OFF
    if (!isScannerEnabled) return; 

    let hoveredElement = event.target;
    currentHoveredElement = hoveredElement;

    // Clear any pending scan from a previous element
    if (scanTimeout) {
        clearTimeout(scanTimeout);
    }

    // ==========================================
    // IMAGE SCANNING LOGIC
    // ==========================================
    if (hoveredElement.tagName === "IMG") {
        let imgSrc = hoveredElement.src;
        
        if (hoveredElement.width > 150 && imgSrc.startsWith("http")) {
            hoveredElement.style.outline = "4px solid yellow"; 
            
            scanTimeout = setTimeout(function() {
                chrome.runtime.sendMessage({ action: "scanImage", src: imgSrc }, function(response) {
                    if (currentHoveredElement !== hoveredElement) {
                        hoveredElement.style.outline = ""; 
                        return;
                    }
                    if (!response || !response.success) {
                        hoveredElement.style.outline = "4px solid grey"; 
                        return;
                    }
                    
                    let score = response.ai_percentage;
                    if (score >= 70) hoveredElement.style.outline = "4px solid red"; 
                    else if (score <= 30) hoveredElement.style.outline = "4px solid green"; 
                    else hoveredElement.style.outline = "4px solid orange"; 
                });
            }, 400); 
        }
        return; 
    }

    // ==========================================
    // TEXT SCANNING LOGIC
    // ==========================================
    let textToScan = hoveredElement.innerText;
    if (textToScan && textToScan.trim().length > 150) {
        hoveredElement.style.outline = "2px solid yellow";

        scanTimeout = setTimeout(function() {
            chrome.runtime.sendMessage({ action: "scanText", text: textToScan }, function(response) {
                if (currentHoveredElement !== hoveredElement) {
                    hoveredElement.style.outline = ""; 
                    return;
                }
                if (!response || !response.success) {
                    hoveredElement.style.outline = "2px solid grey"; 
                    return;
                }

                let score = response.ai_percentage;
                if (score >= 70) hoveredElement.style.outline = "2px solid red"; 
                else if (score <= 30) hoveredElement.style.outline = "2px solid green"; 
                else hoveredElement.style.outline = "2px solid orange"; 
            });
        }, 400);
    }
});

document.addEventListener("mouseout", function(event) {
    if (currentHoveredElement === event.target) {
        currentHoveredElement = null; 
        if (scanTimeout) {
            clearTimeout(scanTimeout);
        }
    }
    event.target.style.outline = ""; 
});