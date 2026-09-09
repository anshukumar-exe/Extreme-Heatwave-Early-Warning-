# STEP 9 APP INTEGRATION

## 1. Put the files in your project

india-heatwave-ml/
├── backend/
│   ├── predict_api.py
│   └── requirements.txt
└── data/
    └── ml/
        ├── final_heatwave_alert_model.joblib
        └── feature_columns.txt

## 2. Install dependencies

From the project root:

python3 -m pip install --user -r backend/requirements.txt

## 3. Start the API

python3 backend/predict_api.py

The API will run at:
http://127.0.0.1:8000

## 4. Check that it works

Open another terminal:

curl http://127.0.0.1:8000/health

Expected:
{"status":"ok","model":"XGBoost","features":51}

## 5. Test a prediction

curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "State_UT": "Bihar",
    "Year": 2025,
    "Month": 5,
    "Temperature_Mean_C": 32.0,
    "Temperature_Max_C": 42.0,
    "Temperature_Min_C": 26.0,
    "Relative_Humidity_Mean": 55.0,
    "Dew_Point_Mean_C": 21.0,
    "Precipitation_Sum_mm": 2.0,
    "Pressure_msl_Mean_hPa": 1000.0,
    "Wind_Speed_kmh": 12.0,
    "Wind_Direction_Dominant_deg": 90.0,
    "Wet_Bulb_Temp_C": 27.0,
    "Heat_Index_C": 44.0,
    "WBGT_C": 31.0
  }'

The response will contain:
- Alert / No Alert
- probability
- confidence
- state/year/month
- model name

IMPORTANT:
This API predicts from supplied monthly weather inputs. It does not itself obtain
future weather forecasts. For a true future alert, the frontend/backend must first
obtain forecast weather values and send those values to /predict.
