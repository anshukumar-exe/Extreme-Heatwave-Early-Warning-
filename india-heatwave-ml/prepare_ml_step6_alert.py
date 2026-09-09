#!/usr/bin/env python3

"""
STEP 6 — PREPARE INDIA HEATWAVE DATA FOR ML

Reads:
    data/india_heatwave_2011_2025.csv

Creates:
    data/ml/
        train.csv
        validation.csv
        test.csv
        ml_dataset.csv

Purpose:
- Select ML features
- Create human-readable Alert / No Alert classification target
- Create regression target
- Encode State/UT
- Use chronological train/validation/test split
- Prevent direct target leakage
- Keep the original final dataset unchanged

Split:
    2011-2021 -> TRAIN
    2022-2023 -> VALIDATION
    2024-2025 -> TEST

This script DOES NOT download data.
"""

from pathlib import Path
import sys
import pandas as pd
import numpy as np

BASE = Path(__file__).resolve().parent
INPUT = BASE / "data" / "india_heatwave_2011_2025.csv"
OUT_DIR = BASE / "data" / "ml"

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

TARGET_REGRESSION = "Heatwave_Days"
TARGET_CLASSIFICATION = "Alert_Status"

# These columns are deliberately excluded from model inputs:
# - direct targets
# - target-derived indicators
# - retrospective anomaly/baseline variables used in the label
EXCLUDED_FROM_FEATURES = [
    "Heatwave_Days",
    "Heatwave_Occurred",
    "Extreme_Heat_Days",
    "Heat_Risk_Score",
    "Risk_Category",
    "Temp_Anomaly_C",
    "Temp_Baseline_C",
    "Data_Source",
    "Data_Quality",
    "Spatial_Representation",
]

# Weather variables that can be used as predictors.
FEATURE_COLUMNS = [
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

REQUIRED_COLUMNS = [
    "State_UT",
    "Year",
    "Month",
    TARGET_REGRESSION,
] + FEATURE_COLUMNS


def stop(message):
    print("\nERROR:", message)
    sys.exit(1)


def main():
    print("=" * 72)
    print("STEP 6 — PREPARING DATA FOR ML")
    print("=" * 72)
    print("Existing monthly dataset only — NO DOWNLOAD")
    print()

    # --------------------------------------------------------
    # 1. Load final monthly dataset
    # --------------------------------------------------------
    if not INPUT.exists():
        stop(f"Input file not found:\n{INPUT}")

    print("STEP 6.1 — LOADING FINAL MONTHLY DATASET")
    print(f"Input: {INPUT}")

    df = pd.read_csv(INPUT)

    print(f"Rows loaded: {len(df):,}")
    print(f"Columns loaded: {len(df.columns)}")

    # --------------------------------------------------------
    # 2. Check required columns
    # --------------------------------------------------------
    missing_columns = [
        c for c in REQUIRED_COLUMNS if c not in df.columns
    ]

    if missing_columns:
        stop(
            "Required columns are missing:\n"
            + "\n".join(missing_columns)
        )

    print("Required columns: PASS")

    # --------------------------------------------------------
    # 3. Basic integrity checks
    # --------------------------------------------------------
    print("\nSTEP 6.2 — DATA INTEGRITY CHECKS")

    if len(df) != 6480:
        stop(f"Expected 6480 monthly rows, found {len(df)}.")

    if df["State_UT"].nunique() != 36:
        stop(
            f"Expected 36 State/UTs, found "
            f"{df['State_UT'].nunique()}."
        )

    if df.duplicated(
        ["State_UT", "Year", "Month"]
    ).any():
        stop("Duplicate State_UT + Year + Month records found.")

    if df[REQUIRED_COLUMNS].isna().any().any():
        missing = df[REQUIRED_COLUMNS].isna().sum()
        print(missing[missing > 0])
        stop("Missing values found in ML-required columns.")

    if not df["Year"].between(2011, 2025).all():
        stop("Year outside 2011-2025 detected.")

    if not df["Month"].between(1, 12).all():
        stop("Invalid month detected.")

    print("6480 monthly rows: PASS")
    print("36 State/UTs: PASS")
    print("Monthly uniqueness: PASS")
    print("No missing ML values: PASS")

    # --------------------------------------------------------
    # 4. Create classification target
    # --------------------------------------------------------
    print("\nSTEP 6.3 — CREATING ML TARGETS")

    # Human-readable target for the project/UI.
    # ML models can encode these labels internally later.
    df[TARGET_CLASSIFICATION] = np.where(
        df[TARGET_REGRESSION] > 0,
        "Alert",
        "No Alert"
    )

    print(
        "Classification target:",
        TARGET_CLASSIFICATION
    )

    print("\nAlert distribution:")
    counts = df[TARGET_CLASSIFICATION].value_counts()
    percentages = (
        df[TARGET_CLASSIFICATION]
        .value_counts(normalize=True)
        * 100
    )

    for label in ["No Alert", "Alert"]:
        print(
            f"  {label}: {counts.get(label, 0):,} rows "
            f"({percentages.get(label, 0):.2f}%)"
        )

    # --------------------------------------------------------
    # 5. State encoding
    # --------------------------------------------------------
    print("\nSTEP 6.4 — ENCODING STATE/UT")

    # One-hot encoding avoids imposing a fake numeric ordering
    # such as Andhra Pradesh=1, Assam=2, etc.
    state_encoded = pd.get_dummies(
        df["State_UT"],
        prefix="State",
        dtype=int
    )

    if state_encoded.shape[1] != 36:
        stop(
            "Expected 36 State/UT one-hot columns, found "
            f"{state_encoded.shape[1]}."
        )

    # --------------------------------------------------------
    # 6. Time features
    # --------------------------------------------------------
    # Month is cyclic: December and January are adjacent.
    # Add sine/cosine representation.
    df["Month_sin"] = np.sin(
        2 * np.pi * df["Month"] / 12
    )
    df["Month_cos"] = np.cos(
        2 * np.pi * df["Month"] / 12
    )

    # Year is kept as a numeric trend variable.
    # Models can use it to account for long-term changes.
    df["Year_numeric"] = df["Year"]

    time_features = [
        "Year_numeric",
        "Month_sin",
        "Month_cos",
    ]

    # --------------------------------------------------------
    # 7. Build ML matrix
    # --------------------------------------------------------
    print("\nSTEP 6.5 — BUILDING ML FEATURE MATRIX")

    X = pd.concat(
        [
            df[FEATURE_COLUMNS + time_features].reset_index(drop=True),
            state_encoded.reset_index(drop=True),
        ],
        axis=1,
    )

    # Ensure all model inputs are numeric.
    X = X.apply(pd.to_numeric, errors="coerce")

    if X.isna().any().any():
        stop("NaN values appeared after feature construction.")

    if np.isinf(X.to_numpy()).any():
        stop("Infinite values found in ML features.")

    y_class = df[TARGET_CLASSIFICATION].astype(str)
    y_reg = pd.to_numeric(
        df[TARGET_REGRESSION],
        errors="coerce"
    )

    if y_reg.isna().any():
        stop("Invalid Heatwave_Days target values found.")

    # Metadata retained for tracking rows.
    meta = df[
        ["State_UT", "Year", "Month"]
    ].reset_index(drop=True)

    # Complete ML dataset.
    ml = pd.concat(
        [
            meta,
            X.reset_index(drop=True),
            y_class.reset_index(drop=True),
            y_reg.reset_index(drop=True),
        ],
        axis=1,
    )

    # --------------------------------------------------------
    # 8. Chronological split
    # --------------------------------------------------------
    print("\nSTEP 6.6 — TRAIN / VALIDATION / TEST SPLIT")

    train_mask = ml["Year"].between(2011, 2021)
    validation_mask = ml["Year"].between(2022, 2023)
    test_mask = ml["Year"].between(2024, 2025)

    train = ml.loc[train_mask].copy()
    validation = ml.loc[validation_mask].copy()
    test = ml.loc[test_mask].copy()

    print(
        f"TRAIN      2011-2021: {len(train):,} rows"
    )
    print(
        f"VALIDATION 2022-2023: {len(validation):,} rows"
    )
    print(
        f"TEST       2024-2025: {len(test):,} rows"
    )

    if len(train) + len(validation) + len(test) != len(ml):
        stop("Train/validation/test rows do not add up.")

    # Expected:
    # 36 states * 11 years * 12 months = 4752
    # 36 states * 2 years * 12 months  = 864
    # 36 states * 2 years * 12 months  = 864
    if len(train) != 4752:
        stop(f"Unexpected training size: {len(train)}")

    if len(validation) != 864:
        stop(f"Unexpected validation size: {len(validation)}")

    if len(test) != 864:
        stop(f"Unexpected test size: {len(test)}")

    # --------------------------------------------------------
    # 9. Leakage checks
    # --------------------------------------------------------
    print("\nSTEP 6.7 — DATA LEAKAGE CHECK")

    forbidden = set(EXCLUDED_FROM_FEATURES)

    leaked = sorted(
        forbidden.intersection(set(X.columns))
    )

    if leaked:
        stop(
            "Potential target leakage detected in features:\n"
            + "\n".join(leaked)
        )

    print("Direct target leakage: PASS")
    print(
        "Excluded from features:",
        ", ".join(EXCLUDED_FROM_FEATURES)
    )

    # --------------------------------------------------------
    # 10. Save
    # --------------------------------------------------------
    print("\nSTEP 6.8 — SAVING ML DATASETS")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    ml_path = OUT_DIR / "ml_dataset.csv"
    train_path = OUT_DIR / "train.csv"
    validation_path = OUT_DIR / "validation.csv"
    test_path = OUT_DIR / "test.csv"

    ml.to_csv(ml_path, index=False)
    train.to_csv(train_path, index=False)
    validation.to_csv(validation_path, index=False)
    test.to_csv(test_path, index=False)

    # --------------------------------------------------------
    # 11. Final validation
    # --------------------------------------------------------
    print("\n" + "=" * 72)
    print("STEP 6 — FINAL VALIDATION")
    print("=" * 72)

    checks = [
        ("ML dataset rows = 6480", len(ml) == 6480),
        ("Train rows = 4752", len(train) == 4752),
        ("Validation rows = 864", len(validation) == 864),
        ("Test rows = 864", len(test) == 864),
        ("36 State/UTs", ml["State_UT"].nunique() == 36),
        (
            "Train years = 2011-2021",
            set(train["Year"]) == set(range(2011, 2022)),
        ),
        (
            "Validation years = 2022-2023",
            set(validation["Year"]) == {2022, 2023},
        ),
        (
            "Test years = 2024-2025",
            set(test["Year"]) == {2024, 2025},
        ),
        (
            "No duplicate State/Year/Month",
            not ml.duplicated(
                ["State_UT", "Year", "Month"]
            ).any(),
        ),
        (
            "No missing feature values",
            not X.isna().any().any(),
        ),
        (
            "No infinite feature values",
            not np.isinf(X.to_numpy()).any(),
        ),
        (
            "Alert/No Alert classification target",
            set(y_class.unique()).issubset({"Alert", "No Alert"}),
        ),
        (
            "Non-negative Heatwave_Days",
            (y_reg >= 0).all(),
        ),
    ]

    all_pass = True

    for name, result in checks:
        print(
            ("PASS " if result else "FAIL ") + name
        )
        if not result:
            all_pass = False

    print("\nFeature count:", X.shape[1])

    if not all_pass:
        print("\nSTEP 6 FAILED.")
        print("Do NOT start model training yet.")
        sys.exit(1)

    print("\n" + "=" * 72)
    print("STEP 6 COMPLETE — ML DATA READY")
    print("=" * 72)

    print("\nCreated:")
    print(f"  {train_path}")
    print(f"  {validation_path}")
    print(f"  {test_path}")
    print(f"  {ml_path}")

    print("\nNext step: STEP 7 — TRAIN ML MODELS")


if __name__ == "__main__":
    main()
