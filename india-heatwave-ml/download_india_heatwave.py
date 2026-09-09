import requests
import pandas as pd
import numpy as np
import time
from pathlib import Path
import threading
import sys
import termios
import tty


# ============================================================
# INDIA HEATWAVE DATASET
# ERA5 via Open-Meteo Historical Weather API
#
# KEYBOARD CONTROLS:
# P = Pause
# R = Resume
# Q = Quit safely
# ============================================================


# ============================================================
# 1. INDIAN STATES + UNION TERRITORIES
# ============================================================

states = {

    'Andhra Pradesh':
        (15.9129, 79.7400, 'South'),

    'Arunachal Pradesh':
        (28.2180, 94.7278, 'Northeast'),

    'Assam':
        (26.2006, 92.9376, 'Northeast'),

    'Bihar':
        (25.0961, 85.3131, 'East'),

    'Chhattisgarh':
        (21.2787, 81.8661, 'Central'),

    'Goa':
        (15.2993, 74.1240, 'West'),

    'Gujarat':
        (22.2587, 71.1924, 'West'),

    'Haryana':
        (29.0588, 76.0856, 'North'),

    'Himachal Pradesh':
        (31.1048, 77.1734, 'North'),

    'Jharkhand':
        (23.6102, 85.2799, 'East'),

    'Karnataka':
        (15.3173, 75.7139, 'South'),

    'Kerala':
        (10.8505, 76.2711, 'South'),

    'Madhya Pradesh':
        (22.9734, 78.6569, 'Central'),

    'Maharashtra':
        (19.7515, 75.7139, 'West'),

    'Manipur':
        (24.6637, 93.9063, 'Northeast'),

    'Meghalaya':
        (25.4670, 91.3662, 'Northeast'),

    'Mizoram':
        (23.1645, 92.9376, 'Northeast'),

    'Nagaland':
        (26.1584, 94.5624, 'Northeast'),

    'Odisha':
        (20.9517, 85.0985, 'East'),

    'Punjab':
        (31.1471, 75.3412, 'North'),

    'Rajasthan':
        (27.0238, 74.2179, 'North'),

    'Sikkim':
        (27.5330, 88.5122, 'Northeast'),

    'Tamil Nadu':
        (11.1271, 78.6569, 'South'),

    'Telangana':
        (18.1124, 79.0193, 'South'),

    'Tripura':
        (23.9408, 91.9882, 'Northeast'),

    'Uttar Pradesh':
        (26.8467, 80.9462, 'North'),

    'Uttarakhand':
        (30.0668, 79.0193, 'North'),

    'West Bengal':
        (22.9868, 87.8550, 'East'),

    'Andaman and Nicobar Islands':
        (11.7401, 92.6586, 'UT'),

    'Chandigarh':
        (30.7333, 76.7794, 'UT'),

    'Dadra and Nagar Haveli and Daman and Diu':
        (20.1809, 73.0169, 'UT'),

    'Delhi':
        (28.7041, 77.1025, 'UT'),

    'Jammu and Kashmir':
        (33.7782, 76.5762, 'UT'),

    'Ladakh':
        (34.1526, 77.5770, 'UT'),

    'Lakshadweep':
        (10.5667, 72.6417, 'UT'),

    'Puducherry':
        (11.9416, 79.8083, 'UT')
}


# ============================================================
# 2. SETTINGS
# ============================================================

BASE_URL = (
    "https://archive-api.open-meteo.com/v1/archive"
)

START_YEAR = 2011
END_YEAR = 2025

DATA_DIR = Path("data")

RAW_DIR = DATA_DIR / "raw"

RAW_DIR.mkdir(
    parents=True,
    exist_ok=True
)

FINAL_DAILY = (
    DATA_DIR /
    "india_heatwave_daily_2011_2025.csv"
)

FINAL_MONTHLY = (
    DATA_DIR /
    "india_heatwave_2011_2025.csv"
)


# ============================================================
# 3. WEATHER VARIABLES
# ============================================================

VARIABLES = [

    "temperature_2m_mean",

    "temperature_2m_max",

    "temperature_2m_min",

    "relative_humidity_2m_mean",

    "dew_point_2m_mean",

    "precipitation_sum",

    "wind_speed_10m_mean",

    "wind_direction_10m_dominant",

    "pressure_msl_mean"

]


# ============================================================
# 4. CONTROL FLAGS
# ============================================================

paused = threading.Event()

quit_requested = threading.Event()


# ============================================================
# 5. KEYBOARD LISTENER
# ============================================================

def keyboard_listener():

    if not sys.stdin.isatty():

        return

    old_settings = termios.tcgetattr(
        sys.stdin
    )

    try:

        tty.setcbreak(
            sys.stdin.fileno()
        )

        while not quit_requested.is_set():

            key = sys.stdin.read(1).lower()

            # ----------------------------
            # PAUSE
            # ----------------------------

            if key == "p":

                if not paused.is_set():

                    paused.set()

                    print()
                    print(
                        ">>> PAUSED"
                    )

                    print(
                        "Press R to resume."
                    )

                    print(
                        "Press Q to quit safely."
                    )

            # ----------------------------
            # RESUME
            # ----------------------------

            elif key == "r":

                if paused.is_set():

                    paused.clear()

                    print()
                    print(
                        ">>> RESUMED"
                    )

            # ----------------------------
            # QUIT
            # ----------------------------

            elif key == "q":

                print()
                print(
                    ">>> QUIT REQUESTED"
                )

                print(
                    "Stopping safely..."
                )

                quit_requested.set()

                paused.clear()

                break

    finally:

        termios.tcsetattr(
            sys.stdin,
            termios.TCSADRAIN,
            old_settings
        )


# ============================================================
# 6. CHECK PAUSE / QUIT
# ============================================================

def wait_for_resume():

    while paused.is_set():

        if quit_requested.is_set():

            return False

        time.sleep(0.5)

    if quit_requested.is_set():

        return False

    return True


# ============================================================
# 7. INTERRUPTIBLE WAIT
# ============================================================

def safe_sleep(seconds):

    for _ in range(seconds):

        if quit_requested.is_set():

            return False

        if not wait_for_resume():

            return False

        time.sleep(1)

    return True


# ============================================================
# 8. API REQUEST WITH RETRY
# ============================================================

def get_data(params):

    wait_time = 60

    for attempt in range(8):

        if not wait_for_resume():

            return None

        try:

            response = requests.get(

                BASE_URL,

                params=params,

                timeout=180

            )

            # ----------------------------------------
            # SUCCESS
            # ----------------------------------------

            if response.status_code == 200:

                return response.json()

            # ----------------------------------------
            # RATE LIMIT
            # ----------------------------------------

            if response.status_code == 429:

                print()

                print(
                    "      429 Too Many Requests"
                )

                print(
                    f"      Waiting "
                    f"{wait_time} seconds..."
                )

                if not safe_sleep(
                    wait_time
                ):

                    return None

                wait_time = min(
                    wait_time * 2,
                    600
                )

                continue

            # ----------------------------------------
            # OTHER HTTP ERROR
            # ----------------------------------------

            print()

            print(
                f"      HTTP Error: "
                f"{response.status_code}"
            )

            print(
                "      Retrying..."
            )

            if not safe_sleep(60):

                return None

        except requests.exceptions.RequestException as e:

            print()

            print(
                f"      Network error: {e}"
            )

            print(
                f"      Waiting "
                f"{wait_time} seconds..."
            )

            if not safe_sleep(
                wait_time
            ):

                return None

            wait_time = min(
                wait_time * 2,
                600
            )

    print()

    print(
        "      FAILED after all retries."
    )

    return None


# ============================================================
# 9. SPLIT 36 STATES INTO GROUPS OF 6
# ============================================================

state_items = list(
    states.items()
)

chunks = []

for i in range(
    0,
    len(state_items),
    6
):

    chunks.append(
        state_items[
            i:i + 6
        ]
    )


# ============================================================
# 10. START PROGRAM
# ============================================================

print()

print(
    "=" * 70
)

print(
    "INDIA HEATWAVE DATA DOWNLOADER"
)

print(
    "=" * 70
)

print()

print(
    f"States/UTs      : "
    f"{len(states)}"
)

print(
    f"Years           : "
    f"{START_YEAR}-{END_YEAR}"
)

print(
    f"States per chunk: 6"
)

print(
    f"Number of chunks: "
    f"{len(chunks)}"
)

print()

print(
    "KEYBOARD CONTROLS"
)

print(
    "  P = Pause"
)

print(
    "  R = Resume"
)

print(
    "  Q = Quit safely"
)

print()

print(
    "Already downloaded files "
    "will automatically be skipped."
)

print()


# ============================================================
# 11. START KEYBOARD THREAD
# ============================================================

keyboard_thread = threading.Thread(

    target=keyboard_listener,

    daemon=True

)

keyboard_thread.start()


# ============================================================
# 12. DOWNLOAD DATA
# ============================================================

for year in range(

    START_YEAR,

    END_YEAR + 1

):

    for month in range(

        1,

        13

    ):

        if not wait_for_resume():

            print()

            print(
                "Download stopped safely."
            )

            sys.exit(0)


        # ----------------------------------------
        # NUMBER OF DAYS
        # ----------------------------------------

        days = pd.Period(

            f"{year}-{month:02d}"

        ).days_in_month


        start_date = (

            f"{year}-"
            f"{month:02d}-01"

        )


        end_date = (

            f"{year}-"
            f"{month:02d}-"
            f"{days:02d}"

        )


        print()

        print(
            "=" * 70
        )

        print(

            f"YEAR {year} | "
            f"MONTH {month:02d}"

        )

        print(
            "=" * 70
        )


        # ----------------------------------------
        # STATE CHUNKS
        # ----------------------------------------

        for chunk_number, chunk in enumerate(

            chunks,

            start=1

        ):

            if not wait_for_resume():

                print()

                print(
                    "Download stopped safely."
                )

                sys.exit(0)


            # ------------------------------------
            # STATE NAMES
            # ------------------------------------

            first_state = chunk[0][0]

            last_state = chunk[-1][0]


            safe_first = (

                first_state
                .replace(" ", "_")
                .replace("/", "_")
                .replace(",", "")

            )


            safe_last = (

                last_state
                .replace(" ", "_")
                .replace("/", "_")
                .replace(",", "")

            )


            output_file = (

                RAW_DIR

                /

                f"{year}_"
                f"{month:02d}_"
                f"{safe_first}_to_"
                f"{safe_last}.csv"

            )


            # ------------------------------------
            # SKIP EXISTING FILE
            # ------------------------------------

            if output_file.exists():

                print(

                    f"  [{chunk_number}/"
                    f"{len(chunks)}] "
                    f"Already exists."

                )

                continue


            print()

            print(

                f"  [{chunk_number}/"
                f"{len(chunks)}] "

                f"{first_state} -> "
                f"{last_state}"

            )


            # ------------------------------------
            # QUIT CHECK
            # ------------------------------------

            if quit_requested.is_set():

                print()

                print(
                    "Quit requested."
                )

                print(
                    "Stopping safely."
                )

                sys.exit(0)


            # ------------------------------------
            # COORDINATES
            # ------------------------------------

            latitudes = [

                str(item[1][0])

                for item in chunk

            ]


            longitudes = [

                str(item[1][1])

                for item in chunk

            ]


            # ------------------------------------
            # API PARAMETERS
            # ------------------------------------

            params = {

                "latitude":
                    ",".join(
                        latitudes
                    ),

                "longitude":
                    ",".join(
                        longitudes
                    ),

                "start_date":
                    start_date,

                "end_date":
                    end_date,

                "daily":
                    ",".join(
                        VARIABLES
                    ),

                "timezone":
                    "Asia/Kolkata",

                "models":
                    "era5",

                "temperature_unit":
                    "celsius",

                "wind_speed_unit":
                    "kmh",

                "precipitation_unit":
                    "mm"

            }


            # ------------------------------------
            # DOWNLOAD
            # ------------------------------------

            data = get_data(
                params
            )


            if data is None:

                if quit_requested.is_set():

                    print()

                    print(
                        "Download stopped safely."
                    )

                    sys.exit(0)

                print()

                print(
                    "  Chunk failed."
                )

                continue


            # ------------------------------------
            # MULTIPLE LOCATIONS
            # ------------------------------------

            if isinstance(
                data,
                list
            ):

                locations = data

            else:

                locations = [
                    data
                ]


            rows = []


            # ------------------------------------
            # PROCESS LOCATIONS
            # ------------------------------------

            for i, location in enumerate(

                locations

            ):

                if (
                    "daily"
                    not in location
                ):

                    print(

                        f"    No daily data "
                        f"for location {i}"

                    )

                    continue


                state = chunk[i][0]

                lat = chunk[i][1][0]

                lon = chunk[i][1][1]

                region = chunk[i][1][2]


                daily = pd.DataFrame(

                    location["daily"]

                )


                daily["State_UT"] = state

                daily["Latitude"] = lat

                daily["Longitude"] = lon

                daily["Region"] = region


                rows.append(
                    daily
                )


            # ------------------------------------
            # SAVE CHUNK
            # ------------------------------------

            if rows:

                result = pd.concat(

                    rows,

                    ignore_index=True

                )


                result.to_csv(

                    output_file,

                    index=False

                )


                print()

                print(

                    f"  SAVED "
                    f"{len(result):,} rows"

                )

            else:

                print()

                print(
                    "  No data returned."
                )


            # ------------------------------------
            # WAIT BEFORE NEXT REQUEST
            # ------------------------------------

            print()

            print(
                "  Waiting 10 seconds..."
            )


            if not safe_sleep(10):

                print()

                print(
                    "Download stopped safely."
                )

                sys.exit(0)


# ============================================================
# 13. COMBINE RAW FILES
# ============================================================

print()

print(
    "=" * 70
)

print(
    "COMBINING DOWNLOADED FILES"
)

print(
    "=" * 70
)


files = sorted(

    RAW_DIR.glob(
        "*.csv"
    )

)


print()

print(
    f"Raw files found: "
    f"{len(files)}"
)


if not files:

    raise RuntimeError(
        "No downloaded files found."
    )


frames = []


for file in files:

    try:

        temp = pd.read_csv(
            file
        )

        frames.append(
            temp
        )

    except Exception as e:

        print()

        print(
            f"Could not read "
            f"{file}: {e}"
        )


if not frames:

    raise RuntimeError(
        "Could not load downloaded files."
    )


df = pd.concat(

    frames,

    ignore_index=True

)


# ============================================================
# 14. RENAME VARIABLES
# ============================================================

df = df.rename(

    columns={

        "time":
            "Date",

        "temperature_2m_mean":
            "Avg_Temp_C",

        "temperature_2m_max":
            "Max_Temp_C",

        "temperature_2m_min":
            "Min_Temp_C",

        "relative_humidity_2m_mean":
            "RH_Avg_pct",

        "dew_point_2m_mean":
            "Dew_Point_C",

        "precipitation_sum":
            "Rainfall_mm",

        "wind_speed_10m_mean":
            "Wind_Speed_kmh",

        "wind_direction_10m_dominant":
            "Wind_Direction_deg",

        "pressure_msl_mean":
            "Pressure_hPa"

    }

)


# ============================================================
# 15. DATE FEATURES
# ============================================================

df["Date"] = pd.to_datetime(

    df["Date"]

)


df["Year"] = (

    df["Date"].dt.year

)


df["Month"] = (

    df["Date"].dt.month

)


df["Day"] = (

    df["Date"].dt.day

)


# ============================================================
# 16. WET BULB TEMPERATURE
# ============================================================

T = (

    df["Max_Temp_C"]
    .astype(float)

)


RH = (

    df["RH_Avg_pct"]
    .astype(float)

)


df["Wet_Bulb_C"] = (

    T

    *

    np.arctan(

        0.151977 *

        np.sqrt(
            RH + 8.313659
        )

    )

    +

    np.arctan(
        T + RH
    )

    -

    np.arctan(
        RH - 1.676331
    )

    +

    0.00391838

    *

    RH ** 1.5

    *

    np.arctan(
        0.023101 * RH
    )

    -

    4.686035

)


# ============================================================
# 17. HEAT INDEX
# ============================================================

df["Heat_Index_C"] = (

    -8.784

    + 1.611 * T

    + 2.339 * RH

    - 0.146 * T * RH

    - 0.0123 * T**2

    - 0.0164 * RH**2

    + 0.00221 * T**2 * RH

    + 0.000725 * T * RH**2

    - 0.00000358 *
      T**2 *
      RH**2

)


# ============================================================
# 18. WBGT APPROXIMATION
# ============================================================

df["WBGT_C"] = (

    0.567 * T

    +

    0.393 *
    df["Wet_Bulb_C"]

    +

    3.94

)


# ============================================================
# 19. TEMPERATURE CLIMATOLOGY
# ============================================================

climatology = (

    df

    .groupby(
        [
            "State_UT",
            "Month"
        ]
    )

    ["Max_Temp_C"]

    .mean()

    .reset_index()

    .rename(

        columns={

            "Max_Temp_C":
                "Climatological_Max_Temp_C"

        }

    )

)


df = df.merge(

    climatology,

    on=[
        "State_UT",
        "Month"
    ],

    how="left"

)


df["Temp_Anomaly_C"] = (

    df["Max_Temp_C"]

    -

    df[
        "Climatological_Max_Temp_C"
    ]

)


# ============================================================
# 20. PROTOTYPE HEATWAVE FLAG
# ============================================================

df["Heatwave_Flag"] = (

    (

        df["Max_Temp_C"]
        >= 40

    )

    &

    (

        df["Temp_Anomaly_C"]
        >= 4

    )

).astype(int)


# ============================================================
# 21. EXTREME HEAT
# ============================================================

df["Extreme_Heat_Flag"] = (

    (

        df["Max_Temp_C"]
        >= 45

    )

    |

    (

        df["Wet_Bulb_C"]
        >= 31

    )

    |

    (

        df["WBGT_C"]
        >= 35

    )

).astype(int)


# ============================================================
# 22. HEAT RISK SCORE
# ============================================================

temp_component = np.clip(

    (

        df["Max_Temp_C"]
        - 30

    ) / 15,

    0,

    1

)


humidity_component = np.clip(

    (

        df["RH_Avg_pct"]
        - 40

    ) / 60,

    0,

    1

)


wetbulb_component = np.clip(

    (

        df["Wet_Bulb_C"]
        - 20

    ) / 12,

    0,

    1

)


anomaly_component = np.clip(

    (

        df["Temp_Anomaly_C"]
        + 1

    ) / 6,

    0,

    1

)


df["Heat_Risk_Score"] = (

    0.35 *
    temp_component

    +

    0.25 *
    humidity_component

    +

    0.25 *
    wetbulb_component

    +

    0.15 *
    anomaly_component

) * 100


df["Heat_Risk_Score"] = (

    df["Heat_Risk_Score"]

    .clip(
        0,
        100
    )

    .round(1)

)


# ============================================================
# 23. HEAT RISK LEVEL
# ============================================================

df["Heat_Risk_Level"] = pd.cut(

    df["Heat_Risk_Score"],

    bins=[
        -1,
        20,
        40,
        60,
        80,
        100
    ],

    labels=[
        "Low",
        "Moderate",
        "High",
        "Very High",
        "Extreme"
    ]

)


# ============================================================
# 24. METADATA
# ============================================================

df["Data_Source"] = (

    "ERA5 via Open-Meteo "
    "Historical Weather API"

)


df["Data_Quality"] = (

    "Reanalysis"

)


df["Spatial_Representation"] = (

    "State/UT representative coordinate"

)


# ============================================================
# 25. REMOVE DUPLICATES
# ============================================================

df = df.drop_duplicates(

    subset=[
        "State_UT",
        "Date"
    ]

)


df = df.sort_values(

    [
        "State_UT",
        "Date"
    ]

)


# ============================================================
# 26. SAVE DAILY DATA
# ============================================================

df.to_csv(

    FINAL_DAILY,

    index=False

)


# ============================================================
# 27. CREATE MONTHLY DATASET
# ============================================================

monthly = (

    df

    .groupby(

        [
            "State_UT",
            "Year",
            "Month"
        ]

    )

    .agg({

        "Latitude":
            "first",

        "Longitude":
            "first",

        "Region":
            "first",

        "Avg_Temp_C":
            "mean",

        "Max_Temp_C":
            "max",

        "Min_Temp_C":
            "min",

        "Temp_Anomaly_C":
            "mean",

        "RH_Avg_pct":
            "mean",

        "Dew_Point_C":
            "mean",

        "Rainfall_mm":
            "sum",

        "Wind_Speed_kmh":
            "mean",

        "Wind_Direction_deg":
            "mean",

        "Pressure_hPa":
            "mean",

        "Heat_Index_C":
            "mean",

        "Wet_Bulb_C":
            "mean",

        "WBGT_C":
            "mean",

        "Heatwave_Flag":
            "sum",

        "Extreme_Heat_Flag":
            "sum",

        "Heat_Risk_Score":
            "mean"

    })

    .reset_index()

)


# ============================================================
# 28. RENAME MONTHLY VARIABLES
# ============================================================

monthly = monthly.rename(

    columns={

        "Heatwave_Flag":
            "Heatwave_Days",

        "Extreme_Heat_Flag":
            "Extreme_Heat_Days"

    }

)


# ============================================================
# 29. HEATWAVE TARGET
# ============================================================

monthly["Heatwave_Observed"] = (

    monthly["Heatwave_Days"]

    >=

    3

).astype(int)


# ============================================================
# 30. MONTHLY METADATA
# ============================================================

monthly["Data_Source"] = (

    "ERA5 via Open-Meteo "
    "Historical Weather API"

)


monthly["Data_Quality"] = (

    "Reanalysis"

)


monthly["Spatial_Representation"] = (

    "State/UT representative coordinate"

)


# ============================================================
# 31. SORT MONTHLY DATA
# ============================================================

monthly = monthly.sort_values(

    [
        "State_UT",
        "Year",
        "Month"
    ]

)


# ============================================================
# 32. SAVE MONTHLY DATA
# ============================================================

monthly.to_csv(

    FINAL_MONTHLY,

    index=False

)


# ============================================================
# 33. FINAL REPORT
# ============================================================

print()

print(
    "=" * 70
)

print(
    "DOWNLOAD + DATASET CREATION COMPLETE"
)

print(
    "=" * 70
)

print()

print(
    f"Daily rows:   "
    f"{len(df):,}"
)

print(
    f"Monthly rows: "
    f"{len(monthly):,}"
)

print(
    f"States/UTs:   "
    f"{monthly['State_UT'].nunique()}"
)

print(
    f"Years:        "
    f"{monthly['Year'].min()}-"
    f"{monthly['Year'].max()}"
)

print()

print(
    "EXPECTED:"
)

print(
    "States/UTs:   36"
)

print(
    "Monthly rows: 6480"
)

print()

print(
    "DAILY FILE:"
)

print(
    FINAL_DAILY
)

print()

print(
    "MONTHLY FILE:"
)

print(
    FINAL_MONTHLY
)

print()

print(
    "Keyboard controls are no longer needed."
)

print(
    "The program has finished."
)
