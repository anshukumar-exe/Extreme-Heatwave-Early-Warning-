from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Project root = india-heatwave-ml/
BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE_DIR / "data/ml/final_heatwave_alert_model.joblib"
FEATURES_PATH = BASE_DIR / "data/ml/feature_columns.txt"

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

app = FastAPI(
    title="India Heatwave Alert API",
    version="1.0.0",
    description="XGBoost monthly heatwave alert prediction API."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your frontend URL in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionRequest(BaseModel):
    State_UT: str = Field(..., min_length=1)
    Year: int = Field(..., ge=1900, le=2100)
    Month: int = Field(..., ge=1, le=12)

    Temperature_Mean_C: float
    Temperature_Max_C: float
    Temperature_Min_C: float
    Relative_Humidity_Mean: float = Field(..., ge=0, le=100)
    Dew_Point_Mean_C: float
    Precipitation_Sum_mm: float = Field(..., ge=0)
    Pressure_msl_Mean_hPa: float
    Wind_Speed_kmh: float = Field(..., ge=0)
    Wind_Direction_Dominant_deg: float = Field(..., ge=0, le=360)
    Wet_Bulb_Temp_C: float
    Heat_Index_C: float
    WBGT_C: float


def load_artifacts():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
    if not FEATURES_PATH.exists():
        raise FileNotFoundError(f"Feature file not found: {FEATURES_PATH}")

    model = joblib.load(MODEL_PATH)
    text = FEATURES_PATH.read_text(encoding="utf-8").strip()
    feature_columns = [
        x.strip() for x in text.replace("\n", ",").split(",") if x.strip()
    ]
    return model, feature_columns


MODEL, FEATURE_COLUMNS = load_artifacts()


def make_features(req: PredictionRequest) -> pd.DataFrame:
    data = {
        "State_UT": [req.State_UT],
        "Year": [req.Year],
        "Month": [req.Month],
    }

    for feature in WEATHER_FEATURES:
        data[feature] = [getattr(req, feature)]

    df = pd.DataFrame(data)

    df["Year_numeric"] = pd.to_numeric(df["Year"])
    month = pd.to_numeric(df["Month"])

    df["Month_sin"] = np.sin(2 * np.pi * (month - 1) / 12)
    df["Month_cos"] = np.cos(2 * np.pi * (month - 1) / 12)

    # Match Step 6 one-hot encoding.
    df = pd.get_dummies(df, columns=["State_UT"], dtype=int)

    # Add all columns expected by the trained model.
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0

    # Preserve exact feature order used during training.
    X = df[FEATURE_COLUMNS].copy()

    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    if X.isna().any().any():
        raise ValueError("Invalid or missing model feature values.")

    return X


@app.get("/")
def root():
    return {
        "service": "India Heatwave Alert API",
        "status": "running",
        "model": "XGBoost",
        "endpoint": "/predict",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "XGBoost",
        "features": len(FEATURE_COLUMNS),
    }


@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        X = make_features(req)
        probability = float(MODEL.predict_proba(X)[0, 1])
        prediction = int(probability >= 0.5)

        if probability >= 0.80:
            confidence = "High"
        elif probability >= 0.50:
            confidence = "Moderate"
        elif probability >= 0.20:
            confidence = "Low"
        else:
            confidence = "Very Low"

        return {
            "State_UT": req.State_UT,
            "Year": req.Year,
            "Month": req.Month,
            "Alert_Status": "Alert" if prediction else "No Alert",
            "Alert_Probability_Percent": round(probability * 100, 2),
            "Prediction_Confidence": confidence,
            "Model": "XGBoost",
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("predict_api:app", host="0.0.0.0", port=8000, reload=False)
