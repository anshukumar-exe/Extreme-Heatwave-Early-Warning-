#!/usr/bin/env python3
from pathlib import Path
import pandas as pd
import numpy as np
import sys

BASE=Path(__file__).resolve().parent
RAW=BASE/'data'/'raw'; DATA=BASE/'data'
OUT_DAILY=DATA/'india_heatwave_daily_2011_2025.csv'
OUT_MONTHLY=DATA/'india_heatwave_2011_2025.csv'

STATES=["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"]
COLS=["time","State_UT","temperature_2m_mean","temperature_2m_max","temperature_2m_min","relative_humidity_2m_mean","dew_point_2m_mean","precipitation_sum","wind_speed_10m_mean","wind_direction_10m_dominant","pressure_msl_mean"]

def norm_state(x):
    s=' '.join(str(x).strip().replace('_',' ').split())
    return {"Andaman & Nicobar Islands":"Andaman and Nicobar Islands","Andaman and Nicobar":"Andaman and Nicobar Islands","Jammu & Kashmir":"Jammu and Kashmir","Dadra and Nagar Haveli and Daman & Diu":"Dadra and Nagar Haveli and Daman and Diu"}.get(s,s)

def expected_files():
    groups=[STATES[i:i+6] for i in range(0,36,6)]
    return {f"{y:04d}_{m:02d}_{g[0].replace(' ','_')}_to_{g[-1].replace(' ','_')}.csv" for y in range(2011,2026) for m in range(1,13) for g in groups}

def validate_raw():
    print('='*72); print('STEP 1 — VALIDATING RAW CHUNKS'); print('='*72)
    if not RAW.exists(): print('ERROR: data/raw does not exist.'); sys.exit(1)
    exp=expected_files(); actual={p.name for p in RAW.glob('*.csv')}
    missing=sorted(exp-actual); extra=sorted(actual-exp); bad=[]; empty=[]
    for n in sorted(exp):
        p=RAW/n
        try:
            if p.stat().st_size==0: empty.append(n); continue
            h=pd.read_csv(p,nrows=1)
            for c in COLS:
                if c not in h.columns: bad.append((n,c)); break
        except Exception as e: bad.append((n,str(e)))
    print(f'Expected chunks : {len(exp)}'); print(f'Missing chunks  : {len(missing)}'); print(f'Empty chunks    : {len(empty)}'); print(f'Extra CSV files : {len(extra)}'); print(f'Bad chunks      : {len(bad)}')
    if extra:
        print('Extra files (ignored):'); [print(' ',x) for x in extra[:10]]
    if missing or empty or bad: print('RAW VALIDATION FAILED'); sys.exit(1)
    print('Raw chunk structure: OK')
    return sorted(exp)

def load_raw(files):
    print('\n'+'='*72); print('STEP 2 — MERGING RAW CSVs'); print('='*72)
    frames=[]
    for i,n in enumerate(files,1):
        x=pd.read_csv(RAW/n)[COLS].copy(); frames.append(x)
        if i%120==0 or i==len(files): print(f'Loaded {i}/{len(files)} chunks')
    df=pd.concat(frames,ignore_index=True); print(f'Raw merged rows: {len(df):,}'); return df

def clean(df):
    print('\n'+'='*72); print('STEP 3 — CLEANING + STANDARDIZING'); print('='*72)
    df['State_UT']=df['State_UT'].map(norm_state); df['Date']=pd.to_datetime(df['time'],errors='coerce')
    nums=COLS[2:]
    for c in nums: df[c]=pd.to_numeric(df[c],errors='coerce')
    before=len(df); dup=df.duplicated(['State_UT','Date'],keep='first'); removed=int(dup.sum()); df=df.loc[~dup].copy()
    print(f'Duplicate rows removed: {removed:,}'); print(f'Rows after cleaning    : {len(df):,}')
    if df['Date'].isna().any(): print('ERROR: invalid dates'); sys.exit(1)
    if set(df['State_UT'])-set(STATES) or set(STATES)-set(df['State_UT']): print('ERROR: State/UT mismatch'); print('Unexpected:',sorted(set(df['State_UT'])-set(STATES))); print('Missing:',sorted(set(STATES)-set(df['State_UT']))); sys.exit(1)
    df['Year']=df['Date'].dt.year; df['Month']=df['Date'].dt.month
    miss=df[nums].isna().sum(); print('\nMissing values:'); print(miss)
    if miss.sum(): print('ERROR: missing raw weather values'); sys.exit(1)
    df['Wind_Speed_kmh']=df['wind_speed_10m_mean']*3.6; df['Pressure_msl_hPa']=df['pressure_msl_mean']
    return df

def indicators(df):
    print('\n'+'='*72); print('STEP 4 — CALCULATING HEATWAVE INDICATORS'); print('='*72)
    T=df.temperature_2m_mean.astype(float); Tmax=df.temperature_2m_max.astype(float); RH=df.relative_humidity_2m_mean.astype(float).clip(1,100)
    df['Wet_Bulb_Temp_C']=T*np.arctan(0.151977*np.sqrt(np.maximum(RH+8.313659,0)))+np.arctan(T+RH)-np.arctan(RH-1.676331)+0.00391838*RH**1.5*np.arctan(0.023101*RH)-4.686035
    Tf=T*9/5+32
    hi=-42.379+2.04901523*Tf+10.14333127*RH-0.22475541*Tf*RH-0.00683783*Tf**2-0.05481717*RH**2+0.00122874*Tf**2*RH+0.00085282*Tf*RH**2-0.00000199*Tf**2*RH**2
    df['Heat_Index_C']=np.where(Tf>=80,(hi-32)*5/9,T)
    df['WBGT_C']=0.567*T+0.393*df['Wet_Bulb_Temp_C']+3.94
    df['Temp_Baseline_C']=df.groupby(['State_UT','Month'])['temperature_2m_max'].transform('mean')
    df['Temp_Anomaly_C']=Tmax-df['Temp_Baseline_C']
    df['Heatwave_Flag']=((Tmax>=40)&(df['Temp_Anomaly_C']>=4)).astype(int)
    df['Extreme_Heat_Flag']=((Tmax>=45)|(df['Wet_Bulb_Temp_C']>=31)|(df['WBGT_C']>=35)).astype(int)
    score=np.clip((Tmax-35)*8,0,40)+np.clip((df.Wet_Bulb_Temp_C-24)*4,0,20)+np.clip((df.WBGT_C-28)*4,0,20)+np.clip(df.Temp_Anomaly_C*5,0,20)
    df['Heat_Risk_Score']=np.clip(score,0,100).round(2)
    df['Risk_Category']=pd.cut(df.Heat_Risk_Score,[-np.inf,25,50,75,np.inf],labels=['Low','Moderate','High','Extreme']).astype(str)
    df['Data_Source']='ERA5 via Open-Meteo Historical Weather API'; df['Data_Quality']='Reanalysis'; df['Spatial_Representation']='State/UT representative coordinate'
    return df

def monthly(df):
    print('\n'+'='*72); print('STEP 5 — CREATING MONTHLY ML DATASET'); print('='*72)
    m=df.groupby(['State_UT','Year','Month'],as_index=False).agg(Temperature_Mean_C=('temperature_2m_mean','mean'),Temperature_Max_C=('temperature_2m_max','max'),Temperature_Min_C=('temperature_2m_min','min'),Relative_Humidity_Mean=('relative_humidity_2m_mean','mean'),Dew_Point_Mean_C=('dew_point_2m_mean','mean'),Precipitation_Sum_mm=('precipitation_sum','sum'),Pressure_msl_Mean_hPa=('Pressure_msl_hPa','mean'),Wind_Speed_kmh=('Wind_Speed_kmh','mean'),Wind_Direction_Dominant_deg=('wind_direction_10m_dominant','mean'),Wet_Bulb_Temp_C=('Wet_Bulb_Temp_C','mean'),Heat_Index_C=('Heat_Index_C','mean'),WBGT_C=('WBGT_C','mean'),Temp_Baseline_C=('Temp_Baseline_C','mean'),Temp_Anomaly_C=('Temp_Anomaly_C','mean'),Heatwave_Days=('Heatwave_Flag','sum'),Extreme_Heat_Days=('Extreme_Heat_Flag','sum'),Heat_Risk_Score=('Heat_Risk_Score','mean'))
    m['Risk_Category']=pd.cut(m.Heat_Risk_Score,[-np.inf,25,50,75,np.inf],labels=['Low','Moderate','High','Extreme']).astype(str); m['Data_Source']='ERA5 via Open-Meteo Historical Weather API'; m['Data_Quality']='Reanalysis'; m['Spatial_Representation']='State/UT representative coordinate'; return m

def validate(d,m):
    print('\n'+'='*72); print('STEP 6 — FINAL VALIDATION'); print('='*72)
    print(f'Daily rows      : {len(d):,}'); print('Expected daily  : 197,244'); print(f'Monthly rows    : {len(m):,}'); print('Expected monthly: 6,480'); print(f'States/UTs      : {d.State_UT.nunique()}'); print(f'Years           : {d.Year.min()}-{d.Year.max()}'); print('\nCHECKS:')
    checks=[('daily row count',len(d)==197244),('monthly row count',len(m)==6480),('36 State/UTs',d.State_UT.nunique()==36),('daily uniqueness',not d.duplicated(['State_UT','Date']).any()),('monthly uniqueness',not m.duplicated(['State_UT','Year','Month']).any()),('no missing ML weather values',not d[['temperature_2m_mean','temperature_2m_max','temperature_2m_min','relative_humidity_2m_mean','dew_point_2m_mean','precipitation_sum','Wind_Speed_kmh','Pressure_msl_hPa','Wet_Bulb_Temp_C','Heat_Index_C','WBGT_C']].isna().any().any())]
    for n,ok in checks: print(('PASS ' if ok else 'FAIL ')+n)
    if not all(ok for _,ok in checks): print('\nFINAL VALIDATION FAILED. Do NOT train yet.'); sys.exit(1)
    print('\n'+'='*72); print('PASS ALL CHECKS'); print('='*72); print('Final datasets are ready for ML.')

def main():
    print('='*72); print('INDIA HEATWAVE ML DATASET PREPARATION'); print('EXISTING RAW DATA ONLY — NO DOWNLOAD'); print('='*72)
    files=validate_raw(); d=clean(load_raw(files)); d=indicators(d); m=monthly(d); DATA.mkdir(exist_ok=True); d.to_csv(OUT_DAILY,index=False); m.to_csv(OUT_MONTHLY,index=False); validate(d,m); print('\nOUTPUT FILES:'); print(OUT_DAILY); print(OUT_MONTHLY)

if __name__=='__main__': main()
