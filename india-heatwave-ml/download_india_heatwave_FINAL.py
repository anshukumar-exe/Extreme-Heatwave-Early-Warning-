#!/usr/bin/env python3
import os,sys,time,threading
from pathlib import Path
from datetime import date,timedelta
import requests,pandas as pd

START_YEAR,END_YEAR=2011,2025
BASE_URL="https://archive-api.open-meteo.com/v1/archive"
RAW_DIR=Path("data/raw"); RAW_DIR.mkdir(parents=True,exist_ok=True)
VARS=["temperature_2m_mean","temperature_2m_max","temperature_2m_min","relative_humidity_2m_mean","dew_point_2m_mean","precipitation_sum","wind_speed_10m_mean","wind_direction_10m_dominant","pressure_msl_mean"]
LOCATIONS={
"Andhra_Pradesh":(16.5062,80.6480),"Arunachal_Pradesh":(27.0844,93.6053),"Assam":(26.1445,91.7362),"Bihar":(25.5941,85.1376),
"Chhattisgarh":(21.2514,81.6296),"Goa":(15.4909,73.8278),"Gujarat":(23.0225,72.5714),"Haryana":(30.7333,76.7794),
"Himachal_Pradesh":(31.1048,77.1734),"Jharkhand":(23.3441,85.3096),"Karnataka":(12.9716,77.5946),"Kerala":(8.5241,76.9366),
"Madhya_Pradesh":(23.2599,77.4126),"Maharashtra":(19.0760,72.8777),"Manipur":(24.8170,93.9368),"Meghalaya":(25.5788,91.8933),
"Mizoram":(23.7271,92.7176),"Nagaland":(25.6751,94.1086),"Odisha":(20.2961,85.8245),"Punjab":(30.7333,76.7794),
"Rajasthan":(26.9124,75.7873),"Sikkim":(27.3389,88.6065),"Tamil_Nadu":(13.0827,80.2707),"Telangana":(17.3850,78.4867),
"Tripura":(23.8315,91.2868),"Uttar_Pradesh":(26.8467,80.9462),"Uttarakhand":(30.0668,79.0193),"West_Bengal":(22.5726,88.3639),
"Andaman_and_Nicobar_Islands":(11.7401,92.6586),"Chandigarh":(30.7333,76.7794),"Dadra_and_Nagar_Haveli_and_Daman_and_Diu":(20.3974,72.8328),
"Delhi":(28.6139,77.2090),"Jammu_and_Kashmir":(34.0837,74.7973),"Ladakh":(34.1526,77.5771),"Lakshadweep":(10.8505,72.1833),
"Puducherry":(11.9416,79.8083)}
STATES=list(LOCATIONS); GROUPS=[STATES[i:i+6] for i in range(0,36,6)]
paused=False; quit_requested=False

def keyboard():
 global paused,quit_requested
 if os.name=="nt":
  import msvcrt
  while not quit_requested:
   if msvcrt.kbhit():
    k=msvcrt.getwch().lower()
    if k=="p": paused=True; print("\nPAUSED - press R.")
    elif k=="r": paused=False; print("\nRESUMED.")
    elif k=="q": quit_requested=True; print("\nQUIT."); return
   time.sleep(.2)
 else:
  import termios,tty,select
  fd=sys.stdin.fileno(); old=termios.tcgetattr(fd)
  try:
   tty.setcbreak(fd)
   while not quit_requested:
    ready,_,_=select.select([sys.stdin],[],[],.2)
    if ready:
     k=sys.stdin.read(1).lower()
     if k=="p": paused=True; print("\nPAUSED - press R.")
     elif k=="r": paused=False; print("\nRESUMED.")
     elif k=="q": quit_requested=True; print("\nQUIT."); return
  finally: termios.tcsetattr(fd,termios.TCSADRAIN,old)

def wait_pause():
 while paused and not quit_requested: time.sleep(1)

def fname(y,m,g): return RAW_DIR/f"{y:04d}_{m:02d}_{g[0]}_to_{g[-1]}.csv"

def fetch(y,m):
 s=date(y,m,1); e=date(y+1,1,1)-timedelta(days=1) if m==12 else date(y,m+1,1)-timedelta(days=1)
 q={"latitude":",".join(str(LOCATIONS[x][0]) for x in STATES),"longitude":",".join(str(LOCATIONS[x][1]) for x in STATES),
 "start_date":s.isoformat(),"end_date":e.isoformat(),"daily":",".join(VARS),"timezone":"Asia/Kolkata",
 "temperature_unit":"celsius","wind_speed_unit":"ms","precipitation_unit":"mm","cell_selection":"land"}
 try:
  r=requests.get(BASE_URL,params=q,timeout=180)
  if r.status_code==429:
   print("\n429 RATE LIMIT. Stopping safely. Run again later."); return None
  r.raise_for_status(); return r.json()
 except Exception as e: print("\nERROR:",e); return None

def save(data,y,m):
 if not isinstance(data,list): data=[data]
 if len(data)!=36: raise ValueError(f"API returned {len(data)} locations; expected 36.")
 frames={}
 for state,obj in zip(STATES,data):
  d=obj.get("daily")
  if not d: raise ValueError(f"No data for {state}")
  df=pd.DataFrame(d); df.insert(0,"State_UT",state); df.insert(1,"Latitude",LOCATIONS[state][0]); df.insert(2,"Longitude",LOCATIONS[state][1]); frames[state]=df
 for g in GROUPS:
  f=fname(y,m,g)
  if f.exists(): continue
  out=pd.concat([frames[x] for x in g],ignore_index=True); tmp=f.with_suffix(".tmp"); out.to_csv(tmp,index=False); tmp.replace(f)
  print("SAVED",f.name,len(out),"rows")

def main():
 threading.Thread(target=keyboard,daemon=True).start()
 print("="*60); print("FINAL INDIA ERA5 RESUME DOWNLOADER"); print("="*60)
 print("Existing files:",len(list(RAW_DIR.glob("*.csv")))); print("P=Pause R=Resume Q=Quit")
 for y in range(START_YEAR,END_YEAR+1):
  for m in range(1,13):
   if quit_requested:return
   missing=[g for g in GROUPS if not fname(y,m,g).exists()]
   if not missing: continue
   print(f"\n{y}-{m:02d}: {len(missing)}/6 chunks missing")
   wait_pause(); data=fetch(y,m)
   if data is None:return
   save(data,y,m)
   time.sleep(5)
 print("\nALL MONTHS COMPLETE."); print("Raw files:",len(list(RAW_DIR.glob("*.csv"))))

if __name__=="__main__": main()
