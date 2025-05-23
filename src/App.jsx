/* -----------------------------------------------------------
   src/App.jsx  ―  Food-Alias  &  Fixed-Order  Edition
   -----------------------------------------------------------
   5 人を「色 × 食べ物」に匿名化し、凡例も指定順で表示します

      suzuki   🍎 Apple      (red)     A
      kato     🫐 Blueberry  (blue)    B
      shen     🥬 Cabbage    (green)   C
      shiotani 🍊 Dekopon    (orange)  D
      takase   🍆 Eggplant   (purple)  E
   ----------------------------------------------------------- */

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import { gpx as gpxToGeoJSON } from '@tmcw/togeojson';
import './App.css';

/* ---------- 人 ⇄ 線色（マーカー枠色も共通） ---------- */
const COLORS = {
  suzuki  : '#e41a1c',   // red
  kato    : '#377eb8',   // blue
  shen    : '#4daf4a',   // green
  shiotani: '#ff7f00',   // orange
  takase  : '#984ea3',   // purple
  default : '#888',
};
const colorOf = p => COLORS[p] ?? COLORS.default;

/* ---------- 匿名表示名（アイコン付） ---------- */
const DISPLAY = {
  suzuki  : '🍎 Apple',
  kato    : '🫐 Blueberry',
  shen    : '🥬 Cabbage',
  shiotani: '🍊 Dekopon',
  takase  : '🍆 Eggplant',
  default : 'Unknown',
};
const displayOf = p => DISPLAY[p] ?? DISPLAY.default;

/* ---------- 凡例の並び順を固定 ---------- */
const ORDER = ['suzuki','kato','shen','shiotani','takase'];

/* ---------- 写真カテゴリ → バッジ絵文字 ---------- */
const CAT_ICON = {
  '食べ物'            : '🍽️',
  '風景'              : '🏞️',
  '人（知ってる人）'   : '👤',
  '植物'              : '🌱',
  '建物（外景）'       : '🏢',
  '体験・発見'         : '💡',
  'その他'            : '📌',
};

/* ---------- 2025-04-22 ～ 2025-05-13 の全日リスト ---------- */
const START = new Date('2025-04-22');
const END   = new Date('2025-05-13');
const FULL_DAYS = (() => {
  const a=[];
  for(let d=new Date(START); d<=END; d.setDate(d.getDate()+1)){
    a.push(`${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
  }
  return a;
})();

/* =================================================================== */

export default function App(){
  const [photos,setPhotos] = useState([]);
  const [routes,setRoutes] = useState([]);
  const [day,   setDay   ] = useState('');
  const [sel,   setSel   ] = useState(null);
  const [lines, setLines ] = useState([]);

  /* ---------- CSV (path,ts,lat,lng,cat) ---------- */
  useEffect(()=>{
    (async()=>{
      const txt  = await (await fetch('/data/photos.csv')).text();
      const rows = Papa.parse(txt,{delimiter:',',skipEmptyLines:true}).data;
      setPhotos(rows.map(([path,ts,lat,lng,cat])=>{
        const [person,file] = path.split('/');
        return {
          person,file,cat,
          url : `/photos/${person}/${file}`,
          ts,
          mmdd: ts.slice(5,7)+ts.slice(8,10),
          lat:+lat, lng:+lng,
        };
      }));
    })();
  },[]);

  /* ---------- GPX index ---------- */
  useEffect(()=>{
    fetch('/routes/index.json').then(r=>r.json()).then(setRoutes);
  },[]);

  /* ---------- プルダウン日付 ---------- */
  const days=useMemo(()=>FULL_DAYS,[]);
  useEffect(()=>{ if(!day&&days.length) setDay(days[0]); },[days,day]);

  /* ---------- 当日のデータ ---------- */
  const dPhotos = photos.filter(p=>p.mmdd===day);
  const dRoutes = routes.filter(r=>r.mmdd===day);

  /* ---------- GPX → polyline ---------- */
  useEffect(()=>{
    let dead=false;
    (async()=>{
      const arr=[];
      for(const r of dRoutes){
        try{
          const xml=await (await fetch(r.url)).text();
          const gj =gpxToGeoJSON(new DOMParser().parseFromString(xml,'text/xml'));
          gj.features.forEach(f=>{
            if(f.geometry.type==='LineString'){
              arr.push({
                coords: f.geometry.coordinates.map(([lo,la])=>[la,lo]),
                color : colorOf(r.person),
              });
            }
          });
        }catch(e){console.error('GPX',r.file,e);}
      }
      if(!dead) setLines(arr);
    })();
    return()=>{dead=true;};
  },[day]);

  /* ---------- 写真マーカー用アイコン ---------- */
  const iconFor = p => L.divIcon({
    html: `
      <div style="position:relative">
        <img src="${p.url}" style="
             width:42px;height:42px;object-fit:cover;
             border:2px solid ${colorOf(p.person)};
             border-radius:6px;box-shadow:0 0 4px rgba(0,0,0,.4);">
        <span class="badge">${CAT_ICON[p.cat] ?? '❓'}</span>
      </div>`,
    className:'', iconSize:[42,42], iconAnchor:[21,21]
  });

  /* ---------- JSX ---------- */
  return(
    <div className="app" tabIndex={0} onKeyDown={e=>e.key==='Escape'&&setSel(null)}>

      {/* ヘッダー */}
      <header style={{marginLeft:60}}>
        日付:&nbsp;
        <select value={day} onChange={e=>{setDay(e.target.value);setSel(null);}}>
          {days.map(d=><option key={d}>{d}</option>)}
        </select>

        <div className="legend">
          {ORDER.map(id=>(
            <div key={id}>
              <span style={{background:COLORS[id]}}/> {displayOf(id)}
            </div>
          ))}
        </div>
      </header>

      {/* 地図 */}
      <MapContainer center={[35.681,139.767]} zoom={13} style={{height:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

        {lines.map((l,i)=>
          <Polyline key={i} positions={l.coords}
                    pathOptions={{color:l.color,weight:4}}/>
        )}

        {dPhotos.map(p=>
          <Marker key={`${p.person}_${p.mmdd}_${p.file}`}
                  position={[p.lat,p.lng]}
                  icon={iconFor(p)}
                  eventHandlers={{click:()=>setSel(p)}}/>
        )}
      </MapContainer>

      {/* 情報パネル */}
      {sel&&(
        <aside className="info">
          <button onClick={()=>setSel(null)}>×</button>
          <img src={sel.url} alt="preview"/>
          <ul>
            <li><b>person:</b> {displayOf(sel.person)}</li>
            <li><b>datetime:</b> {sel.ts}</li>
            <li><b>lat,lng:</b> {sel.lat},{sel.lng}</li>
            <li><b>category:</b> {sel.cat}</li>
            <li><b>file:</b> {sel.file}</li>
          </ul>
        </aside>
      )}
    </div>
  );
}
