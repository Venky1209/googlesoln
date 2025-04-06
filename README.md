# Heart Wise ❤️‍🩹

**A preventive heart health monitoring tool that digitizes ECG images and detects arrhythmia using AI.**  
Built for the Google Solution Challenge 2025.

---

## 🧠 Problem Statement

Cardiovascular diseases are the leading cause of global deaths. Millions in rural areas lack access to regular diagnostics or cardiologists. ECG results are often paper-based and hard to interpret without expert help.

---

## 💡 Our Solution

**Heart Wise** enables early detection of heart irregularities through a simple flow:

1. Upload a scanned ECG image (from paper or phone photo)
2. Convert to digital signal & extract features
3. Predict arrhythmia class using a trained AI model

All results can optionally be shared directly with a cardiologist for live consultation.

---

## 🚀 Features

- ECG image-to-signal extraction (OpenCV, digitization)
- ML-based arrhythmia detection (Keras, CNN)
- Secure image upload & processing pipeline
- Doctor integration planned in future

---

## 🛠️ Tech Stack

| Layer              | Tech Used                             |
|-------------------|----------------------------------------|
| Frontend          | HTML/CSS + Jinja (Flask Templates)     |
| Backend           | Python, Flask                          |
| Machine Learning  | TensorFlow / Keras                     |
| OCR/Image Parsing | OpenCV, Matplotlib, NumPy              |
| Deployment        | Render.com                             |

---

## 🌐 Live MVP

> [https://heartwise.onrender.com](https://heartwise.onrender.com)  
> *(If site is inactive, it may take 1–2 mins to wake up)*

---

## 🎬 Demo Video (3 mins)

[Click to Watch](https://youtu.be/your-demo-link)

---

## 📦 Setup Instructions

### 1. Clone the Repo
```bash```
git clone https://github.com/Venky1209/googlesoln.git
cd googlesoln
  2. Install Dependencies

pip install -r requirements.txt
  3. Run the Flask App

    python app.py
Visit http://127.0.0.1:5000 in your browser.

🧪 Testing
Upload ECG images (try test samples in /sample_images)

Enter age, weight, height & activity

Get prediction results instantly

📈 Future Development
Direct cardiologist report integration

Real-time video consult feature (WebRTC)

Android app version (with offline ECG scanner)

Expansion to rural clinics via NGO/government aid

