/* Original pixel artwork for Lúmina.
   All textures are rendered once, at native resolution. No remote art assets.
   Open the in-game atlas to export these textures as PNG. */
(function(root){
'use strict';
const images={};
function canvas(w,h){const el=document.createElement('canvas');el.width=w;el.height=h;return el;}
function art(key,w,h,paint){const el=canvas(w,h),c=el.getContext('2d');c.imageSmoothingEnabled=false;paint(c);images[key]=el;return el;}
function box(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
const R=(c,x,y,w,h,v)=>box(c,x,y,w,h,v);
function tiles(){
  for(let k=0;k<4;k++){
    art('grass-'+k,32,32,c=>{
      R(c,0,0,32,32,['#709658','#759b5b','#71995a','#6e9456'][k]);
      const rand=root.LuminaCore.rng(90+k);
      for(let n=0;n<19;n++){let x=Math.floor(rand()*31),y=Math.floor(rand()*31);R(c,x,y,2,1,n%2?'#86aa65':'#628a50');if(n%4===0)R(c,x+1,y-2,1,3,'#81a361');}
    });
    art('water-'+k,32,32,c=>{
      R(c,0,0,32,32,'#457f89');R(c,0,8,32,7,'#4b8790');R(c,0,24,32,4,'#49848d');
      for(let n=0;n<5;n++){let x=(n*13+k*3)%30,y=(n*9+k)%30;R(c,x,y,7,1,'#77b1ae');R(c,x+2,y+1,4,1,'#609e9f');}
    });
  }
  art('path',32,32,c=>{R(c,0,0,32,32,'#c5b785');R(c,0,0,32,2,'#cdbf8d');for(let n=0;n<10;n++){let x=(n*17)%31,y=(n*11)%31;R(c,x,y,3,1,n%2?'#d6c794':'#b2a778');}});
  art('stone',32,32,c=>{R(c,0,0,32,32,'#8c9a7b');for(const [x,y,w] of [[1,1,15],[18,1,13],[1,17,9],[12,17,19]]){R(c,x,y,w,13,'#a5ad8c');R(c,x,y,w,2,'#b6bb9c');R(c,x,y+12,w,1,'#74876b');}});
  art('floor',32,32,c=>{R(c,0,0,32,32,'#3d5350');R(c,1,1,30,29,'#526660');R(c,2,2,28,1,'#64746c');R(c,3,27,23,2,'#435c53');R(c,26,8,2,5,'#687a65');});
  art('wall',32,32,c=>{R(c,0,0,32,32,'#1c3537');R(c,0,0,32,8,'#718176');R(c,1,9,14,9,'#3d5754');R(c,17,9,14,9,'#3b5552');R(c,1,20,8,10,'#314d4c');R(c,11,20,20,10,'#38514e');R(c,0,7,32,2,'#91a086');});
  art('bridge',32,32,c=>{R(c,0,0,32,32,'#4c5140');for(let y=1;y<32;y+=8){R(c,0,y,32,6,'#a98f5e');R(c,0,y,32,1,'#d3b079');R(c,5,y+3,16,1,'#8c754e');R(c,2,y+2,1,1,'#566456');R(c,29,y+2,1,1,'#566456');}});
}
function vegetation(){
  for(let v=0;v<3;v++)art('tree-'+v,72,88,c=>{
    oval(c,37,81,26,6,'#233e373a');
    R(c,32,50,11,31,'#655d40');R(c,34,53,4,27,'#8a7950');R(c,31,75,15,6,'#655d40');
    const greens=[['#294f44','#3d7151','#578b57','#76a564'],['#325845','#477954','#659456','#88af68'],['#285a4a','#3b7b57','#52985d','#78ad70']][v];
    poly(c,[[31,0],[47,3],[52,13],[64,19],[65,31],[71,41],[65,53],[57,57],[61,65],[40,71],[20,67],[8,58],[0,45],[6,29],[17,18],[19,8]],greens[0]);
    poly(c,[[29,4],[43,6],[50,18],[62,21],[62,34],[67,43],[56,55],[43,59],[40,65],[23,60],[10,51],[5,42],[12,29],[23,23],[22,12]],greens[1]);
    poly(c,[[28,8],[40,9],[43,19],[53,21],[57,32],[46,38],[41,48],[25,50],[15,43],[17,31],[27,25]],greens[2]);
    for(const [x,y,w] of [[29,12,9],[24,19,7],[40,24,10],[21,33,10],[15,44,6],[36,43,8],[49,47,7],[28,56,6]]){R(c,x,y,w,3,greens[3]);R(c,x+2,y-2,w-4,2,greens[3]);}
    R(c,48,59,8,3,greens[2]);R(c,11,34,5,2,greens[2]);
  });
  art('pine',58,84,c=>{
    oval(c,29,78,21,5,'#233e373a');R(c,25,57,8,22,'#726445');
    for(const [y,w] of [[8,14],[20,23],[35,29]]) {
      poly(c,[[29,y],[29+w,y+34],[39,y+37],[29,y+40],[18,y+36],[29-w,y+34]],'#285448');
      poly(c,[[29,y+2],[29+w-6,y+28],[28,y+31],[29-w+5,y+28]],'#41795a');
      poly(c,[[27,y+7],[27,y+27],[29-w+10,y+26]],'#62915e');
    }
  });
  art('bush',32,30,c=>{oval(c,16,26,14,3,'#294b363a');poly(c,[[2,14],[6,8],[12,9],[16,3],[22,8],[27,7],[31,17],[27,26],[7,26]],'#315e43');R(c,7,12,19,10,'#579152');R(c,11,8,10,5,'#78ad61');R(c,7,16,5,3,'#8cb969');R(c,22,18,3,3,'#dcad84');});
  art('rock',30,25,c=>{oval(c,15,21,14,3,'#294b363a');poly(c,[[2,15],[6,7],[13,3],[22,6],[28,16],[26,22],[5,22]],'#63746b');poly(c,[[6,8],[13,5],[20,8],[24,15],[6,17]],'#98a18a');R(c,10,7,9,2,'#b7b9a0');R(c,17,18,9,3,'#78877a');});
  for(let k=0;k<3;k++)art('flowers-'+k,26,24,c=>{
    for(const [x,y] of [[5,15],[16,10],[21,20]]){R(c,x,y,1,6,'#3e7450');R(c,x-2,y+4,3,1,'#4c8052');R(c,x-2,y-1,5,3,['#e5b4a3','#ead78f','#c6c5da'][k]);R(c,x,y-2,1,5,['#edc4b3','#f4e7b0','#dddaea'][k]);R(c,x,y,1,1,'#f9e8ad');}
  });
}
function house(style){
  art('house-'+style,128,120,c=>{
    const roof=[['#804f46','#aa6650','#c5815e'],['#3e6870','#56828a','#78a1a0'],['#725b71','#987486','#b18c97']][style];
    oval(c,66,114,56,5,'#253f353d');R(c,15,56,98,56,'#6e765a');R(c,19,59,90,49,'#e1d4ad');R(c,19,59,90,8,'#b5b38c');
    R(c,22,60,5,48,'#9b8860');R(c,99,60,5,48,'#9b8860');R(c,20,92,86,4,'#b6a47e');
    R(c,57,79,24,30,'#705f45');R(c,60,81,17,27,'#414e40');R(c,62,83,13,25,'#926f4a');R(c,71,94,2,3,'#e6c17b');R(c,55,108,29,5,'#b8b296');R(c,52,113,35,3,'#93997d');
    for(const x of [31,86]){R(c,x-2,74,17,18,'#8f8661');R(c,x,75,13,14,'#47696b');R(c,x+1,76,10,6,'#91b3a7');R(c,x+6,74,2,17,'#d2bf8e');R(c,x,82,13,2,'#d2bf8e');R(c,x-3,91,19,3,'#827354');R(c,x-2,94,16,5,'#91744f');for(let n=0;n<5;n++){R(c,x+n*3,92-(n%2)*2,3,3,'#57915c');R(c,x+n*3,91-(n%2)*2,2,2,n%2?'#e4b097':'#edd7a4');}}
    R(c,93,15,14,26,'#8d927b');R(c,91,12,18,5,'#b4b097');R(c,96,20,8,2,'#737d69');R(c,99,29,8,2,'#737d69');
    poly(c,[[30,16],[91,16],[126, sixty()],[122,69],[5,69],[1,61]],roof[0]);
    poly(c,[[31,17],[90,17],[120,60],[8,60]],roof[1]);
    for(let row=0;row<5;row++){let y=22+row*8,left=29-row*5,right=94+row*5;R(c,left,y,right-left,2,roof[2]);for(let x=left+6+(row%2)*8;x<right;x+=16){R(c,x,y+2,1,5,roof[0]);R(c,x+1,y+6,10,1,roof[0]);}}
    R(c,7,61,115,4,roof[2]);R(c,10,66,109,3,'#5b5944');
    // Central dormer and carved wooden trim.
    poly(c,[[51,39],[65,26],[79,39],[77,55],[53,55]],'#786849');poly(c,[[49,39],[65,24],[81,39]],roof[0]);R(c,55,40,20,15,'#d6c699');R(c,60,40,10,12,'#547571');R(c,64,40,2,12,'#dec994');R(c,60,46,10,2,'#dec994');
  });
}
function sixty(){return 60;}
function objects(){
  for(let i=0;i<3;i++)house(i);
  art('fence',32,25,c=>{R(c,0,8,32,4,'#b09b70');R(c,0,18,32,3,'#8d8059');for(const x of [3,24]){R(c,x,3,5,22,'#897955');R(c,x,2,4,20,'#c4ae7c');R(c,x,2,4,2,'#dec591');}});
  art('sign',30,34,c=>{R(c,13,17,5,16,'#88704c');R(c,2,2,26,19,'#6b6247');R(c,3,3,24,15,'#b9a577');R(c,5,5,20,1,'#d9c392');R(c,7,9,14,2,'#7b7953');R(c,7,13,9,2,'#7b7953');});
  art('well',56,55,c=>{oval(c,28,50,24,4,'#27433444');R(c,8,31,40,19,'#818b7b');oval(c,28,32,22,10,'#b5b49a');oval(c,28,33,14,5,'#314d4e');R(c,10,12,4,28,'#866f4c');R(c,43,12,4,28,'#866f4c');poly(c,[[28,0],[54,17],[2,17]],'#b0815b');R(c,1,17,54,3,'#745e48');R(c,27,19,1,15,'#c2b185');R(c,25,29,7,6,'#9a8863');R(c,12,41,9,2,'#a4a98f');R(c,29,44,15,2,'#a4a98f');});
  for(let k=0;k<2;k++)art('chest-'+k,32,29,c=>{
    oval(c,16,26,15,3,'#253f3544');R(c,2,7,28,19,'#594c39');R(c,4,k?3:6,24,k?8:12,'#aa7b49');R(c,4,17,24,7,'#916638');R(c,4,k?3:6,24,2,'#d7ad66');R(c,7,6,3,18,'#d9bc79');R(c,23,6,3,18,'#d9bc79');R(c,13,13,6,7,'#e4cd8a');R(c,15,15,2,3,'#7d744f');if(k){R(c,5,12,22,5,'#363b2b');R(c,15,12,3,3,'#eacb7e');}
  });
  for(let n=0;n<4;n++)art('camp-'+n,40,44,c=>{
    for(const [x,y] of [[6,36],[13,40],[24,40],[32,35]]){R(c,x,y,6,3,'#8c9781');R(c,x+1,y-2,4,2,'#b5b59a');}
    poly(c,[[11,37],[24,33],[29,36],[15,41]],'#8a6846');
    poly(c,[[20,7+n*2],[25,19],[29,16],[32,29],[25,36],[15,35],[10,28],[15,20]],'#dd8859');
    poly(c,[[21,17+n],[25,27],[22,34],[16,31]],'#f4ca7f');R(c,19,26,3,6,'#fae8a6');
  });
  const runes=['hoja','agua','fuego'];
  for(const type of runes)for(let on=0;on<2;on++)art('rune-'+type+'-'+on,40,48,c=>{
    oval(c,20,44,18,4,'#26413744');poly(c,[[9,5],[27,3],[32,12],[31,41],[6,41],[6,14]],'#5c766a');poly(c,[[10,7],[25,6],[28,13],[27,38],[9,38]],'#9ba88b');R(c,11,9,13,2,'#b8c09a');R(c,8,39,24,4,'#768874');
    const color=on?{hoja:'#d0efac',agua:'#b7edf1',fuego:'#ffdaa2'}[type]:'#526d5e';
    if(type==='hoja'){poly(c,[[13,25],[15,17],[25,15],[24,24],[18,28]],color);R(c,15,24,2,6,color);}
    if(type==='agua')poly(c,[[20,15],[26,26],[23,29],[16,29],[13,25]],color);
    if(type==='fuego')poly(c,[[20,14],[23,21],[26,19],[27,26],[23,30],[16,30],[13,24],[17,22]],color);
    if(on){R(c,4,14,2,4,color);R(c,32,29,2,3,color);}
  });
  art('shrine',144,144,c=>{
    oval(c,72,137,68,5,'#203e3544');
    R(c,12,125,120,12,'#728677');R(c,20,116,104,11,'#97a08a');R(c,29,41,86,75,'#778e7e');R(c,35,47,74,68,'#9aa68e');
    for(let y=51;y<110;y+=12)for(let x=36+(y%24?0:8);x<107;x+=18){R(c,x,y,15,1,'#b1b89a');R(c,x+16,y+1,1,10,'#758c77');}
    for(const x of [21,108]){R(c,x,39,15,78,'#536f63');R(c,x+2,39,9,78,'#a7b294');R(c,x-3,112,21,8,'#bec0a0');R(c,x-3,38,21,9,'#b4bc99');R(c,x+5,49,2,60,'#7e9580');}
    poly(c,[[10,39],[72,1],[134,39],[130,47],[14,47]],'#4f7163');poly(c,[[23,35],[72,8],[122,35]],'#a5b08f');poly(c,[[37,32],[72,15],[107,32]],'#738c71');
    R(c,48,66,48,50,'#405f53');poly(c,[[48,69],[55,55],[88,55],[96,69]],'#405f53');R(c,55,69,34,47,'#223e3d');R(c,58,67,28,49,'#294d48');
    poly(c,[[72,16],[79,27],[72,37],[65,27]],'#e2d191');
    for(const [x,y] of [[13,47],[18,63],[109,75],[117,90],[26,109],[96,38]]){R(c,x,y,9,5,'#5e8559');R(c,x+3,y+4,8,5,'#719861');}
  });
  art('column',40,75,c=>{R(c,3,65,34,8,'#718575');R(c,9,13,22,52,'#819884');R(c,12,15,6,48,'#adc0a0');R(c,25,16,3,47,'#567365');R(c,4,7,32,9,'#aab799');R(c,7,3,26,5,'#c0c5a4');R(c,7,64,26,3,'#a8b598');R(c,26,35,4,10,'#426153');});
  art('altar',64,64,c=>{oval(c,32,57,29,5,'#1a343c55');R(c,5,49,54,10,'#799184');R(c,10,42,44,9,'#aec1a0');R(c,17,29,30,14,'#587b70');R(c,20,31,24,8,'#7b9c8a');poly(c,[[32,0],[42,17],[32,32],[22,17]],'#bce6c3');poly(c,[[32,1],[32,31],[22,17]],'#75b9b0');R(c,31,6,2,13,'#f2f2c7');});
  art('portal',48,32,c=>{oval(c,24,22,22,8,'#759f8c');oval(c,24,21,17,5,'#b1d2a1');oval(c,24,20,13,3,'#5d9489');R(c,23,12,2,12,'#e7e2ae');});
  art('shadow',30,12,c=>oval(c,15,6,13,4,'#173d3444'));
  art('spark',5,5,c=>{R(c,2,0,1,5,'#f4de9f');R(c,0,2,5,1,'#f4de9f');});
  art('leaf',7,7,c=>poly(c,[[0,4],[2,1],[6,0],[6,4],[3,6]],'#d9d398'));
}
function person(skin,dir,frame){
  const colors={hero:['#456f70','#7badab','#654b43','#ddb58e'],sage:['#6f7093','#aaa3bd','#dbd3ad','#e0bb94'],scout:['#a9784f','#cba377','#644e41','#cd9f78'],healer:['#6d8a61','#b2c18a','#885945','#e8ba92']}[skin];
  return art(skin+'-'+dir+'-'+frame,24,34,c=>{
    let bob=frame%2,step=frame===1?-2:frame===3?2:0;
    R(c,6,28,5,4-step,'#3c4d44');R(c,14,28,5,4+step,'#3c4d44');
    R(c,5,31-step,7,2,'#5a5a44');R(c,13,31+step,7,2,'#5a5a44');
    poly(c,[[6,16+bob],[17,16+bob],[21,28],[17,31],[4,29]],colors[0]);
    R(c,7,18+bob,10,10,colors[1]);R(c,8,27,10,2,'#d6bd87');R(c,12,26,3,3,'#7c7754');
    R(c,4,20+step/2,4,7,colors[0]);R(c,17,20-step/2,4,7,colors[0]);
    R(c,4,26+step/2,3,3,colors[3]);R(c,18,26-step/2,3,3,colors[3]);
    R(c,6,5+bob,13,12,colors[2]);R(c,5,9+bob,15,6,colors[3]);R(c,8,16+bob,8,3,colors[3]);
    if(dir==='up'){
      R(c,6,6+bob,13,11,colors[2]);R(c,9,17+bob,6,3,colors[0]);
      R(c,8,21+bob,8,8,'#997d55');R(c,9,21+bob,6,3,'#c7a679');
    } else {
      R(c,7,6+bob,11,5,colors[2]);R(c,7,10+bob,3,2,colors[2]);
      const eyes=dir==='left'?[7]:dir==='right'?[16]:[9,15];
      for(const x of eyes){R(c,x,12+bob,2,2,'#304846');R(c,x,12+bob,1,1,'#182c2e');}
      R(c,11,16+bob,3,1,'#b78b73');
      if(skin==='sage')R(c,9,16+bob,7,3,'#ddd4b5');
    }
    if(skin==='hero'){
      poly(c,[[5,8+bob],[7,3+bob],[16,2+bob],[20,8+bob]],'#3b6364');R(c,5,7+bob,16,3,'#79a59b');R(c,7,4+bob,9,2,'#66958c');
      R(c,17,0+bob,2,7,'#e7c58b');R(c,19,0+bob,2,3,'#f1d9a2');R(c,2,19,2,11,'#a5b8b0');R(c,1,20,4,2,'#d5c48d');
    }
    if(skin==='scout'){R(c,4,7+bob,17,3,'#b7a173');R(c,7,3+bob,11,5,'#967c54');}
  });
}
function creature(type,frame){
  const guardian=type==='guardian',w=guardian?56:40,h=guardian?60:44;
  return art(type+'-'+frame,w,h,c=>{
    const y=(frame%2),cx=w/2;
    const dark={brote:'#477658',ascua:'#a35e48',nimbo:'#538e9d',guardian:'#536f56'}[type];
    const mid={brote:'#91ba70',ascua:'#e2a56b',nimbo:'#9ccfd0',guardian:'#8ba16e'}[type];
    const light={brote:'#ccda9a',ascua:'#f3ce95',nimbo:'#d6e5d4',guardian:'#c7ce93'}[type];
    if(type==='brote'){
      poly(c,[[9,18+y],[2,8+y],[3,2+y],[13,7+y],[17,17+y]],dark);poly(c,[[25,18+y],[29,4+y],[37,1+y],[36,11+y],[31,21+y]],dark);
      poly(c,[[8,12+y],[5,5+y],[12,9+y],[15,16+y]],'#b9d085');poly(c,[[28,15+y],[32,6+y],[34,5+y],[32,14+y]],'#c2d68d');
    }
    if(type==='ascua'){
      poly(c,[[27,34],[36,35],[39,26],[34,17+y],[33,25],[29,21],[30,30]],'#b97754');poly(c,[[33,31],[36,27],[34,22],[32,29]],'#f4d08b');
      poly(c,[[7,19+y],[5,5+y],[17,13+y]],dark);poly(c,[[23,13+y],[33,5+y],[31,21+y]],dark);
      poly(c,[[9,15+y],[8,9+y],[14,14+y]],'#f2d0a2');poly(c,[[26,14+y],[31,9+y],[30,16+y]],'#f2d0a2');
    }
    if(type==='nimbo'){
      poly(c,[[8,25+y],[1,17+y],[2,11+y],[12,18+y]],dark);poly(c,[[29,26+y],[39,20+y],[38,13+y],[27,19+y]],dark);
      poly(c,[[17,14+y],[19,1+y],[24,9+y],[26,15+y]],'#6cabb4');R(c,20,5+y,2,6,'#bde5d9');
    }
    if(guardian){
      for(const x of [9,37]){R(c,x,21+y,11,27,dark);R(c,x+2,23+y,6,18,mid);R(c,x-2,44,14,8,dark);}
      poly(c,[[13,21+y],[7,11+y],[14,6+y],[19,12+y],[28,1+y],[37,11+y],[46,7+y],[49,15+y],[40,23+y]],'#436f56');
      for(const x of [14,36])poly(c,[[x,16+y],[x-4,6+y],[x+5,10+y]],'#a0b875');
    }
    const by=guardian?23:17,bw=guardian?28:26,bh=guardian?30:22;
    poly(c,[[cx-bw/2+4,by-5+y],[cx+bw/2-4,by-5+y],[cx+bw/2,by+2+y],[cx+bw/2,by+bh-6],[cx+bw/2-5,by+bh],[cx-bw/2+4,by+bh],[cx-bw/2,by+bh-6],[cx-bw/2,by+2+y]],dark);
    poly(c,[[cx-bw/2+5,by-3+y],[cx+bw/2-5,by-3+y],[cx+bw/2-2,by+3+y],[cx+bw/2-3,by+bh-7],[cx+bw/2-7,by+bh-3],[cx-bw/2+5,by+bh-3],[cx-bw/2+2,by+bh-7],[cx-bw/2+2,by+3+y]],mid);
    R(c,cx-7,by+11+y,14,guardian?10:7,light);R(c,cx-9,by+bh-1,7,3,dark);R(c,cx+3,by+bh-1,7,3,dark);
    for(const x of [cx-7,cx+5]){R(c,x,by+4+y,3,4,'#294c46');R(c,x,by+4+y,1,1,'#f3eccb');}
    R(c,cx-1,by+9+y,3,2,dark);
    if(type==='brote')R(c,cx-4,by-2+y,7,3,'#d4dc9d');
    if(type==='guardian')poly(c,[[cx,by+10],[cx+5,by+17],[cx,by+23],[cx-5,by+17]],'#e6d697');
  });
}
function generate(){
  if(Object.keys(images).length)return images;
  tiles();vegetation();objects();
  for(const skin of ['hero','sage','scout','healer'])for(const dir of ['down','left','right','up'])for(let i=0;i<4;i++)person(skin,dir,i);
  for(const type of ['brote','ascua','nimbo','guardian'])for(let i=0;i<4;i++)creature(type,i);
  for(let i=0;i<4;i++)art('slime-'+i,30,25,c=>{const y=i%2*2;oval(c,15,21,13,3,'#263f3644');poly(c,[[2,20],[3,10+y],[9,4+y],[20,4+y],[27,12+y],[28,20],[22,23],[6,23]],'#66748f');R(c,8,8+y,13,10,'#9a9eb5');R(c,8,13+y,3,3,'#344754');R(c,19,13+y,3,3,'#344754');R(c,10,6+y,7,2,'#c1bcc8');});
  return images;
}
function install(scene){generate();for(const [key,value] of Object.entries(images))if(!scene.textures.exists(key))scene.textures.addCanvas(key,value);}
function uri(key){generate();return (images[key]||images['brote-0']).toDataURL('image/png');}
function atlas(){generate();const keys=Object.keys(images),columns=8,size=152,c=canvas(columns*size,Math.ceil(keys.length/columns)*size),ctx=c.getContext('2d');ctx.fillStyle='#192e2c';ctx.fillRect(0,0,c.width,c.height);keys.forEach((key,i)=>{let x=i%columns*size,y=Math.floor(i/columns)*size;ctx.drawImage(images[key],x+8,y+4);ctx.fillStyle='#e6d7ac';ctx.font='10px monospace';ctx.fillText(key,x+8,y+148);});return c;}
root.LuminaArt={generate,install,uri,atlas,images};
})(window);
