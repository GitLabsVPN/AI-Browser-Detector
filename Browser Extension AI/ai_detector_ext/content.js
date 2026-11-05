// content.js

/**
 * Extracts all readable text content from the current webpage.
 * @returns {string} The concatenated text.
 */
function extractTextFromPage() {
    // Simple text extraction by iterating over all elements
    const bodyText = document.body.innerText || document.body.textContent;
    return bodyText.trim();
}

/**
 * Calls the local Python API endpoint to analyze the extracted text.
 * @param {string} text - The text content.
 */
async function analyzeContent(text) {
    const API_URL = 'http://localhost:5000/analyze'; // Must match your API address
    console.log("Sending text to Python API for analysis...");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Error calling AI detector API:", error);
        return { score: null, confidence: "API Error: Could not connect to the analysis service.", details: error.message };
    }
}

/**
 * Main function to run when the page loads.
 */
async function runAnalysis() {
    const text = extractTextFromPage();
    
    if (!text) {
        alert("Could not find enough text on this page to analyze.");
        return;
    }

    const analysisResult = await analyzeContent(text);
    
    // Display the result visibly on the page
    displayResult(analysisResult);
}

/**
 * Injects the analysis result into the page's DOM.
 * @param {object} result - The JSON result from the API.
 */
function displayResult(result) {
    const container = document.createElement('div');
    container.id = 'ai-detector-result';
    container.style.cssText = `
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        background-color: #222; 
        color: white; 
        padding: 15px; 
        border-radius: 8px; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 9999; /* Ensure it sits on top of most content */
        max-width: 350px;
    `;

    let scoreColor;
    let scoreText;

    if (result.score && result.score >= 0.7) {
        scoreColor = 'red';
        scoreText = 'High Likelihood of AI';
    } else if (result.score && result.score <= 0.3) {
        scoreColor = 'green';
        scoreText = 'Likely Human Written';
    } else {
        scoreColor = 'orange';
        scoreText = 'Ambiguous / Unknown';
    }
    
    container.innerHTML = `
        <h3 style="margin-top: 0;">🤖 AI Content Detector</h3>
        <p><strong>Estimated AI Score:</strong> <span style="color:${scoreColor}; font-size: 1.5em;">${result.score * 100}%</span></p>
        <p><strong>Assessment:</strong> ${scoreText}</p>
        <small>(${result.confidence})</small>
        <hr style="border-color:#444; margin: 10px 0;">
        <small><em>${result.details}</em></small>
    `;

    // Append the result container to the body
    document.body.appendChild(container);
}

// Execute the main function when the script loads on the page
runAnalysis();
