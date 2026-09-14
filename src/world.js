/* All positions are editable here. Units: pixels; one tile = 32 pixels.
   Props use bottom-center anchors. Collision boxes are kept separate from art. */
(function(root){
'use strict';
const C=root.LuminaCore || require('./core.js');
const VALLEY={
  width:48,height:36,
  houses:[
    {id:'mara-home',x:304,y:824,style:0},
    {id:'inn',x:624,y:848,style:1},
    {id:'workshop',x:288,y:1016,style:2},
    {id:'library',x:648,y:1040,style:0}
  ],
  npcs:[
    {id:'mara',name:'Mara · Guardiana del Alba',x:432,y:852,skin:'sage',route:[[432,852],[472,852]],hint:'Hablar con Mara'},
    {id:'lio',name:'Lío · Explorador',x:720,y:744,skin:'scout',route:[[720,744],[784,744],[784,776],[720,776]],hint:'Hablar con Lío'},
    {id:'ines',name:'Inés · Herbolaria',x:600,y:910,skin:'healer',route:[[600,910]],hint:'Descansar con Inés'},
    {id:'taro',name:'Taro · Cartógrafo',x:1120,y:792,skin:'scout',route:[[1120,792],[1152,792]],hint:'Hablar con Taro'}
  ],
  objects:[
    {id:'sign-start',kind:'sign',x:400,y:960,label:'Leer el camino'},
    {id:'sign-forest',kind:'sign',x:432,y:512,label:'Leer el sendero'},
    {id:'well',kind:'well',x:496,y:1000,label:'Mirar el pozo'},
    {id:'camp',kind:'camp',x:1120,y:704,label:'Descansar junto al fuego'},
    {id:'chest-west',kind:'chest',x:176,y:304,label:'Abrir cofre'},
    {id:'chest-east',kind:'chest',x:1328,y:960,label:'Abrir cofre'},
    {id:'rune-hoja',kind:'rune',element:'hoja',x:1136,y:336,label:'Tocar la runa de Hoja'},
    {id:'rune-agua',kind:'rune',element:'agua',x:1248,y:400,label:'Tocar la runa de Agua'},
    {id:'rune-fuego',kind:'rune',element:'fuego',x:1360,y:336,label:'Tocar la runa de Fuego'},
    {id:'shrine',kind:'shrine',x:1248,y:272,label:'Entrar al santuario'}
  ],
  wild:[
    {id:'wild-brote',species:'brote',x:336,y:432},
    {id:'wild-ascua',species:'ascua',x:672,y:352},
    {id:'wild-nimbo',species:'nimbo',x:1104,y:944}
  ],
  enemies:[
    {id:'slime-a',x:624,y:544},{id:'slime-b',x:1008,y:512},{id:'slime-c',x:1360,y:672}
  ],
  bushes:[
    {id:'bush-a',x:384,y:608},{id:'bush-b',x:416,y:608},{id:'bush-c',x:352,y:608},
    {id:'bush-d',x:144,y:352},{id:'bush-e',x:176,y:352},{id:'bush-f',x:208,y:352},
    {id:'bush-g',x:1312,y:896},{id:'bush-h',x:1344,y:896}
  ]
};
function grid(w,h,v){return Array.from({length:h},()=>Array(w).fill(v));}
function rect(tiles,x,y,w,h,value){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(tiles[j]?.[i]!==undefined)tiles[j][i]=value;}
function valley(state=C.initialState()){
  const tiles=grid(48,36,'grass'); const props=[],solids=[];
  rect(tiles,26,0,3,36,'water');
  rect(tiles,10,4,3,27,'path');rect(tiles,5,26,20,3,'path');
  rect(tiles,11,22,31,3,'path');rect(tiles,36,8,3,17,'path');rect(tiles,18,9,21,3,'path');
  rect(tiles,9,24,10,7,'path');rect(tiles,33,8,11,6,'stone');
  rect(tiles,26,22,3,3,'bridge');
  rect(tiles,3,5,5,4,'water');rect(tiles,4,6,5,3,'water');
  for(const h of VALLEY.houses){props.push({...h,kind:'house'});solids.push({id:h.id,x:h.x-49,y:h.y-48,w:98,h:48});}
  for(const o of VALLEY.objects){props.push({...o});if(o.kind==='shrine')solids.push({id:o.id,x:o.x-62,y:o.y-72,w:124,h:62});else solids.push({id:o.id,x:o.x-11,y:o.y-12,w:22,h:12});}
  for(const b of VALLEY.bushes)if(!state.cut.includes(b.id)){props.push({...b,kind:'bush'});solids.push({id:b.id,x:b.x-12,y:b.y-15,w:24,h:15});}
  const random=C.rng(9246);
  const important=[...VALLEY.houses,...VALLEY.objects,...VALLEY.npcs,...VALLEY.wild,...VALLEY.enemies,...VALLEY.bushes,{x:400,y:880}];
  for(let y=2;y<34;y++)for(let x=2;x<46;x++){
    const px=x*32+16,py=y*32+24;
    const near=important.some(o=>Math.hypot(o.x-px,o.y-py)<(o.style!==undefined?100:65));
    const pathNear=[[-1,0],[0,0],[1,0],[0,-1],[0,1]].some(([dx,dy])=>['path','bridge','stone'].includes(tiles[y+dy]?.[x+dx]));
    if(tiles[y][x]!=='grass'||near||pathNear)continue;
    const chance=(y<20?.39:.18);
    if(random()<chance){const id='tree-'+x+'-'+y;props.push({id,kind:random()>.23?'tree':'pine',x:px,y:py,variant:Math.floor(random()*3)});solids.push({id,x:px-8,y:py-13,w:16,h:13});}
    else if(random()<.08){const id='rock-'+x+'-'+y;props.push({id,kind:'rock',x:px,y:py});solids.push({id,x:px-9,y:py-10,w:18,h:10});}
    else if(random()<.3)props.push({id:'flower-'+x+'-'+y,kind:'flowers',x:px,y:py,variant:Math.floor(random()*3)});
  }
  // Fences are deliberately interrupted where paths enter the village.
  for(const [a,b,y] of [[5,9,23],[15,23,23],[5,9,32],[15,23,32]]){
    for(let x=a;x<=b;x++){props.push({id:'fence-'+x+'-'+y,kind:'fence',x:x*32,y:y*32});solids.push({id:'fence-'+x+'-'+y,x:x*32-16,y:y*32-5,w:32,h:5});}
  }
  return {id:'valley',width:48,height:36,tiles,props,solids,npcs:VALLEY.npcs.map(o=>({...o})),wild:VALLEY.wild.map(o=>({...o})),enemies:VALLEY.enemies.filter(o=>!state.defeated.includes(o.id)).map(o=>({...o}))};
}
function sanctum(state=C.initialState()){
  const tiles=grid(22,18,'wall');rect(tiles,2,2,18,14,'floor');
  for(let y=5;y<13;y++){tiles[y][5]='wall';tiles[y][16]='wall';}
  // Side aisles, central room, a pool and four columns.
  rect(tiles,3,3,3,2,'water');rect(tiles,16,3,3,2,'water');
  const props=[
    {id:'exit',kind:'portal',x:352,y:508,label:'Volver al valle'},
    {id:'altar',kind:'altar',x:352,y:122,label:'Examinar el corazón del valle'},
    {id:'chest-sanctum',kind:'chest',x:576,y:432,label:'Abrir cofre'},
    {id:'inscription',kind:'sign',x:224,y:464,label:'Leer la inscripción'}
  ];
  const solids=[];
  for(const [x,y] of [[256,256],[448,256],[256,384],[448,384]]){
    props.push({id:'column-'+x+'-'+y,kind:'column',x,y});solids.push({id:'column-'+x+'-'+y,x:x-12,y:y-20,w:24,h:20});
  }
  for(const o of props)if(o.kind!=='portal')solids.push({id:o.id,x:o.x-14,y:o.y-15,w:28,h:15});
  return {id:'sanctum',width:22,height:18,tiles,props,solids,npcs:[],wild:state.guardian?[]:[{id:'boss',species:'guardian',x:352,y:206}],enemies:[]};
}
const API={VALLEY,valley,sanctum};
root.LuminaWorld=API;if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
