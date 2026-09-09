#!/usr/bin/env python3
"""
INDIA HEATWAVE DATA DOWNLOADER - RESUME MODE

ERA5 historical weather via Open-Meteo.

Features:
- Keeps all existing files in data/raw/
- Downloads only missing monthly chunks
- 36 States/UTs, 2011-2025
- 6 locations per API request
- P = Pause, R = Resume, Q = Quit
- Handles HTTP 429 without infinite retry loops
- Network errors are retried once

Run:
    python3 download_india_heatwave_resume.py
"""

import os
import sys
import time
import threading
from pathlib import Path
from datetime import date, timedelta

import requests
import pandas as pd

START_YEAR = 2011
END_YEAR = 2025
GROUP_SIZE = 6

BASE_URL = "https://archive-api.open-meteo.com/v1/archive"

RAW_DIR = Path("data/raw")
RAW_DIR.mkdir(parents=True, exist_ok=True)

DAILY_VARS = [
    "temperature_2m_mean",
    "temperature_2m_max",
    "temperature_2m_min",
    "relative_humidity_2m_mean",
    "dew_point_2m_mean",
    "precipitation_sum",
    "wind_speed_10m_mean",
    "wind_direction_10m_dominant",
    "pressure_msl_mean",
]

# Representative coordinates. These are point locations, NOT state-wide averages.
LOCATIONS = {
    "Andhra_Pradesh": (16.5062, 80.6480),
    "Arunachal_Pradesh": (27.0844, 93.6053),
    "Assam": (26.1445, 91.7362),
    "Bihar": (25.5941, 85.1376),
    "Chhattisgarh": (21.2514, 81.6296),
    "Goa": (15.4909, 73.8278),
    "Gujarat": (23.0225, 72.5714),
    "Haryana": (30.7333, 76.7794),
    "Himachal_Pradesh": (31.1048, 77.1734),
    "Jharkhand": (23.3441, 85.3096),
    "Karnataka": (12.9716, 77.5946),
    "Kerala": (8.5241, 76.9366),
    "Madhya_Pradesh": (23.2599, 77.4126),
    "Maharashtra": (19.0760, 72.8777),
    "Manipur": (24.8170, 93.9368),
    "Meghalaya": (25.5788, 91.8933),
    "Mizoram": (23.7271, 92.7176),
    "Nagaland": (25.6751, 94.1086),
    "Odisha": (20.2961, 85.8245),
    "Punjab": (30.7333, 76.7794),
    "Rajasthan": (26.9124, 75.7873),
    "Sikkim": (27.3389, 88.6065),
    "Tamil_Nadu": (13.0827, 80.2707),
    "Telangana": (17.3850, 78.4867),
    "Tripura": (23.8315, 91.2868),
    "Uttar_Pradesh": (26.8467, 80.9462),
    "Uttarakhand": (30.0668, 79.0193),
    "West_Bengal": (22.5726, 88.3639),
    "Andaman_and_Nicobar_Islands": (11.7401, 92.6586),
    "Chandigarh": (30.7333, 76.7794),
    "Dadra_and_Nagar_Haveli_and_Daman_and_Diu": (20.3974, 72.8328),
    "Delhi": (28.6139, 77.2090),
    "Jammu_and_Kashmir": (34.0837, 74.7973),
    "Ladakh": (34.1526, 77.5771),
    "Lakshadweep": (10.8505, 72.1833),
    "Puducherry": (11.9416, 79.8083),
}

STATE_NAMES = list(LOCATIONS.keys())

paused = False
quit_requested = False


def keyboard_listener():
    global paused, quit_requested

    if os.name == "nt":
        import msvcrt
        while not quit_requested:
            if msvcrt.kbhit():
                key = msvcrt.getwch().lower()
                if key == "p":
                    paused = True
                    print("\nPAUSED - press R to resume.")
                elif key == "r":
                    paused = False
                    print("\nRESUMED.")
                elif key == "q":
                    quit_requested = True
                    print("\nQUIT REQUESTED.")
                    return
            time.sleep(0.2)

    else:
        import termios
        import tty
        import select

        fd = sys.stdin.fileno()
        old = termios.tcgetattr(fd)

        try:
            tty.setcbreak(fd)
            while not quit_requested:
                ready, _, _ = select.select([sys.stdin], [], [], 0.2)
                if ready:
                    key = sys.stdin.read(1).lower()

                    if key == "p":
                        paused = True
                        print("\nPAUSED - press R to resume.")

                    elif key == "r":
                        paused = False
                        print("\nRESUMED.")

                    elif key == "q":
                        quit_requested = True
                        print("\nQUIT REQUESTED.")
                        return
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old)


def start_keyboard_listener():
    threading.Thread(target=keyboard_listener, daemon=True).start()


def wait_if_paused():
    while paused and not quit_requested:
        time.sleep(1)


def safe_sleep(seconds):
    end = time.time() + seconds

    while time.time() < end:
        if quit_requested:
            return False

        wait_if_paused()
        time.sleep(min(1, max(0, end - time.time())))

    return True


def chunk_filename(year, month, group):
    return RAW_DIR / (
        f"{year:04d}_{month:02d}_"
        f"{group[0]}_to_{group[-1]}.csv"
    )


def build_params(group, start_date, end_date):
    return {
        "latitude": ",".join(str(LOCATIONS[s][0]) for s in group),
        "longitude": ",".join(str(LOCATIONS[s][1]) for s in group),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily": ",".join(DAILY_VARS),
        "timezone": "Asia/Kolkata",
        "temperature_unit": "celsius",
        "wind_speed_unit": "ms",
        "precipitation_unit": "mm",
        "cell_selection": "land",
    }


def fetch_group(group, start_date, end_date):
    params = build_params(group, start_date, end_date)

    for attempt in range(1, 3):

        if quit_requested:
            return None

        wait_if_paused()

        try:
            response = requests.get(
                BASE_URL,
                params=params,
                timeout=120
            )

            if response.status_code == 200:
                return response.json()

            if response.status_code == 429:

                if attempt == 1:
                    print("\n429 TOO MANY REQUESTS")
                    print("Open-Meteo rate limit is active.")
                    print("Waiting 65 minutes before ONE retry...")
                    print("You can press Q to stop safely.")
                    if not safe_sleep(65 * 60):
                        return None
                    continue

                print("\n429 STILL ACTIVE.")
                print("Stopping cleanly. Run the script later to resume.")
                return None

            print(
                f"\nHTTP {response.status_code}: "
                f"{response.text[:500]}"
            )
            return None

        except requests.RequestException as exc:

            print(f"\nNETWORK ERROR: {exc}")

            if attempt == 1:
                print("Waiting 30 seconds and retrying once...")
                if not safe_sleep(30):
                    return None
            else:
                print("Network retry failed.")
                return None

    return None


def save_response(data, group, path):

    if not isinstance(data, list):
        data = [data]

    if len(data) != len(group):
        raise ValueError(
            f"API returned {len(data)} locations; "
            f"expected {len(group)}."
        )

    frames = []

    for state, obj in zip(group, data):

        daily = obj.get("daily")

        if not daily:
            raise ValueError(
                f"No daily data returned for {state}"
            )

        df = pd.DataFrame(daily)

        df.insert(0, "State_UT", state)
        df.insert(1, "Latitude", LOCATIONS[state][0])
        df.insert(2, "Longitude", LOCATIONS[state][1])

        frames.append(df)

    result = pd.concat(frames, ignore_index=True)

    # Write to a temporary file first so an interrupted write
    # does not look like a completed chunk.
    temp_path = path.with_suffix(".tmp")

    result.to_csv(temp_path, index=False)
    temp_path.replace(path)

    return len(result)


def main():

    start_keyboard_listener()

    groups = [
        STATE_NAMES[i:i + GROUP_SIZE]
        for i in range(0, len(STATE_NAMES), GROUP_SIZE)
    ]

    expected = (
        len(groups)
        * (END_YEAR - START_YEAR + 1)
        * 12
    )

    existing = len(list(RAW_DIR.glob("*.csv")))

    print("=" * 72)
    print("INDIA HEATWAVE DATA DOWNLOADER - RESUME MODE")
    print("=" * 72)
    print(f"States/UTs       : {len(STATE_NAMES)}")
    print(f"Groups/request   : {GROUP_SIZE}")
    print(f"Years            : {START_YEAR}-{END_YEAR}")
    print(f"Expected chunks  : {expected}")
    print(f"Existing CSVs    : {existing}")
    print()
    print("P = Pause | R = Resume | Q = Quit")
    print()

    for year in range(START_YEAR, END_YEAR + 1):

        for month in range(1, 13):

            if quit_requested:
                print("\nStopped safely.")
                return

            start_date = date(year, month, 1)

            if month == 12:
                end_date = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(
                    year, month + 1, 1
                ) - timedelta(days=1)

            print(f"\nYEAR {year} | MONTH {month:02d}")
            print("=" * 72)

            for i, group in enumerate(groups, start=1):

                if quit_requested:
                    print("\nStopped safely.")
                    return

                path = chunk_filename(year, month, group)

                if path.exists():
                    print(
                        f"[{i}/{len(groups)}] Already exists."
                    )
                    continue

                print(
                    f"\n[{i}/{len(groups)}] "
                    f"{group[0]} -> {group[-1]}"
                )

                wait_if_paused()

                if quit_requested:
                    return

                data = fetch_group(
                    group,
                    start_date,
                    end_date
                )

                if data is None:
                    print("\nDOWNLOAD STOPPED.")
                    print(
                        "Existing chunks are untouched. "
                        "Run this script again later."
                    )
                    return

                try:
                    rows = save_response(
                        data,
                        group,
                        path
                    )

                    print(
                        f"SAVED {rows} rows -> "
                        f"{path.name}"
                    )

                except Exception as exc:
                    print(
                        f"ERROR saving {path.name}: {exc}"
                    )

                    if path.exists():
                        path.unlink()

                    return

                # Avoid burst traffic.
                if not safe_sleep(3):
                    return

    print("\n" + "=" * 72)
    print("DOWNLOAD STAGE COMPLETE")
    print("=" * 72)
    print(
        f"Raw CSV files: "
        f"{len(list(RAW_DIR.glob('*.csv')))}"
    )
    print(
        "Next: validate the complete dataset before "
        "merging/ML training."
    )


if __name__ == "__main__":
    main()
