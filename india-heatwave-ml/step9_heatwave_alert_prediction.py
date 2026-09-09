from pathlib import Path
import sys
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = Path("models/final_heatwave_alert_model.joblib")
FEATURES_PATH = Path("models/feature_columns.txt")
INPUT_PATH = Path("data/ml/test.csv")
OUTPUT_PATH = Path("data/predictions/heatwave_alert_predictions.csv")

WEATHER_FEATURES = [
    "Temperature_Mean_C", "Temperature_Max_C", "Temperature_Min_C",
    "Relative_Humidity_Mean", "Dew_Point_Mean_C",
    "Precipitation_Sum_mm", "Pressure_msl_Mean_hPa",
    "Wind_Speed_kmh", "Wind_Direction_Dominant_deg",
    "Wet_Bulb_Temp_C", "Heat_Index_C", "WBGT_C"
]

def load_feature_columns():
    text = FEATURES_PATH.read_text().strip()
    return [x.strip() for x in text.replace("\n", ",").split(",") if x.strip()]

def prepare_features(df, feature_columns):
    required = ["State_UT", "Year", "Month"] + WEATHER_FEATURES
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError("Missing columns: " + ", ".join(missing))

    x = df.copy()
    x["Year_numeric"] = pd.to_numeric(x["Year"], errors="coerce")
    month = pd.to_numeric(x["Month"], errors="coerce")

    if x["Year_numeric"].isna().any() or month.isna().any():
        raise ValueError("Invalid Year or Month values.")
    if (~month.between(1, 12)).any():
        raise ValueError("Month must be between 1 and 12.")

    x["Month_sin"] = np.sin(2 * np.pi * (month - 1) / 12)
    x["Month_cos"] = np.cos(2 * np.pi * (month - 1) / 12)

    x = pd.get_dummies(x, columns=["State_UT"], dtype=int)

    for col in feature_columns:
        if col not in x.columns:
            x[col] = 0

    x = x[feature_columns]
    for col in x.columns:
        x[col] = pd.to_numeric(x[col], errors="coerce")

    if x.isna().any().any():
        raise ValueError("NaN/non-numeric values found in model features.")

    return x

def main():
    model_path = Path(sys.argv[1]) if len(sys.argv) > 1 else MODEL_PATH
    input_path = Path(sys.argv[2]) if len(sys.argv) > 2 else INPUT_PATH
    output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else OUTPUT_PATH

    if not model_path.exists():
        raise FileNotFoundError(f"Missing model: {model_path}")
    if not FEATURES_PATH.exists():
        raise FileNotFoundError(f"Missing feature file: {FEATURES_PATH}")
    if not input_path.exists():
        raise FileNotFoundError(f"Missing input: {input_path}")

    model = joblib.load(model_path)
    features = load_feature_columns()
    df = pd.read_csv(input_path)
    X = prepare_features(df, features)

    probability = model.predict_proba(X)[:, 1]
    prediction = (probability >= 0.5).astype(int)

    result = df[["State_UT", "Year", "Month"]].copy()
    result["Alert_Status"] = np.where(prediction == 1, "Alert", "No Alert")
    result["Alert_Probability_Percent"] = np.round(probability * 100, 2)

    result["Prediction_Confidence"] = np.select(
        [probability >= 0.80, probability >= 0.50, probability >= 0.20],
        ["High", "Moderate", "Low"],
        default="Very Low"
    )
    result["Model"] = "XGBoost"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(output_path, index=False)

    print("=" * 60)
    print("STEP 9 — HEATWAVE ALERT PREDICTION COMPLETE")
    print("=" * 60)
    print(f"Input rows : {len(df):,}")
    print(f"Features   : {len(features)}")
    print(f"Alerts     : {(prediction == 1).sum():,}")
    print(f"No Alerts  : {(prediction == 0).sum():,}")
    print(f"Output     : {output_path}")
    print("\nFirst 20 predictions:")
    print(result.head(20).to_string(index=False))

if __name__ == "__main__":
    main()
