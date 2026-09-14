/* Pure game rules. Usable in a browser and in Node tests. */
(function (root) {
'use strict';
const SPECIES = {
  brote: { name:'Brote', element:'hoja', color:'#96c782', hp:46, power:9, move:'Hoja espiral', description:'Un pequeño guardián que guarda semillas luminosas entre sus orejas.' },
  ascua: { name:'Ascua', element:'fuego', color:'#ecac70', hp:42, power:11, move:'Chispa solar', description:'Curioso y veloz. Su cola conserva el calor de la última puesta de sol.' },
  nimbo: { name:'Nimbo', element:'agua', color:'#89c9d5', hp:50, power:8, move:'Pulso de lluvia', description:'Habita cerca del agua y reconoce las voces de quienes cuidan el valle.' },
  guardian: { name:'Guardián de musgo', element:'hoja', color:'#b8ce85', hp:82, power:10, move:'Raíz ancestral', description:'El último custodio del santuario.' }
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=(v,f)=>Number.isFinite(v)?v:f;
function rng(seed=7813) { let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;}; }
function initialState() {
  return {version:1,zone:'valley',x:400,y:880,hearts:6,stamina:100,
    party:['brote'],active:'brote',hp:{brote:46},potions:3,bells:5,
    quest:false,runes:[],gate:false,guardian:false,chests:[],cut:[],defeated:[],xp:0};
}
function sanitize(raw) {
  const s=initialState(); if(!raw || raw.version!==1)return s;
  s.zone=raw.zone==='sanctum'?'sanctum':'valley';
  const bounds=s.zone==='sanctum'?[704,576]:[1536,1152];
  s.x=clamp(finite(raw.x,s.x),40,bounds[0]-40);s.y=clamp(finite(raw.y,s.y),48,bounds[1]-32);
  s.party=[...new Set(['brote',...(Array.isArray(raw.party)?raw.party:[]).filter(v=>['brote','ascua','nimbo'].includes(v))])];
  s.active=s.party.includes(raw.active)?raw.active:'brote';
  s.hp=Object.fromEntries(s.party.map(k=>[k,clamp(finite(raw.hp?.[k],SPECIES[k].hp),1,SPECIES[k].hp)]));
  for(const k of ['hearts','potions','bells','xp'])s[k]=Math.floor(clamp(finite(raw[k],s[k]),k==='hearts'?1:0,k==='hearts'?6:k==='xp'?99999:99));
  for(const k of ['quest','guardian'])s[k]=raw[k]===true;
  s.runes=Array.isArray(raw.runes)?raw.runes.filter(v=>['hoja','agua','fuego'].includes(v)).slice(0,3):[];
  const solved=s.runes.join(',')==='hoja,agua,fuego';
  s.gate=solved && raw.gate===true;
  if(!s.gate && s.zone==='sanctum'){s.zone='valley';s.x=400;s.y=880;}
  s.guardian=s.gate && s.guardian;
  for(const k of ['chests','cut','defeated'])s[k]=Array.isArray(raw[k])?[...new Set(raw[k].filter(v=>typeof v==='string' && /^[a-z0-9-]{1,48}$/.test(v)))].slice(0,300):[];
  return s;
}
function multiplier(a,b){return ({hoja:'agua',agua:'fuego',fuego:'hoja'})[a]===b?1.5:({hoja:'fuego',agua:'hoja',fuego:'agua'})[a]===b?.7:1;}
function damage(attacker,defender,special=false,random=Math.random) {
  const a=SPECIES[attacker],b=SPECIES[defender];
  return Math.max(3,Math.round(a.power*(special?1.25*multiplier(a.element,b.element):1)*(0.9+random()*.2)));
}
function captureChance(hp,max){return clamp(.2+(1-clamp(hp/max,0,1))*.85,.2,.98);}
function runeStep(current,element){
  const order=['hoja','agua','fuego'];
  if(current.length===3)return {runes:current.slice(),solved:true,correct:true};
  const correct=order[current.length]===element;
  const runes=correct?[...current,element]:[];
  return {runes,solved:runes.length===3,correct};
}
function blocked(map,x,y,r=7) {
  if(x-r<32||y-r<32||x+r>=map.width*32-32||y+r>=map.height*32-24)return true;
  for(const dx of [-r,r])for(const dy of [-r,r]){
    const tx=Math.floor((x+dx)/32),ty=Math.floor((y+dy)/32);
    if(map.tiles[ty]?.[tx]==='water'||map.tiles[ty]?.[tx]==='wall')return true;
  }
  return map.solids.some(o=>x+r>o.x && x-r<o.x+o.w && y+r>o.y && y-r<o.y+o.h);
}
function move(map,x,y,dx,dy,r=7) {
  // Substeps prevent tunnelling through thin colliders during a roll or a slow frame.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/5));
  for(let n=0;n<steps;n++){if(!blocked(map,x+dx/steps,y,r))x+=dx/steps;if(!blocked(map,x,y+dy/steps,r))y+=dy/steps;}
  return {x,y};
}
const API={SPECIES,clamp,rng,initialState,sanitize,multiplier,damage,captureChance,runeStep,blocked,move};
root.LuminaCore=API;if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
