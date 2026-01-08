from flask import Flask, request, jsonify, send_from_directory
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__, static_folder="ui", static_url_path="")

# ===============================
# Load trained model
# ===============================
MODEL_PATH = "models.pkl"
model = joblib.load(MODEL_PATH)

# ===============================
# Serve UI Pages
# ===============================
@app.route("/")
def home():
    return send_from_directory("ui", "index.html")

@app.route("/<path:filename>")
def serve_ui(filename):
    return send_from_directory("ui", filename)

# ===============================
# Prediction API
# ===============================
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    try:
        # -------- Numeric Inputs --------
        age = int(data["age"])
        gender = int(data["gender"])
        height = int(data["height"])
        weight = float(data["weight"])
        ap_hi = int(data["ap_hi"])
        ap_lo = int(data["ap_lo"])
        cholesterol = int(data["cholesterol"])
        gluc = int(data["gluc"])
        smoke = int(data["smoke"])
        alco = int(data["alco"])
        active = int(data["active"])

        # -------- Feature Engineering --------
        bmi = weight / ((height / 100) ** 2)

        # -------- Model Input Order (MATCH TRAINING) --------
        numeric_features = np.array([
            age, height, weight, ap_hi, ap_lo, bmi
        ]).reshape(1, -1)

        categorical_features = np.array([
            gender, cholesterol, gluc, smoke, alco, active
        ]).reshape(1, -1)

        final_input = np.hstack((numeric_features, categorical_features))

        # -------- Prediction --------
        prediction = int(model.predict(final_input)[0])
        probability = float(model.predict_proba(final_input)[0][1])

        # -------- Risk Mapping --------
        if probability >= 0.7:
            risk_level = "High"
        elif probability >= 0.4:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # -------- Response (Frontend Contract) --------
        return jsonify({
            "prediction": prediction,
            "probability": probability,
            "risk_level": risk_level
        })

    except Exception as e:
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 500


# ===============================
# Run App
# ===============================
if __name__ == "__main__":
    app.run(debug=True)


# import streamlit as st
# import pandas as pd
# import numpy as np
# import joblib

# # Load trained model and scaler
# model = joblib.load("models.pkl")
# # scaler = joblib.load("scaler.pkl")

# st.title("❤️ Cardiovascular Disease Prediction")

# st.write("Enter patient health details:")

# # Input fields
# age = st.number_input("Age (years)", 18, 100, 50)
# gender = st.selectbox("Gender", [0, 1])  # 0 = Female, 1 = Male
# height = st.number_input("Height (cm)", 140, 200, 165)
# weight = st.number_input("Weight (kg)", 40, 150, 70)
# ap_hi = st.number_input("Systolic BP", 80, 250, 120)
# ap_lo = st.number_input("Diastolic BP", 40, 150, 80)
# cholesterol = st.selectbox("Cholesterol Level", [1, 2, 3])
# gluc = st.selectbox("Glucose Level", [1, 2, 3])
# smoke = st.selectbox("Smoking", [0, 1])
# alco = st.selectbox("Alcohol Intake", [0, 1])
# active = st.selectbox("Physically Active", [0, 1])

# bmi = weight / ((height / 100) ** 2)

# if st.button("Predict"):
#     input_data = pd.DataFrame([[age, height, weight, ap_hi, ap_lo, bmi]],
#                               columns=['age','height','weight','ap_hi','ap_lo','bmi'])
    
#     # input_scaled = scaler.transform(input_data)

#     cat_data = np.array([[gender, cholesterol, gluc, smoke, alco, active]])
#     final_input = np.hstack((input_data, cat_data))

#     prediction = model.predict(final_input)
#     probability = model.predict_proba(final_input)[0][1]

#     if prediction[0] == 1:
#         st.error(f"⚠️ High Risk of Cardiovascular Disease\nProbability: {probability:.2%}")
#     else:
#         st.success(f"✅ Low Risk of Cardiovascular Disease\nProbability: {probability:.2%}")
