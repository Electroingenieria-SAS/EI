/* Phaser 3 scene: rendering, movement, interactions and real-time sword combat. */
(function(){
'use strict';
const C=window.LuminaCore,W=window.LuminaWorld,Art=window.LuminaArt;
const ui=new window.LuminaUI();
const DIR={down:{x:0,y:1},up:{x:0,y:-1},left:{x:-1,y:0},right:{x:1,y:0}};
class ValleyScene extends Phaser.Scene {
 constructor(){super('Valley');this.started=false;this.state=C.initialState();this.face='down';this.attackAt=-1000;this.rollAt=-1000;this.hurtAt=-1000;this.touch={};this.actionQueue=[];this.frameClock=0;this.lastMap=0;this.lastSave=0;}
 create(){
  Art.install(this);ui.scene=this;
  this.keys=this.input.keyboard.addKeys({up:'UP',down:'DOWN',left:'LEFT',right:'RIGHT',w:'W',a:'A',s:'S',d:'D',run:'SHIFT',interact:'E',attack:'J',roll:'SPACE'});
  this.input.keyboard.addCapture(['UP','DOWN','LEFT','RIGHT','SPACE']);
  this.input.keyboard.on('keydown',e=>{
    if(ui.modal||!this.started||e.repeat)return;
    if(e.code==='KeyE')this.actionQueue.push('interact');
    if(e.code==='KeyJ')this.actionQueue.push('attack');
    if(e.code==='Space')this.actionQueue.push('roll');
  });
  window.addEventListener('blur',()=>{this.clearInput();if(this.started&&!ui.modal)ui.pause();});
  document.querySelectorAll('[data-key]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{
      e.preventDefault();if(ui.modal)return;button.setPointerCapture(e.pointerId);
      const k=button.dataset.key;this.touch[k]=true;if(['interact','attack','roll'].includes(k))this.actionQueue.push(k);
    });
    for(const evt of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(evt,()=>{this.touch[button.dataset.key]=false;});
  });
  this.buildWorld('valley',400,880);this.scale.on('resize',()=>this.resizeCamera());this.resizeCamera();
  document.getElementById('loading').classList.add('hidden');
  window.Lumina={scene:this,ui,core:C,world:W,version:'0.1.0'};
 }
 resizeCamera(){const cam=this.cameras.main;cam.setZoom(Math.max(1,Math.min(2.5,this.scale.width/480)));cam.setBounds(0,0,this.map.width*32,this.map.height*32);}
 clearInput(){this.touch={};this.actionQueue=[];if(this.input?.keyboard)this.input.keyboard.resetKeys();}
 begin(state){
  this.state=C.sanitize(state);this.started=true;this.face='down';this.clearInput();this.buildWorld(this.state.zone,this.state.x,this.state.y);this.cameras.main.fadeIn(500,12,31,32);
 }
 buildWorld(zone,x,y){
  this.children.removeAll(true);
  this.map=zone==='sanctum'?W.sanctum(this.state):W.valley(this.state);
  this.state.zone=zone;
  this.props=[];this.npcs=[];this.wild=[];this.enemies=[];this.waters=[];this.sparks=[];
  this.drawGround();
  for(const p of this.map.props){
    let key=p.kind;
    if(p.kind==='house')key='house-'+p.style;
    if(p.kind==='tree')key='tree-'+p.variant;
    if(p.kind==='flowers')key='flowers-'+p.variant;
    if(p.kind==='rune')key='rune-'+p.element+'-'+(this.state.runes.includes(p.element)?1:0);
    if(p.kind==='chest')key='chest-'+(this.state.chests.includes(p.id)?1:0);
    if(p.kind==='camp')key='camp-0';
    const sprite=this.add.image(p.x,p.y,key).setOrigin(.5,1).setDepth(p.y);
    this.props.push({...p,sprite});
  }
  for(const n of this.map.npcs){
    const shadow=this.add.image(n.x,n.y-1,'shadow').setDepth(n.y-.1);
    const sprite=this.add.image(n.x,n.y,n.skin+'-down-0').setOrigin(.5,1).setDepth(n.y);
    this.npcs.push({...n,sprite,shadow,routeIndex:0,wait:1,face:'down'});
  }
  for(const w of this.map.wild){
    const shadow=this.add.image(w.x,w.y-1,'shadow').setDepth(w.y-.1);
    const sprite=this.add.image(w.x,w.y,w.species+'-0').setOrigin(.5,1).setDepth(w.y);
    const mark=this.add.text(w.x,w.y-(w.species==='guardian'?72:50),'◇',{fontSize:'15px',fontFamily:'Georgia',color:'#f1dfa3',stroke:'#3d6350',strokeThickness:2}).setOrigin(.5).setDepth(w.y+1);
    this.wild.push({...w,sprite,shadow,mark,homeX:w.x,homeY:w.y,cooldown:0});
  }
  for(const e of this.map.enemies){
    const sprite=this.add.image(e.x,e.y,'slime-0').setOrigin(.5,1).setDepth(e.y);
    this.enemies.push({...e,sprite,hp:3,homeX:e.x,homeY:e.y,hitAt:-1000});
  }
  if(C.blocked(this.map,x,y)){
    const origin=zone==='sanctum'?{x:352,y:470}:{x:400,y:880};
    x=origin.x;y=origin.y;
  }
  this.heroShadow=this.add.image(x,y-1,'shadow');
  this.hero=this.add.image(x,y,'hero-down-0').setOrigin(.5,1);
  this.companionShadow=this.add.image(x-24,y+8,'shadow').setAlpha(.65);
  this.companion=this.add.image(x-24,y+8,this.state.active+'-0').setOrigin(.5,1).setScale(.68);
  this.cameras.main.startFollow(this.hero,true,.14,.14);this.resizeCamera();
  this.cameras.main.setBackgroundColor(zone==='sanctum'?'#183238':'#527551');
  if(zone==='sanctum')this.createAtmosphere(true);else this.createAtmosphere(false);
  this.state.x=x;this.state.y=y;this.refreshCompanion();ui.lastHud='';ui.update();
 }
 drawGround(){
  const m=this.map,w=m.width*32,h=m.height*32,bg=document.createElement('canvas');bg.width=w;bg.height=h;const c=bg.getContext('2d');
  c.imageSmoothingEnabled=false;
  for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){
    const type=m.tiles[y][x],key=type==='grass'?'grass-'+((x*7+y*13)%4):type==='water'?'water-0':type;
    c.drawImage(Art.images[key],x*32,y*32);
    if(type==='water'){
      const s=this.add.image(x*32,y*32,'water-0').setOrigin(0).setDepth(-9999);
      this.waters.push({sprite:s,phase:(x+y)%4});
    }
    if(['path','stone'].includes(type)){
      c.fillStyle='#7e9b5d';
      for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(m.tiles[y+dy]?.[x+dx]==='grass'){
        if(dx)c.fillRect(x*32+(dx>0?30:0),y*32,2,32);
        if(dy)c.fillRect(x*32,y*32+(dy>0?30:0),32,2);
      }
    }
    if(type!=='water'&&type!=='bridge'){
      c.fillStyle=type==='floor'?'#89a790':'#c0c599';
      for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(m.tiles[y+dy]?.[x+dx]==='water'){
        if(dx)c.fillRect(x*32+(dx>0?29:0),y*32,3,32);
        if(dy)c.fillRect(x*32,y*32+(dy>0?29:0),32,3);
      }
    }
    if(type==='bridge'&&(m.tiles[y-1]?.[x]!=='bridge'||m.tiles[y+1]?.[x]!=='bridge')){
      const py=y*32+(m.tiles[y-1]?.[x]!=='bridge'?0:28);
      c.fillStyle='#665d43';c.fillRect(x*32,py,32,4);c.fillStyle='#d2b887';c.fillRect(x*32,py,32,1);
    }
  }
  if(this.textures.exists('world-ground'))this.textures.remove('world-ground');
  this.textures.addCanvas('world-ground',bg);this.add.image(0,0,'world-ground').setOrigin(0).setDepth(-10000);
 }
 createAtmosphere(inside){
  const random=C.rng(78);
  for(let i=0;i<(inside?22:28);i++){
    const sprite=this.add.image(random()*this.scale.width,random()*this.scale.height,inside?'spark':'leaf').setScrollFactor(0).setDepth(9000).setAlpha(inside?.3:.28).setScale(inside?.7:.7+random()*.5);
    this.sparks.push({sprite,speed:inside?3:9+random()*8,phase:random()*6});
  }
  if(inside){
    const glow=this.add.graphics().setDepth(-100);
    for(let i=8;i>0;i--){glow.fillStyle(0xdce4a2,.012);glow.fillCircle(352,166,i*19);}
  }
 }
 refreshCompanion(){if(this.companion)this.companion.setTexture(this.state.active+'-0');}
 removeGuardian(){const e=this.wild.find(e=>e.id==='boss');if(e){e.sprite.destroy();e.shadow.destroy();e.mark.destroy();this.wild=this.wild.filter(w=>w!==e);}}
 rest(){
  this.state.hearts=6;this.state.stamina=100;this.state.bells=Math.max(3,this.state.bells);this.state.potions=Math.max(2,this.state.potions);
  for(const id of this.state.party)this.state.hp[id]=C.SPECIES[id].hp;
  if(this.state.zone!=='valley')this.buildWorld('valley',568,936);
  else {this.hero.setPosition(568,936);this.companion.setPosition(544,942);}
  this.hurtAt=this.time.now;ui.audio.play('heal');ui.update();ui.save(false);
 }
 healHere(){
  this.state.hearts=6;this.state.stamina=100;
  for(const id of this.state.party)this.state.hp[id]=C.SPECIES[id].hp;
  this.state.bells=Math.max(3,this.state.bells);this.state.potions=Math.max(2,this.state.potions);
  ui.audio.play('heal');ui.update();ui.save(false);
 }
 target(){
  const hero=this.hero;
  const options=[
    ...this.npcs.map(n=>({type:'npc',item:n,x:n.sprite.x,y:n.sprite.y,label:n.hint})),
    ...this.props.filter(p=>p.label).map(p=>({type:'object',item:p,x:p.x,y:p.y,label:p.label})),
    ...this.wild.filter(w=>this.time.now>=w.cooldown).map(w=>({type:'wild',item:w,x:w.sprite.x,y:w.sprite.y,label:w.species==='guardian'?'Desafiar al guardián':'Encontrar a '+C.SPECIES[w.species].name}))
  ].map(o=>({...o,distance:Math.hypot(o.x-hero.x,o.y-hero.y)})).filter(o=>o.distance<(o.item.kind==='shrine'?62:49)).sort((a,b)=>a.distance-b.distance);
  const chosen=options[0];
  if(chosen&&chosen.item.species==='guardian')chosen.label='Desafiar al guardián';
  return chosen;
 }
 interact(){
  const target=this.target();if(!target)return;
  if(target.type==='npc'){this.talk(target.item);return;}
  if(target.type==='wild'){ui.encounter(target.item);return;}
  const p=target.item,s=this.state;
  if(p.kind==='chest'){
    if(s.chests.includes(p.id)){ui.toast('El cofre ya está abierto.');return;}
    s.chests.push(p.id);s.potions+=2;s.bells+=2;s.xp+=10;p.sprite.setTexture('chest-1');ui.audio.play('chest');ui.toast('Encontraste 2 tónicos y 2 campanas · +10 experiencia');ui.save(false);
  }else if(p.kind==='rune'){
    if(!s.quest){ui.toast('Mara conoce la historia de estas piedras.');return;}
    if(s.party.length<2){ui.toast('Las runas esperan un nuevo vínculo. Conoce a Ascua o Nimbo.');return;}
    if(s.gate){ui.toast('Las tres runas ya están en armonía.');return;}
    const result=C.runeStep(s.runes,p.element);s.runes=result.runes;s.gate=result.solved;
    for(const r of this.props.filter(p=>p.kind==='rune'))r.sprite.setTexture('rune-'+r.element+'-'+(s.runes.includes(r.element)?1:0));
    ui.audio.play(result.correct?'rune':'wrong');this.burst(p.x,p.y-24,result.correct?0xe9dd9c:0xa3aac5);
    ui.toast(result.solved?'El santuario despierta. La entrada está abierta.':result.correct?'Una runa responde · '+s.runes.length+' / 3':'Las piedras se apagan. Recuerda: semilla, lluvia y sol.');
    ui.update();ui.save(false);
  }else if(p.kind==='shrine'){
    if(!s.gate){ui.say('El umbral',['La entrada permanece dormida. Tres símbolos rodean el santuario: una hoja, una gota y una llama.','Una inscripción dice: «Primero nace la semilla. La lluvia la alimenta. El sol despierta su fuerza».'],'sage-down-0');return;}
    this.buildWorld('sanctum',352,470);this.cameras.main.fadeIn(500,12,31,32);ui.save(false);
  }else if(p.kind==='portal'){
    this.buildWorld('valley',1248,308);this.cameras.main.fadeIn(500,12,31,32);ui.save(false);
  }else if(p.kind==='altar'){
    ui.say('El corazón del valle',s.guardian?['El cristal vuelve a latir. Tu vínculo con las criaturas ha devuelto la luz a Auralia.','Primera travesía completada. Gracias por explorar Lúmina.']:['El cristal está dormido. El guardián del salón central debe reconocer tu vínculo primero.'],'guardian-0');
  }else if(p.kind==='camp'){this.healHere();ui.toast('Descansas junto al fuego. Vitalidad e inventario básico recuperados.');}
  else if(p.kind==='well')ui.say('El pozo antiguo',['El agua refleja una pequeña luz verde. Brote se inclina para saludar a su reflejo.','Consejo: Inés y la fogata de la ribera restauran a todo tu equipo.'],'brote-0');
  else{
    const lines=p.id==='sign-start'?['ALDEA DEL ALBA · Norte: Bosque Susurrante. Este: puente y ribera.','Mara te espera junto al sendero principal. Inés cuida a los viajeros al lado de la posada.']:p.id==='inscription'?['Los guardianes de hoja son fuertes frente al agua, pero ceden ante el fuego.','Puedes cambiar de compañero desde tu diario antes del encuentro.']:['BOSQUE SUSURRANTE · Encontrarás a Brote al oeste y a Ascua hacia el norte.','Pulsa J para cortar arbustos. Las sombras se repelen con la espada; las criaturas se conocen con E.'];
    ui.say('Señal del camino',lines,'scout-down-0');
  }
 }
 talk(n){
  const s=this.state;n.wait=3;
  if(n.id==='mara'){
    const lines=!s.quest?['Llegaste justo a tiempo. Soy Mara, guardiana de la Aldea del Alba. Tu compañero Brote ya reconoce la luz que llevas.','El santuario del noreste se ha dormido. Para despertarlo, forma un vínculo con una criatura nueva: Ascua vive en el bosque y Nimbo junto a la ribera.','Acércate a una criatura y pulsa E. En el encuentro, debilítala y haz sonar una campana. Con menos del 30 % de vitalidad, el vínculo es seguro.','Después, despierta las runas: primero la semilla, luego la lluvia y por último el sol. Cruza el puente para llegar al santuario.']:s.guardian?['El valle ha recuperado su luz. Ahora guarda tres historias: la tuya, la de tus compañeros y la del guardián.','Todavía hay cofres ocultos y criaturas por conocer. La aldea siempre tendrá un lugar para ti.']:['Recuerda el orden: semilla, lluvia y sol. Hoja, agua y fuego.','Necesitas un nuevo compañero antes de activar las runas. Inés puede curarte y reponer tus campanas.'];
    ui.say(n.name,lines,n.skin+'-down-0',()=>{s.quest=true;ui.update();ui.save(false);});
  }else if(n.id==='ines')ui.say(n.name,['Déjame cuidar de ustedes. Un buen descanso también forma parte de la aventura.','Restauraré tu vitalidad y la de tus compañeros. También tendrás al menos tres campanas y dos tónicos para continuar.'],n.skin+'-down-0',()=>{this.healHere();ui.toast('Todo tu equipo está recuperado.');});
  else if(n.id==='lio')ui.say(n.name,['He visto sombras en el bosque. Pulsa J para usar la espada y Espacio para rodar cuando se acerquen.','La espada también corta arbustos. Hay un viejo cofre escondido al oeste del bosque.','Las criaturas no son sombras: acércate con calma y pulsa E para conocerlas.'],n.skin+'-down-0');
  else ui.say(n.name,['El puente conduce a las ruinas. Desde aquí, sigue el camino hacia el norte.','Nimbo aparece al sur de esta ribera. Ascua prefiere los claros del bosque occidental.','Abre el mapa con M. El punto dorado marca tu posición.'],n.skin+'-down-0');
 }
 burst(x,y,color=0xf0dca0){
  for(let i=0;i<8;i++){const a=i*Math.PI/4,spark=this.add.rectangle(x,y,3,3,color).setDepth(9990);this.tweens.add({targets:spark,x:x+Math.cos(a)*28,y:y+Math.sin(a)*24,alpha:0,duration:420,onComplete:()=>spark.destroy()});}
 }
 attack(){
  if(this.time.now-this.attackAt<380)return;this.attackAt=this.time.now;ui.audio.play('sword');
  const p=this.hero,d=DIR[this.face],angle=Math.atan2(d.y,d.x),g=this.add.graphics().setDepth(p.y+1);
  g.lineStyle(3,0xf6e1a7,.95);g.beginPath();g.arc(p.x,p.y-13,29,angle-.95,angle+.95,false);g.strokePath();
  this.tweens.add({targets:g,alpha:0,duration:190,onComplete:()=>g.destroy()});
  const inRange=(x,y)=>{let dx=x-p.x,dy=y-p.y,len=Math.hypot(dx,dy);return len<52&&(len<19||(dx*d.x+dy*d.y)/len>-.15);};
  for(const bush of this.props.filter(o=>o.kind==='bush')){
    if(inRange(bush.x,bush.y)){this.state.cut.push(bush.id);this.map.solids=this.map.solids.filter(o=>o.id!==bush.id);bush.sprite.destroy();this.props=this.props.filter(o=>o!==bush);this.burst(bush.x,bush.y-10,0xaaca78);}
  }
  for(const e of [...this.enemies])if(inRange(e.sprite.x,e.sprite.y)){
    e.hp--;e.hitAt=this.time.now;this.burst(e.sprite.x,e.sprite.y-12,0xc3bcd1);e.sprite.setTint(0xffffff);
    const p2=C.move(this.map,e.sprite.x,e.sprite.y,d.x*18,d.y*18);e.sprite.setPosition(p2.x,p2.y);
    if(e.hp<=0){this.state.defeated.push(e.id);this.state.xp+=5;e.sprite.destroy();this.enemies=this.enemies.filter(o=>o!==e);ui.toast('Sombra disipada · +5 experiencia');}
  }
 }
 roll(){
  if(this.state.stamina<27||this.time.now-this.rollAt<650)return;
  this.rollAt=this.time.now;this.rollDirection={...DIR[this.face]};this.state.stamina-=27;ui.audio.play('roll');
 }
 update(time,delta){
  if(!this.hero)return;
  const dt=Math.min(delta,40)/1000,frame=Math.floor(time/150)%4;
  this.frameClock=time;
  for(const w of this.waters)w.sprite.setTexture('water-'+((Math.floor(time/310)+w.phase)%4));
  for(const p of this.props)if(p.kind==='camp')p.sprite.setTexture('camp-'+frame);
  for(const w of this.wild){w.sprite.setTexture(w.species+'-'+frame);w.mark.setAlpha(.65+Math.sin(time/400)*.25);w.mark.y=w.sprite.y-(w.species==='guardian'?72:50)+Math.sin(time/450)*2;}
  for(const s of this.sparks){s.sprite.x+=s.speed*dt;s.sprite.y+=Math.sin(time/1500+s.phase)*dt*7;if(s.sprite.x>this.scale.width+10)s.sprite.x=-10;}
  const gameActive=this.started&&!ui.modal;
  if(gameActive){
    // One queued action per frame, never after a modal has opened.
    const action=this.actionQueue.shift();
    if(action==='interact')this.interact();
    else if(action==='attack')this.attack();
    else if(action==='roll')this.roll();
  }
  if(this.started&&!ui.modal){
    const k=this.keys,t=this.touch;
    let dx=(k.right.isDown||k.d.isDown||t.right?1:0)-(k.left.isDown||k.a.isDown||t.left?1:0);
    let dy=(k.down.isDown||k.s.isDown||t.down?1:0)-(k.up.isDown||k.w.isDown||t.up?1:0);
    const rolling=time-this.rollAt<190,moving=dx!==0||dy!==0;
    if(moving&&!rolling){if(Math.abs(dx)>Math.abs(dy))this.face=dx>0?'right':'left';else this.face=dy>0?'down':'up';}
    let speed=88;
    if(k.run.isDown&&this.state.stamina>0&&moving){speed=136;this.state.stamina=Math.max(0,this.state.stamina-dt*23);}
    else this.state.stamina=Math.min(100,this.state.stamina+dt*20);
    if(rolling){dx=this.rollDirection.x;dy=this.rollDirection.y;speed=240;}
    else if(moving){const length=Math.hypot(dx,dy);dx/=length;dy/=length;}
    const next=C.move(this.map,this.hero.x,this.hero.y,dx*speed*dt,dy*speed*dt);
    this.hero.setPosition(next.x,next.y).setTexture('hero-'+this.face+'-'+(moving||rolling?frame:0));
    this.hero.setAlpha(time-this.hurtAt<850?(Math.floor(time/70)%2?.45:1):1);
    this.hero.setAngle(rolling?Math.sin((time-this.rollAt)/190*Math.PI)*25*(this.face==='left'?-1:1):0);
    this.updateNPCs(dt,frame);this.updateEnemies(dt,frame,time,rolling);this.updateCompanion(dt,frame);
    const target=this.target(),hint=document.getElementById('hint');hint.classList.toggle('hidden',!target);if(target)hint.querySelector('span').textContent=target.label;
    if(time-this.lastSave>7000){this.lastSave=time;ui.save(false);}
  }else {this.hero.setAngle(0);document.getElementById('hint').classList.add('hidden');}
  this.hero.setDepth(this.hero.y);this.heroShadow.setPosition(this.hero.x,this.hero.y-1).setDepth(this.hero.y-.1);
  this.companion.setDepth(this.companion.y);this.companionShadow.setPosition(this.companion.x,this.companion.y-1).setDepth(this.companion.y-.1);
  if(this.started){ui.update();if(time-this.lastMap>180){ui.drawMap(document.getElementById('minimap'));this.lastMap=time;}}
 }
 updateNPCs(dt,frame){
  for(const n of this.npcs){
    if(n.wait>0){n.wait-=dt;n.sprite.setTexture(n.skin+'-'+n.face+'-0');continue;}
    const target=n.route[n.routeIndex],dx=target[0]-n.sprite.x,dy=target[1]-n.sprite.y,len=Math.hypot(dx,dy);
    if(len<2){n.routeIndex=(n.routeIndex+1)%n.route.length;n.wait=1.5;continue;}
    n.face=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
    const next=C.move(this.map,n.sprite.x,n.sprite.y,dx/len*22*dt,dy/len*22*dt,5);
    n.sprite.setPosition(next.x,next.y).setTexture(n.skin+'-'+n.face+'-'+frame).setDepth(next.y);n.shadow.setPosition(next.x,next.y-1).setDepth(next.y-.1);
  }
 }
 updateCompanion(dt,frame){
  const p=this.hero,q=this.companion,dx=p.x-q.x,dy=p.y+7-q.y,len=Math.hypot(dx,dy);
  if(len>170){q.setPosition(p.x-20,p.y+10);}
  else if(len>25){const next=C.move(this.map,q.x,q.y,dx/len*Math.min(110,(len-24)*4)*dt,dy/len*Math.min(110,(len-24)*4)*dt,4);q.setPosition(next.x,next.y);}
  q.setTexture(this.state.active+'-'+frame);
 }
 updateEnemies(dt,frame,time,rolling){
  for(const e of this.enemies){
    e.sprite.setTexture('slime-'+frame);
    if(time-e.hitAt<300){e.sprite.setTint(0xe4d5c1);continue;}e.sprite.clearTint();
    const dx=this.hero.x-e.sprite.x,dy=this.hero.y-e.sprite.y,len=Math.hypot(dx,dy);
    let vx=0,vy=0;
    if(len<140&&len>5){vx=dx/len*38;vy=dy/len*38;}
    else {vx=Math.sin(time/1100+e.homeX)*11;vy=Math.cos(time/1300+e.homeY)*9;if(Math.hypot(e.sprite.x-e.homeX,e.sprite.y-e.homeY)>75){vx=(e.homeX-e.sprite.x)*.3;vy=(e.homeY-e.sprite.y)*.3;}}
    const next=C.move(this.map,e.sprite.x,e.sprite.y,vx*dt,vy*dt,8);e.sprite.setPosition(next.x,next.y).setDepth(next.y);
    if(len<20&&!rolling&&time-this.hurtAt>1000){
      this.hurtAt=time;this.state.hearts--;ui.audio.play('hit');this.cameras.main.shake(100,.003);
      if(this.state.hearts<=0){this.rest();ui.toast('Inés te ha recuperado. Intenta esquivar con Espacio.');return;}
      // Push away from the enemy, not toward it.
      const away=C.move(this.map,this.hero.x,this.hero.y,dx/(len||1)*20,dy/(len||1)*20);
      this.hero.setPosition(away.x,away.y);
    }
  }
 }
}
const game=new Phaser.Game({
  type:Phaser.AUTO,parent:'game',backgroundColor:'#1b3933',pixelArt:true,roundPixels:true,
  scale:{mode:Phaser.Scale.RESIZE,width:960,height:600,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{antialias:false,pixelArt:true,roundPixels:true},
  audio:{noAudio:true},scene:[ValleyScene]
});
window.addEventListener('error',event=>{if(!document.getElementById('loading').classList.contains('hidden'))document.getElementById('loading').textContent='No se pudo iniciar Lúmina. Revisa la consola del navegador: '+event.message;});
})();
