import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import { gpx as gpxToGeoJSON } from '@tmcw/togeojson';
import './App.css';

const palette=['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'];

export default function App(){
  const [photos,setPhotos]=useState([]);
  const [routes,setRoutes]=useState([]);
  const [day,setDay]     =useState('');
  const [sel,setSel]     =useState(null);
  const [personColor]=useState(()=>new Map());

  /* CSV ------------------------------------------------------------ */
  useEffect(()=>{
    (async()=>{
      const txt  =await (await fetch('/data/photos.csv')).text();
      const rows =Papa.parse(txt,{delimiter:',',skipEmptyLines:true}).data;
      setPhotos(rows.map(([path,ts,lat,lng])=>{
        const [person,file]=path.split('/');
        return{person,file,
               url:`/photos/${person}/${file}`,
               ts,mmdd:ts.slice(5,7)+ts.slice(8,10),
               lat:+lat,lng:+lng};
      }));
    })();
  },[]);

  /* GPX index ------------------------------------------------------ */
  useEffect(()=>{fetch('/routes/index.json').then(r=>r.json()).then(setRoutes);},[]);

  /* 色 ------------------------------------------------------------- */
  const colorOf=p=>{
    if(!personColor.has(p)) personColor.set(p,palette[personColor.size%palette.length]);
    return personColor.get(p);
  };

  /* 日付リスト ----------------------------------------------------- */
  const days=useMemo(()=>{
    const s=new Set([...photos.map(p=>p.mmdd),...routes.map(r=>r.mmdd)]);
    return[...s].sort();
  },[photos,routes]);
  useEffect(()=>{if(!day&&days.length)setDay(days[0]);},[days,day]);

  /* 当日データ ----------------------------------------------------- */
  const dPhotos=photos.filter(p=>p.mmdd===day);
  const dRoutes=routes.filter(r=>r.mmdd===day);

  /* GPX → 線 : 依存は day だけ ----------------------------------- */
  const [lines,setLines]=useState([]);
  useEffect(()=>{
    let dead=false;
    (async()=>{
      const arr=[];
      for(const r of dRoutes){
        try{
          const xml=await (await fetch(r.url)).text();
          const gj =gpxToGeoJSON(new DOMParser().parseFromString(xml,'text/xml'));
          gj.features.forEach(f=>{
            if(f.geometry.type==='LineString')
              arr.push({coords:f.geometry.coordinates.map(([lo,la])=>[la,lo]),
                        color:colorOf(r.person)});
          });
        }catch(e){console.error('GPX',r.file,e);}
      }
      if(!dead) setLines(arr);
      console.log('[DRAW] routes on',day,arr.length);
    })();
    return()=>{dead=true;};
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  },[day]);   // ← 配列長は常に 1

  /* 共通アイコン -------------------------------------------------- */
  const mkIcon=url=>L.divIcon({
    html:`<img src="${url}" style="width:42px;height:42px;object-fit:cover;
           border:2px solid #fff;border-radius:6px;box-shadow:0 0 4px rgba(0,0,0,.4);">`,
    className:'',iconSize:[42,42],iconAnchor:[21,21]
  });

  /* JSX ------------------------------------------------------------ */
  return(
    <div className="app" tabIndex={0} onKeyDown={e=>e.key==='Escape'&&setSel(null)}>
      <header>
        <label>日付:
          <select value={day} onChange={e=>{setDay(e.target.value);setSel(null);}}>
            {days.map(d=><option key={d}>{d}</option>)}
          </select>
        </label>
        <div className="legend">
          {Array.from(personColor.entries()).map(([p,c])=>(
            <div key={p}><span style={{background:c}}/> {p}</div>
          ))}
        </div>
      </header>

      <MapContainer center={[35.681,139.767]} zoom={13} style={{height:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

        {lines.map((l,i)=><Polyline key={i} positions={l.coords}
                                    pathOptions={{color:l.color,weight:4}}/>)}

        {dPhotos.map(p=>
          <Marker key={p.file}
                  position={[p.lat,p.lng]}
                  icon={mkIcon(p.url)}
                  /* ← 毎回新オブジェクトで確実に登録 */
                  eventHandlers={{click:()=>{console.log('[CLICK]',p.file);setSel(p);}}}/>
        )}
      </MapContainer>

      {sel&&(
        <aside className="info">
          <button onClick={()=>setSel(null)}>×</button>
          <img src={sel.url} alt="preview"/>
          <ul>
            <li><b>person:</b> {sel.person}</li>
            <li><b>datetime:</b> {sel.ts}</li>
            <li><b>lat,lng:</b> {sel.lat},{sel.lng}</li>
            <li><b>file:</b> {sel.file}</li>
          </ul>
        </aside>
      )}
    </div>
  );
}
