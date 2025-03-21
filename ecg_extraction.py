import cv2
import numpy as np
import pandas as pd
from scipy.signal import find_peaks
import os

def extract_ecg_from_image(image_path):
    print(f"Processing image: {image_path}")

    if not os.path.exists(image_path):
        print("❌ Error: Image file does not exist.")
        return None

    # Load ECG Image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        print("❌ Error: Could not read the image.")
        return None

    # Apply Thresholding to extract the waveform
    _, binary = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY_INV)
    
    # Find the contours of the ECG signal
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        print("❌ Error: No ECG waveform detected.")
        return None

    # Extract the largest contour (ECG waveform)
    ecg_contour = max(contours, key=cv2.contourArea)
    ecg_signal = [point[0][1] for point in ecg_contour]
    ecg_signal = np.array(ecg_signal)

    # Normalize ECG signal
    ecg_signal = 1 - (ecg_signal - np.min(ecg_signal)) / (np.max(ecg_signal) - np.min(ecg_signal))

    # Detect R-peaks
    peaks, _ = find_peaks(ecg_signal, height=0.5, distance=50)
    print(f"✅ R-peaks detected: {len(peaks)}")

    # Convert ECG data into DataFrame
    df = pd.DataFrame({
        "Time": np.arange(len(ecg_signal)),
        "ECG Signal": ecg_signal,
        "R-Peak": [1 if i in peaks else 0 for i in range(len(ecg_signal))]
    })

    # Save as CSV
    csv_filename = f"./uploads/extracted_ecg.csv"
    df.to_csv(csv_filename, index=False)

    if os.path.exists(csv_filename):
        print(f"✅ CSV successfully created: {csv_filename}")
    else:
        print("❌ Error: CSV file was not saved.")

    return csv_filename
