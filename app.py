from flask import Flask, request, jsonify, render_template, flash, send_file
import os
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from ecg_extraction import extract_ecg_from_image  # Step 1: Convert ECG Image to Raw CSV
from feature_extraction import extract_features_from_ecg  # Step 2: Extract Features from CSV
from ml_preprocess import convert_to_ml_format  # Step 3: Convert to ML-Compatible Format

app = Flask(__name__)
app.secret_key = "ecg_analysis_secret_key"

UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store paths for the latest processed files
LATEST_PROCESSED = {
    "raw_csv": None,
    "processed_csv": None,
    "final_csv": None,
    "predictions": None
}

# Load ML Model
MODEL_PATH = os.path.join("models", "heart_risk_prediction_model.h5")
model = load_model(MODEL_PATH)

# Dictionary for arrhythmia descriptions
ARRHYTHMIA_DESCRIPTIONS = {
    'N': 'Normal sinus rhythm',
    'SVEB': 'Supraventricular ectopic beat',
    'VEB': 'Ventricular ectopic beat',
    'F': 'Fusion beat',
    'Q': 'Unclassifiable beat'
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'ecgImage' not in request.files:
        flash("No file selected", "error")
        return render_template('index.html')

    file = request.files['ecgImage']
    
    if file.filename == '':
        flash("No file selected", "error")
        return render_template('index.html')
    
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
    if not file.filename.lower().split('.')[-1] in allowed_extensions:
        flash("Invalid file type. Please upload an image file.", "error")
        return render_template('index.html')
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        print("🚀 Image successfully uploaded:", file_path)

        # ✅ Step 1: Convert Image to Raw ECG CSV
        raw_csv = extract_ecg_from_image(file_path)
        LATEST_PROCESSED["raw_csv"] = raw_csv
        print("🔍 Extracted ECG CSV:", raw_csv)

        if not raw_csv or not os.path.exists(raw_csv):
            flash("ECG extraction failed. Please try a clearer image.", "error")
            return render_template('index.html')

        # ✅ Step 2: Extract ECG Key Features
        processed_csv = extract_features_from_ecg(raw_csv)
        LATEST_PROCESSED["processed_csv"] = processed_csv
        print("🔍 Processed ECG CSV:", processed_csv)

        if not processed_csv or not os.path.exists(processed_csv):
            flash("Feature extraction failed.", "error")
            return render_template('index.html')

        # ✅ Step 3: Convert Features to ML-Compatible Format
        final_csv = convert_to_ml_format(processed_csv)
        LATEST_PROCESSED["final_csv"] = final_csv
        print("🔍 Final ML Input CSV:", final_csv)

        if not final_csv or not os.path.exists(final_csv):
            flash("ML input conversion failed.", "error")
            return render_template('index.html')

        # ✅ Step 4: Run ML Model & Predict
        return predict(final_csv)

    except Exception as e:
        print(f"Error: {str(e)}")
        flash(f"Processing error: {str(e)}", "error")
        return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict(final_csv=None):
    file = final_csv if final_csv else request.files.get('csvFile')

    if not file:
        flash("No file uploaded", "error")
        return render_template('index.html')

    try:
        # 🔍 Fix: Ensure `file` is a valid CSV file path
        if isinstance(file, str) and os.path.exists(file):  
            print("📂 Reading CSV from path:", file)
            input_data = pd.read_csv(file)  # Read directly if it's a file path
        else:
            print("📂 Reading uploaded CSV file")
            input_data = pd.read_csv(file.stream)  # Read from file upload

        print("✅ Data before ML Model:", input_data.head())

        X = input_data.values.reshape((input_data.shape[0], input_data.shape[1], 1))

        # ✅ Step 5: Make ML Predictions
        predictions = model.predict(X)
        predicted_labels = predictions.argmax(axis=1)

        # 🔍 Debug: Print raw predictions
        print("🔍 Raw model output:", predictions)
        print("🔍 Predicted labels:", predicted_labels)

        # Define Arrhythmia Categories
        arrhythmia_types = ['N', 'Q', 'SVEB', 'VEB', 'F']

        # ✅ Fix: Ensure the predicted labels are valid
        results = []
        for label in predicted_labels:
            if 0 <= label < len(arrhythmia_types):
                arrhythmia = arrhythmia_types[label]
                results.append({
                    "Arrhythmia": arrhythmia,
                    "Description": ARRHYTHMIA_DESCRIPTIONS.get(arrhythmia, "Unknown type")
                })
            else:
                results.append({
                    "Arrhythmia": "Unknown", 
                    "Description": "Invalid Prediction"
                })

        # Store the predictions for API access
        LATEST_PROCESSED["predictions"] = results

        print("✅ Final formatted predictions:", results)

        # Return JSON if requested via API
        if request.headers.get('Accept') == 'application/json':
            return jsonify({"predictions": results})
        
        # Otherwise return the template
        return render_template('result.html', predictions=results)

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        flash(f"Prediction error: {str(e)}", "error")
        return render_template('index.html')

@app.route('/api/get_processed_csv', methods=['GET'])
def get_processed_csv():
    """API endpoint to get the processed ECG data"""
    raw_csv = LATEST_PROCESSED.get("raw_csv")
    
    if not raw_csv or not os.path.exists(raw_csv):
        # Return a sample or default CSV if no data is available
        return send_file('final_ml_input.csv', mimetype='text/csv')
    
    return send_file(raw_csv, mimetype='text/csv')

@app.route('/api/get_predictions', methods=['GET'])
def get_predictions():
    """API endpoint to get the ML predictions"""
    predictions = LATEST_PROCESSED.get("predictions")
    
    if not predictions:
        # Return default predictions if none available
        return jsonify({
            "predictions": [{
                "Arrhythmia": "N",
                "Description": "Normal sinus rhythm"
            }]
        })
    
    return jsonify({"predictions": predictions})

if __name__ == "__main__":
    app.run(debug=True)