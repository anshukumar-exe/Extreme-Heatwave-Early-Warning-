from pathlib import Path
import sys
import joblib
import numpy as np
import pandas as pd

# ============================================================
# STEP 9 — HEATWAVE ALERT PREDICTION
# Corrected for the user's current folder structure:
#
# india-heatwave-ml/
# ├── step9_heatwave_alert_prediction_corrected.py
# └── data/
#     └── ml/
#         ├── feature_columns.txt
#         ├── final_heatwave_alert_model.joblib
#         ├── final_model_metadata.txt
#         ├── ml_dataset.csv
#         └── step8_test_results.csv
# ============================================================

MODEL_PATH = Path("data/ml/final_heatwave_alert_model.joblib")
FEATURES_PATH = Path("data/ml/feature_columns.txt")
INPUT_PATH = Path("data/ml/ml_dataset.csv")
OUTPUT_PATH = Path("data/predictions/heatwave_alert_predictions.csv")

WEATHER_FEATURES = [
    "Temperature_Mean_C",
    "Temperature_Max_C",
    "Temperature_Min_C",
    "Relative_Humidity_Mean",
    "Dew_Point_Mean_C",
    "Precipitation_Sum_mm",
    "Pressure_msl_Mean_hPa",
    "Wind_Speed_kmh",
    "Wind_Direction_Dominant_deg",
    "Wet_Bulb_Temp_C",
    "Heat_Index_C",
    "WBGT_C",
]


def load_feature_columns():
    text = FEATURES_PATH.read_text(encoding="utf-8").strip()
    if not text:
        raise ValueError("feature_columns.txt is empty.")
    return [x.strip() for x in text.replace("\n", ",").split(",") if x.strip()]


def prepare_features(df, feature_columns):
    required = ["State_UT", "Year", "Month"] + WEATHER_FEATURES
    missing = [c for c in required if c not in df.columns]

    if missing:
        raise ValueError("Missing required columns: " + ", ".join(missing))

    x = df.copy()

    x["Year_numeric"] = pd.to_numeric(x["Year"], errors="coerce")
    month = pd.to_numeric(x["Month"], errors="coerce")

    if x["Year_numeric"].isna().any():
        raise ValueError("Year contains invalid values.")
    if month.isna().any():
        raise ValueError("Month contains invalid values.")
    if (~month.between(1, 12)).any():
        raise ValueError("Month must be between 1 and 12.")

    x["Month_sin"] = np.sin(2 * np.pi * (month - 1) / 12)
    x["Month_cos"] = np.cos(2 * np.pi * (month - 1) / 12)

    # Recreate the one-hot State_UT columns.
    x = pd.get_dummies(x, columns=["State_UT"], dtype=int)

    # Add any state/model columns that are absent.
    for col in feature_columns:
        if col not in x.columns:
            x[col] = 0

    x = x[feature_columns]

    for col in x.columns:
        x[col] = pd.to_numeric(x[col], errors="coerce")

    if x.isna().any().any():
        bad = x.columns[x.isna().any()].tolist()
        raise ValueError("NaN/non-numeric model features: " + ", ".join(bad))

    return x


def main():
    model_path = Path(sys.argv[1]) if len(sys.argv) > 1 else MODEL_PATH
    input_path = Path(sys.argv[2]) if len(sys.argv) > 2 else INPUT_PATH
    output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else OUTPUT_PATH

    print("=" * 65)
    print("STEP 9 — HEATWAVE ALERT PREDICTION")
    print("=" * 65)
    print(f"Model : {model_path}")
    print(f"Input : {input_path}")

    for path in [model_path, FEATURES_PATH, input_path]:
        if not path.exists():
            raise FileNotFoundError(f"Missing file: {path}")

    model = joblib.load(model_path)
    feature_columns = load_feature_columns()
    df = pd.read_csv(input_path)

    X = prepare_features(df, feature_columns)

    probability = model.predict_proba(X)[:, 1]
    prediction = (probability >= 0.5).astype(int)

    result = df[["State_UT", "Year", "Month"]].copy()
    result["Alert_Status"] = np.where(
        prediction == 1, "Alert", "No Alert"
    )
    result["Alert_Probability_Percent"] = np.round(probability * 100, 2)

    result["Prediction_Confidence"] = np.select(
        [
            probability >= 0.80,
            probability >= 0.50,
            probability >= 0.20,
        ],
        [
            "High",
            "Moderate",
            "Low",
        ],
        default="Very Low",
    )

    result["Model"] = "XGBoost"

    output_path.parent.mkdir(parents=True, exist_ok=True)
    result.to_csv(output_path, index=False)

    print("\nRESULT")
    print("-" * 65)
    print(f"Rows processed : {len(result):,}")
    print(f"Alerts         : {(prediction == 1).sum():,}")
    print(f"No Alerts      : {(prediction == 0).sum():,}")
    print(f"Features used  : {len(feature_columns)}")
    print(f"Output         : {output_path}")

    print("\nFIRST 20 PREDICTIONS")
    print("-" * 65)
    print(result.head(20).to_string(index=False))

    print("\nSTEP 9 COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    main()
