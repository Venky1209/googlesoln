import numpy as np
import pandas as pd
from scipy.signal import find_peaks

def extract_features_from_ecg(csv_file):
    print(f"Processing CSV: {csv_file}")

    # Load the extracted ECG CSV
    df = pd.read_csv(csv_file)

    if "ECG Signal" not in df.columns:
        print("❌ Error: 'ECG Signal' column missing in CSV.")
        return None

    # Get ECG signal values
    ecg_signal = df["ECG Signal"].values

    # Detect R-peaks (heartbeat spikes)
    peaks, _ = find_peaks(ecg_signal, height=0.5, distance=50)

    # Calculate BPM (Beats per Minute)
    bpm = len(peaks) * 6  # Convert peak count to BPM

    # Calculate RR Intervals (Time between R-peaks)
    rr_intervals = np.diff(peaks) if len(peaks) > 1 else [0]
    mean_rr = np.mean(rr_intervals) if len(rr_intervals) > 0 else 0
    hrv = np.std(rr_intervals) if len(rr_intervals) > 0 else 0

    # Extract PQRST peaks
    p_peak = np.max(ecg_signal[:len(ecg_signal)//5])  # P-wave
    t_peak = np.max(ecg_signal[-len(ecg_signal)//5:])  # T-wave
    r_peak = np.max(ecg_signal)  # R-wave
    s_peak = np.min(ecg_signal)  # S-wave
    q_peak = np.percentile(ecg_signal, 5)  # Q-wave

    # Calculate ECG Intervals
    qrs_interval = np.abs(q_peak - s_peak) * 100
    qt_interval = np.abs(q_peak - t_peak) * 100

    # Create DataFrame for ML
    features = pd.DataFrame([{
        "BPM": bpm,
        "Mean RR": mean_rr,
        "HRV": hrv,
        "P-Peak": p_peak,
        "T-Peak": t_peak,
        "R-Peak": r_peak,
        "S-Peak": s_peak,
        "Q-Peak": q_peak,
        "QRS Interval": qrs_interval,
        "QT Interval": qt_interval,
    }])

    # Save to CSV
    processed_csv = "./uploads/processed_ecg_data.csv"
    features.to_csv(processed_csv, index=False)

    print(f"✅ Features extracted and saved to {processed_csv}")
    return processed_csv
