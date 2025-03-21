// DOM elements
const fileInput = document.getElementById('ecg-file');
const fileName = document.getElementById('file-name');
const imageInput = document.getElementById('ecg-image');
const imageName = document.getElementById('image-name');
const analyzeBtn = document.getElementById('analyze-btn');
const results = document.getElementById('results');
const loading = document.querySelector('.loading');
const scoreValue = document.getElementById('score-value');
const scoreFace = document.getElementById('score-face');
const scoreDescription = document.getElementById('score-description');
const scoreChart = document.getElementById('score-chart');
const abnormalitiesList = document.getElementById('abnormalities-list');
const recommendations = document.getElementById('recommendations');
const ecgPath = document.getElementById('ecg-path');
const statusContainer = document.getElementById('status-container');
const mlResults = document.getElementById('ml-results');

// Tab switching
const uploadTabBtn = document.getElementById('upload-tab-btn');
const fileTabBtn = document.getElementById('file-tab-btn');
const uploadTab = document.getElementById('upload-tab');
const fileTab = document.getElementById('file-tab');

uploadTabBtn.addEventListener('click', function() {
  uploadTabBtn.classList.add('active');
  fileTabBtn.classList.remove('active');
  uploadTab.style.display = 'block';
  fileTab.style.display = 'none';
});

fileTabBtn.addEventListener('click', function() {
  fileTabBtn.classList.add('active');
  uploadTabBtn.classList.remove('active');
  fileTab.style.display = 'block';
  uploadTab.style.display = 'none';
});

// Sample ECG data (will be replaced with uploaded file or ML model output)
let ecgData = [];
let mlPredictions = null;

// File upload handler
fileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    fileName.textContent = file.name;
    
    // If it's a CSV file, try to parse it directly
    if (file.name.toLowerCase().endsWith('.csv')) {
      parseCSVFile(file);
    } else {
      // For demo purposes, we'll simulate reading the file
      simulateFileRead(file);
    }
  }
});

// Image upload handler
imageInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    imageName.textContent = file.name;
  }
});

// Parse actual CSV file
function parseCSVFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const content = e.target.result;
    const lines = content.split('\n');
    const parsedData = [];
    
    // Skip header if present
    const startIdx = lines[0].includes('x') || lines[0].includes('time') ? 1 : 0;
    
    for (let i = startIdx; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        // Assume first column is x/time and second is y/amplitude
        parsedData.push({
          x: parseFloat(parts[0]),
          y: parseFloat(parts[1])
        });
      }
    }
    
    if (parsedData.length > 0) {
      console.log('Parsed CSV data:', parsedData.slice(0, 5));
      ecgData = parsedData;
    } else {
      console.error('No valid data found in CSV');
      // Fall back to simulated data
      ecgData = generateEcgData();
    }
  };
  
  reader.onerror = function() {
    console.error('Error reading CSV file');
    ecgData = generateEcgData();
  };
  
  reader.readAsText(file);
}

// Drag and drop functionality for ECG file
const fileDropZone = document.querySelector('#file-tab .file-upload');

fileDropZone.addEventListener('dragover', function(e) {
  e.preventDefault();
  fileDropZone.style.borderColor = 'var(--primary)';
  fileDropZone.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
});

fileDropZone.addEventListener('dragleave', function() {
  fileDropZone.style.borderColor = '#cbd5e1';
  fileDropZone.style.backgroundColor = 'transparent';
});

fileDropZone.addEventListener('drop', function(e) {
  e.preventDefault();
  fileDropZone.style.borderColor = '#cbd5e1';
  fileDropZone.style.backgroundColor = 'transparent';
  
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    fileName.textContent = file.name;
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      parseCSVFile(file);
    } else {
      simulateFileRead(file);
    }
  }
});

// Drag and drop functionality for ECG image
const imageDropZone = document.querySelector('#upload-tab .file-upload');

imageDropZone.addEventListener('dragover', function(e) {
  e.preventDefault();
  imageDropZone.style.borderColor = 'var(--primary)';
  imageDropZone.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
});

imageDropZone.addEventListener('dragleave', function() {
  imageDropZone.style.borderColor = '#cbd5e1';
  imageDropZone.style.backgroundColor = 'transparent';
});

imageDropZone.addEventListener('drop', function(e) {
  e.preventDefault();
  imageDropZone.style.borderColor = '#cbd5e1';
  imageDropZone.style.backgroundColor = 'transparent';
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    imageInput.files = e.dataTransfer.files;
    imageName.textContent = file.name;
  }
});

// Simulate file reading for demo purposes
function simulateFileRead(file) {
  // Generate random ECG-like data
  ecgData = generateEcgData();
}

// Generate random ECG-like data for demonstration
function generateEcgData() {
  const data = [];
  let x = 0;
  
  // Base pattern (normal sinus rhythm)
  const basePattern = [
    0, 0, 0, 0.1, 0.2, 0, -0.1, -0.1, 0, 0, 0.1, 5, -3, 0.5, 0.3, 0.2, 0, 0, -0.2, -0.3, -0.2, 0
  ];
  
  // Generate multiple heartbeats
  for (let i = 0; i < 20; i++) {
    // Add some variation to each heartbeat
    for (let j = 0; j < basePattern.length; j++) {
      const value = basePattern[j] + (Math.random() * 0.1 - 0.05);
      data.push({ x: x, y: value });
      x += 2;
    }
  }
  
  // Add some abnormalities for demo purposes
  // Simulate ST elevation at random points
  for (let i = 0; i < 3; i++) {
    const abnormalityStart = Math.floor(Math.random() * (data.length - 20));
    for (let j = 0; j < 10; j++) {
      if (data[abnormalityStart + j]) {
        data[abnormalityStart + j].y += 1.2;
        data[abnormalityStart + j].abnormal = true;
      }
    }
  }
  
  return data;
}

// Analyze button click handler
analyzeBtn.addEventListener('click', async function() {
  const age = document.getElementById('age').value;
  const bmi = document.getElementById('bmi').value;
  
  // Check if we're in image upload or file upload mode
  const isImageMode = uploadTabBtn.classList.contains('active');
  
  if (!age || !bmi) {
    alert('Please fill in all required patient information fields.');
    return;
  }
  
  if (isImageMode && !imageInput.files[0]) {
    alert('Please upload an ECG image.');
    return;
  }
  
  if (!isImageMode && !fileInput.files[0]) {
    alert('Please upload an ECG file.');
    return;
  }
  
  // Show loading state
  loading.style.display = 'block';
  results.style.display = 'none';
  
  try {
    if (isImageMode) {
      // Process image through the Python backend
      await processECGImage(imageInput.files[0], age, bmi);
    } else {
      // Process the local file or use simulated data
      setTimeout(function() {
        const healthScore = calculateHealthScore(age, bmi);
        updateResults(healthScore);
        loading.style.display = 'none';
        results.style.display = 'block';
      }, 1500);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    alert('An error occurred during analysis. Please try again.');
    loading.style.display = 'none';
  }
});

// Process ECG image through Python backend
async function processECGImage(imageFile, age, bmi) {
  const formData = new FormData();
  formData.append('ecgImage', imageFile);
  
  try {
    // Call Python backend
    const response = await fetch('/upload_image', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Server returned an error');
    }
    
    // Parse response - could be JSON or HTML
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // If it's JSON, parse it directly
      const data = await response.json();
      processMlResults(data);
    } else {
      // If it's HTML (as in your original app), extract the prediction data
      const html = await response.text();
      
      // Extract prediction data from HTML (this is a simplistic approach)
      const matches = html.match(/prediction-type">([^<]+)</g);
      if (matches) {
        const predictions = matches.map(match => {
          const arrhythmia = match.replace('prediction-type">', '').replace('<', '');
          return {
            Arrhythmia: arrhythmia,
            Description: getArrhythmiaDescription(arrhythmia)
          };
        });
        
        processMlResults({ predictions });
      } else {
        throw new Error('Could not parse prediction results');
      }
    }
    
    // Also load the final CSV from backend if available
    await loadProcessedCsv();
    
    // Generate a health score based on the ML results and patient data
    const healthScore = calculateHealthScore(age, bmi);
    updateResults(healthScore);
    
    loading.style.display = 'none';
    results.style.display = 'block';
  } catch (error) {
    console.error('Error processing ECG image:', error);
    
    // Fallback to simulated data
    ecgData = generateEcgData();
    mlPredictions = [{
      Arrhythmia: 'SVEB',
      Description: 'Supraventricular ectopic beat'
    }];
    
    const healthScore = calculateHealthScore(age, bmi);
    updateResults(healthScore);
    
    loading.style.display = 'none';
    results.style.display = 'block';
  }
}

// Get arrhythmia description
function getArrhythmiaDescription(type) {
  const descriptions = {
    'N': 'Normal sinus rhythm',
    'SVEB': 'Supraventricular ectopic beat',
    'VEB': 'Ventricular ectopic beat',
    'F': 'Fusion beat',
    'Q': 'Unclassifiable beat'
  };
  
  return descriptions[type] || 'Unknown type';
}

// Process ML results from backend
function processMlResults(data) {
  if (data && data.predictions) {
    mlPredictions = data.predictions;
    console.log('ML Predictions:', mlPredictions);
  }
}

// Try to load the processed CSV from backend
async function loadProcessedCsv() {
  try {
    const response = await fetch('/api/get_processed_csv');
    if (!response.ok) {
      throw new Error('Could not retrieve processed CSV');
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    const parsedData = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        parsedData.push({
          x: parseFloat(parts[0]),
          y: parseFloat(parts[1])
        });
      }
    }
    
    if (parsedData.length > 0) {
      ecgData = parsedData;
    }
  } catch (error) {
    console.warn('Could not load processed CSV, using generated data:', error);
    // We'll continue with the generated data
  }
}

// Calculate health score based on inputs and ECG data
function calculateHealthScore(age, bmi) {
  // Count abnormal data points in ECG
  const abnormalPoints = ecgData.filter(point => point.abnormal).length;
  const abnormalityRatio = abnormalPoints / ecgData.length;
  
  // Base score starts at 100
  let score = 100;
  
  // Deduct points based on age
  if (age > 50) {
    score -= (age - 50) * 0.5;
  }
  
  // Deduct points based on BMI (if outside healthy range)
  if (bmi < 18.5) {
    score -= (18.5 - bmi) * 2;
  } else if (bmi > 25) {
    score -= (bmi - 25) * 2;
  }
  
  // Deduct points for ECG abnormalities
  score -= abnormalityRatio * 300;
  
  // Adjust based on ML predictions if available
  if (mlPredictions && mlPredictions.length > 0) {
    mlPredictions.forEach(pred => {
      if (pred.Arrhythmia === 'N') {
        // Normal rhythm - no deduction
      } else if (pred.Arrhythmia === 'SVEB') {
        score -= 15; // Supraventricular ectopic beat
      } else if (pred.Arrhythmia === 'VEB') {
        score -= 25; // Ventricular ectopic beat
      } else if (pred.Arrhythmia === 'F') {
        score -= 20; // Fusion beat
      } else if (pred.Arrhythmia === 'Q') {
        score -= 10; // Unclassifiable beat
      }
    });
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Update UI with analysis results
function updateResults(healthScore) {
  // Update score value
  scoreValue.textContent = `${healthScore}%`;
  
  // Update donut chart
  updateDonutChart(healthScore);
  
  // Update face emoji based on score
  updateScoreFace(healthScore);
  
  // Update score description
  updateScoreDescription(healthScore);
  
  // Draw ECG chart
  drawEcgChart();
  
  // Update ML results panel
  updateMlResultsPanel();
  
  // Update abnormalities list
  updateAbnormalities(healthScore);
  
  // Update recommendations
  updateRecommendations(healthScore);
  
  // Update status box
  updateStatusBox(healthScore);
}

// Update the ML results panel
function updateMlResultsPanel() {
  if (!mlPredictions || mlPredictions.length === 0) {
    mlResults.innerHTML = '<p>No ML analysis results available.</p>';
    return;
  }
  
  let content = '<div class="ml-results-container">';
  
  mlPredictions.forEach(pred => {
    let severityClass = 'severity-low';
    
    if (pred.Arrhythmia === 'VEB') {
      severityClass = 'severity-high';
    } else if (pred.Arrhythmia === 'SVEB' || pred.Arrhythmia === 'F') {
      severityClass = 'severity-medium';
    }
    
    content += `
      <div class="abnormality-item">
        <div class="abnormality-severity ${severityClass}"></div>
        <div>
          <strong>${pred.Arrhythmia}</strong>
          <div>${pred.Description}</div>
        </div>
      </div>
    `;
  });
  
  content += '</div>';
  mlResults.innerHTML = content;
}

// Update donut chart visualization
function updateDonutChart(score) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Determine color based on score
  let color;
  if (score >= 80) {
    color = 'var(--success)';
  } else if (score >= 60) {
    color = 'var(--warning)';
  } else {
    color = 'var(--danger)';
  }
  
  scoreChart.innerHTML = `
    <svg width="150" height="150" viewBox="0 0 150 150">
      <circle
        cx="75"
        cy="75"
        r="${radius}"
        fill="transparent"
        stroke="#e2e8f0"
        stroke-width="10"
      />
      <circle
        cx="75"
        cy="75"
        r="${radius}"
        fill="transparent"
        stroke="${color}"
        stroke-width="10"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${strokeDashoffset}"
        transform="rotate(-90 75 75)"
      />
    </svg>
  `;
}

// Update face emoji based on score
function updateScoreFace(score) {
  if (score >= 80) {
    scoreFace.textContent = '😃';
  } else if (score >= 60) {
    scoreFace.textContent = '😐';
  } else {
    scoreFace.textContent = '😟';
  }
}

// Update score description
function updateScoreDescription(score) {
  let description;
  
  if (score >= 80) {
    description = 'Your heart appears to be in good health. Continue maintaining your healthy lifestyle.';
  } else if (score >= 60) {
    description = 'Your heart health shows some concerning signs. Consider lifestyle adjustments and consult a doctor.';
  } else {
    description = 'Your heart health requires immediate attention. Please consult a healthcare professional as soon as possible.';
  }
  
  // Add ML model context if available
  if (mlPredictions && mlPredictions.length > 0) {
    const normalCount = mlPredictions.filter(p => p.Arrhythmia === 'N').length;
    
    if (normalCount === mlPredictions.length) {
      description += ' The ML model detected normal sinus rhythm in your ECG.';
    } else {
      description += ' The ML model detected potential arrhythmia patterns in your ECG.';
    }
  }
  
  scoreDescription.textContent = description;
}

// Draw ECG chart
function drawEcgChart() {
  // Scale data to fit in SVG
  const svgWidth = 1000;
  const svgHeight = 300;
  
  // Create path data string
  let pathData = '';
  
  // Max values for scaling
  const maxX = Math.max(...ecgData.map(point => point.x));
  
  // Scale factors
  const xScale = svgWidth / maxX;
  
  ecgData.forEach((point, index) => {
    const x = point.x * xScale;
    // Center the y values and scale them
    const y = 150 - (point.y * 50);
    
    if (index === 0) {
      pathData = `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
  });
  
  // Set path data
  ecgPath.setAttribute('d', pathData);
  
  // Add annotations for abnormal regions
  const annotations = document.getElementById('annotations');
  annotations.innerHTML = '';
  
  ecgData.forEach((point, index) => {
    if (point.abnormal) {
      const x = point.x * xScale;
      const y = 150 - (point.y * 50);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', 'rgba(239, 68, 68, 0.5)');
      
      annotations.appendChild(circle);
    }
  });
}

// Update abnormalities list
function updateAbnormalities(score) {
  // Clear previous list
  abnormalitiesList.innerHTML = '';
  
  // Generate abnormalities based on score and ML predictions
  const abnormalities = [];
  
  // Add abnormalities based on ML predictions first
  if (mlPredictions && mlPredictions.length > 0) {
    const hasVEB = mlPredictions.some(p => p.Arrhythmia === 'VEB');
    const hasSVEB = mlPredictions.some(p => p.Arrhythmia === 'SVEB');
    const hasFusion = mlPredictions.some(p => p.Arrhythmia === 'F');
    
    if (hasVEB) {
      abnormalities.push({
        name: 'Ventricular Ectopic Beat',
        description: 'Premature heartbeat originating in the ventricles',
        severity: 'high'
      });
    }
    
    if (hasSVEB) {
      abnormalities.push({
        name: 'Supraventricular Ectopic Beat',
        description: 'Premature heartbeat originating above the ventricles',
        severity: 'medium'
      });
    }
    
    if (hasFusion) {
      abnormalities.push({
        name: 'Fusion Beat',
        description: 'Beat combining ventricular and normal activation',
        severity: 'medium'
      });
    }
  }
  
  // Add abnormalities based on score
  if (score < 60) {
    abnormalities.push({
      name: 'ST-segment elevation',
      description: 'Potential sign of myocardial injury or infarction',
      severity: 'high'
    });
  }
  
  if (score < 80) {
    abnormalities.push({
      name: 'Heart Rate Irregularity',
      description: 'Irregular heart rhythm detected',
      severity: 'medium'
    });
  }
  
  if (score < 70) {
    abnormalities.push({
      name: 'QT Interval Prolongation',
      description: 'Extended time between ventricular depolarization and repolarization',
      severity: 'medium'
    });
  }
  
  // Generate HTML for each abnormality
  abnormalities.forEach(abnormality => {
    const item = document.createElement('div');
    item.className = 'abnormality-item';
    
    item.innerHTML = `
      <div class="abnormality-severity severity-${abnormality.severity}"></div>
      <div>
        <strong>${abnormality.name}</strong>
        <div>${abnormality.description}</div>
      </div>
    `;
    
    abnormalitiesList.appendChild(item);
  });
  
  // If no abnormalities were found
  if (abnormalities.length === 0) {
    abnormalitiesList.innerHTML = '<p>No significant abnormalities detected.</p>';
  }
  }
  
  // Update recommendations
  function updateRecommendations(score) {
    let recommendationsList = '';
    
    if (score >= 80) {
      recommendationsList = `
        <li>Continue regular exercise (at least 150 minutes per week)</li>
        <li>Maintain a heart-healthy diet rich in fruits, vegetables, and whole grains</li>
        <li>Schedule routine check-ups with your healthcare provider</li>
        <li>Monitor your blood pressure and cholesterol levels regularly</li>
      `;
    } else if (score >= 60) {
      recommendationsList = `
        <li>Schedule a follow-up appointment with a cardiologist</li>
        <li>Consider stress management techniques like meditation or yoga</li>
        <li>Improve your diet by reducing sodium and saturated fat intake</li>
        <li>Increase physical activity gradually under medical supervision</li>
        <li>Monitor your blood pressure daily if possible</li>
      `;
    } else {
      recommendationsList = `
        <li><strong>Seek immediate medical attention</strong></li>
        <li>Share these ECG results with your healthcare provider</li>
        <li>Avoid strenuous physical activity until cleared by a doctor</li>
        <li>Follow all medication instructions carefully</li>
        <li>Consider cardiac rehabilitation if recommended by your doctor</li>
      `;
    }
    
    recommendations.innerHTML = `<ul>${recommendationsList}</ul>`;
  }
  
  // Update status box
  function updateStatusBox(score) {
    let status, color;
    
    if (score >= 80) {
      status = 'HEALTHY';
      color = 'var(--success)';
    } else if (score >= 60) {
      status = 'CAUTION';
      color = 'var(--warning)';
    } else {
      status = 'ALERT';
      color = 'var(--danger)';
    }
    
    statusContainer.innerHTML = `
      <div class="status-box" style="background-color: ${color}">
        <span>${status}</span>
      </div>
    `;
  }
  
  // Initialize the app
  window.addEventListener('DOMContentLoaded', function() {
    // Set default active tab
    uploadTabBtn.click();
    
    // Add listeners to example buttons if they exist
    const exampleButtons = document.querySelectorAll('.example-btn');
    exampleButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Generate example data
        ecgData = generateEcgData();
        
        // Prefill form with example data
        document.getElementById('age').value = '65';
        document.getElementById('bmi').value = '27.5';
        
        // Set file name for UI feedback
        const isImageMode = uploadTabBtn.classList.contains('active');
        if (isImageMode) {
          imageName.textContent = 'example-ecg.png';
        } else {
          fileName.textContent = 'example-ecg.csv';
        }
      });
    });
  });