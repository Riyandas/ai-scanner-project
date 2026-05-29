chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    
    // --- HANDLE TEXT SCANNING ---
    if (request.action === "scanText") {
        fetch("http://127.0.0.1:5000/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: request.text })
        })
        .then(response => response.json())
        .then(data => sendResponse({ success: true, ai_percentage: data.ai_percentage }))
        .catch(error => sendResponse({ success: false }));
        return true; 
    }

    // --- HANDLE IMAGE SCANNING ---
    if (request.action === "scanImage") {
        fetch("http://127.0.0.1:5000/scan-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ src: request.src }) // Send the image URL
        })
        .then(response => response.json())
        .then(data => sendResponse({ success: true, ai_percentage: data.ai_percentage }))
        .catch(error => sendResponse({ success: false }));
        return true; 
    }
});