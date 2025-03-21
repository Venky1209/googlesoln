import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
import numpy as np

def fetch_ecg_from_firebase():
    cred = credentials.Certificate("firebase_credentials.json")
    firebase_admin.initialize_app(cred, {"databaseURL": "https://your-project-id.firebaseio.com"})

    ref = db.reference("/ecg/raw_data")
    ecg_data = ref.get()

    if not ecg_data:
        return None

    # Convert Firebase JSON data to NumPy array
    ecg_signal = np.array(list(ecg_data.values()))

    # Save it to CSV for feature extraction
    df = pd.DataFrame({"ECG Signal": ecg_signal})
    csv_file = "./uploads/firebase_ecg.csv"
    df.to_csv(csv_file, index=False)

    return csv_file
