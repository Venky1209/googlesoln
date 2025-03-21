import pandas as pd
import os

def convert_to_ml_format(feature_csv):
    print(f"🔄 Processing {feature_csv} for ML model...")

    df = pd.read_csv(feature_csv)

    # Define required columns for ML model
    required_columns = [
        "BPM", "Mean RR", "HRV", "P-Peak", "T-Peak", "R-Peak", "S-Peak",
        "Q-Peak", "QRS Interval", "QT Interval"
    ]

    # Check for missing columns
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        print(f"❌ Error: Missing columns - {missing_columns}")
        return None

    # Rename columns to match ML model input
    rename_map = {
        "BPM": "0_pre-RR", "Mean RR": "0_post-RR", "HRV": "0_pPeak",
        "P-Peak": "0_tPeak", "T-Peak": "0_rPeak", "R-Peak": "0_sPeak",
        "S-Peak": "0_qPeak", "Q-Peak": "0_qrs_interval",
        "QRS Interval": "0_pq_interval", "QT Interval": "0_qt_interval"
    }
    df.rename(columns=rename_map, inplace=True)

    # Save processed CSV for ML
    ml_input_csv = os.path.join("uploads", "final_ml_input.csv")
    df.to_csv(ml_input_csv, index=False)

    print(f"✅ ML input CSV saved: {ml_input_csv}")
    return ml_input_csv
