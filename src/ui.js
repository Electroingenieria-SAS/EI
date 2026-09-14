(function(root){
'use strict';
const C=root.LuminaCore,Art=root.LuminaArt,$=id=>document.getElementById(id);
const STORAGE='lumina-save-v1';
class UI {
 constructor(){
  this.scene=null;this.modal='title';this.dialogue=null;this.battle=null;this.timer=0;this.lastHud='';this.audio=new root.LuminaAudio();
  this.saved=this.readSave();if(this.saved)$('continue').classList.remove('hidden');
  $('start').onclick=()=>{
    if(this.saved)this.panel('Una nueva travesía','<p>Comenzar de nuevo sustituirá la partida guardada en este navegador.</p><button id="new-confirm" class="primary">Comenzar de nuevo</button>',()=>{$('new-confirm').onclick=()=>this.start(false);});
    else this.start(false);
  };
  $('continue').onclick=()=>this.start(true);
  $('title-help').onclick=()=>this.help();
  $('panel-close').onclick=()=>this.closePanel();
  $('dialog-next').onclick=()=>this.next();
  $('journal-button').onclick=()=>this.journal();
  $('mini').onclick=()=>this.map();
  $('sound').onclick=async()=>{const on=await this.audio.toggle();$('sound').textContent='Sonido: '+(on?'encendido':'apagado');$('sound').setAttribute('aria-label',on?'Desactivar sonido':'Activar sonido');};
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('app').requestFullscreen();}catch{this.toast('Tu navegador no permite pantalla completa.');}};
  document.addEventListener('keydown',e=>{
    if(this.modal && ['Tab'].includes(e.key)){this.trapFocus(e);return;}
    if(e.repeat)return;
    if(e.code==='Escape'){e.preventDefault();if(this.modal==='panel')this.closePanel();else if(!this.modal&&this.scene?.started)this.pause();}
    if(this.modal==='dialog'&&(e.code==='KeyE'||e.code==='Enter'||e.code==='Space')){e.preventDefault();this.next();return;}
    if(this.battle && !this.battle.busy && /^[1-6]$/.test(e.key)){const b=$('battle-actions').children[Number(e.key)-1];if(b&&!b.disabled)b.click();}
    if(!this.modal&&this.scene?.started){if(e.code==='KeyM')this.map();if(e.code==='KeyI')this.journal();if(e.code==='KeyH')this.help();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.scene?.started){this.save(false);if(!this.modal)this.pause();}});
  window.addEventListener('pagehide',()=>this.save(false));
 }
 trapFocus(e){
  const parent=this.modal==='panel'?$('panel'):this.modal==='dialog'?$('dialog'):this.modal==='battle'?$('battle'):$('title');
  const buttons=[...parent.querySelectorAll('button:not(:disabled),a[href]')].filter(el=>!el.classList.contains('hidden'));
  if(!buttons.length)return;
  const i=buttons.indexOf(document.activeElement);
  if(e.shiftKey && i<=0){e.preventDefault();buttons.at(-1).focus();}
  else if(!e.shiftKey && (i<0||i===buttons.length-1)){e.preventDefault();buttons[0].focus();}
 }
 readSave(){try{const raw=JSON.parse(localStorage.getItem(STORAGE));return raw?.version===1?C.sanitize(raw):null;}catch{return null;}}
 save(notify=true){
  if(!this.scene?.started)return;
  const s=this.scene.state;s.x=this.scene.hero.x;s.y=this.scene.hero.y;
  try{localStorage.setItem(STORAGE,JSON.stringify(s));this.saved=C.sanitize(s);if(notify)this.toast('Travesía guardada en este navegador.');return true;}
  catch{if(notify)this.toast('No se pudo guardar: revisa el almacenamiento del navegador.');return false;}
 }
 start(continuing){
  if(!this.scene)return;
  this.modal=null;$('title').classList.add('hidden');$('panel').classList.add('hidden');$('hud').classList.remove('hidden');$('touch').classList.remove('hidden');
  this.scene.begin(continuing?this.saved:C.initialState());this.lastHud='';this.update();
  $('game').focus();this.toast(continuing?'Bienvenido de nuevo al valle.':'Mara te espera junto al sendero. Acércate y pulsa E.');
 }
 update(){
  if(!this.scene?.started)return;const s=this.scene.state;
  const key=JSON.stringify([s.hearts,s.active,s.party,s.quest,s.gate,s.guardian,s.zone]);
  $('stamina').style.width=s.stamina+'%';
  if(key!==this.lastHud){
    this.lastHud=key;$('hearts').textContent='♥'.repeat(s.hearts)+'♡'.repeat(6-s.hearts);
    $('companion-image').src=Art.uri(s.active+'-0');$('companion-name').textContent=C.SPECIES[s.active].name;$('collection-count').textContent=s.party.length+' / 3 vínculos';
    const objective=!s.quest?['Habla con Mara','La guardiana te espera en la aldea.']:s.party.length<2?['Forma un nuevo vínculo','Encuentra una criatura y utiliza una campana.']:!s.gate?['Despierta las tres runas','Las piedras del santuario recuerdan un orden.']:!s.guardian?['Encuentra al guardián','Entra al santuario al noreste.']:['El valle vuelve a respirar','Explora, completa tu bestiario y abre los cofres.'];
    $('objective').textContent=objective[0];$('quest-detail').textContent=objective[1];
  }
  let name='Aldea del Alba',sub='Un comienzo entre las hojas',p=this.scene.hero;
  if(s.zone==='sanctum'){name='Santuario de la Raíz';sub='Donde la luz recuerda';}
  else if(p.y<650){name=p.x>950?'Ruinas del Vínculo':'Bosque Susurrante';sub=p.x>950?'Tres voces. Una misma luz.':'Escucha el pulso del bosque';}
  else if(p.x>920){name='Ribera de Nimbo';sub='El río dibuja su propio camino';}
  $('location').textContent=name;$('location-sub').textContent=sub;
 }
 toast(message){clearTimeout(this.timer);$('toast').textContent=message;$('toast').classList.add('visible');this.timer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
 say(name,lines,portrait='sage-down-0',done=null){
  if(this.modal)return;
  this.modal='dialog';this.dialogue={name,lines:[...lines],index:0,done};this.scene.clearInput();$('dialog').classList.remove('hidden');$('speaker').textContent=name;$('portrait').src=Art.uri(portrait);$('dialog-text').textContent=lines[0];$('dialog-next').focus();this.audio.play('talk');
 }
 next(){
  const d=this.dialogue;if(!d)return;
  if(++d.index<d.lines.length){$('dialog-text').textContent=d.lines[d.index];this.audio.play('talk');}
  else {this.dialogue=null;this.modal=null;$('dialog').classList.add('hidden');this.scene?.clearInput();if(d.done)d.done();$('game').focus();}
 }
 panel(title,html,after){
  if(this.modal && this.modal!=='title' && this.modal!=='panel')return;
  this.returnModal=this.modal==='title'?'title':(this.modal==='panel'?this.returnModal:null);
  this.modal='panel';this.scene?.clearInput();$('panel-title').textContent=title;$('panel-body').innerHTML=html;$('panel').classList.remove('hidden');if(after)after();$('panel-close').focus();
 }
 closePanel(){if(this.modal!=='panel')return;$('panel').classList.add('hidden');this.modal=this.returnModal||null;this.scene?.clearInput();(this.modal==='title'?$('start'):$('game')).focus();}
 help(){
  this.panel('Tu primera travesía','<div class="help-grid">'+[
    ['WASD / Flechas','Caminar en ocho direcciones.'],['Shift','Correr. Consume energía.'],['E','Hablar, abrir cofres y encontrar criaturas.'],['J','Espada: corta arbustos y repele sombras.'],['Espacio','Rodar: esquiva ataques.'],['M / I','Mapa / diario y compañeros.'],['Esc','Pausa, guardado y controles.'],['1–6','Elegir una acción durante un encuentro.']
  ].map(([k,v])=>'<p><kbd>'+k+'</kbd> '+v+'</p>').join('')+'</div><p>Empieza hablando con Mara. Inés puede curarte y reponer campanas. Las criaturas visibles se encuentran con E; las sombras se combaten con la espada.</p><p class="muted">En pantalla táctil, usa los botones inferiores. El sonido se activa desde la barra superior. El guardado automático funciona fuera de los encuentros.</p>');
 }
 pause(){
  this.panel('Un momento junto al camino','<p>La exploración está en pausa.</p><div class="panel-actions"><button id="resume">Continuar</button><button id="save">Guardar</button><button id="help">Controles</button><button id="atlas">Ver y exportar arte</button></div><p class="muted">La partida se guarda en este navegador. El proyecto completo se descarga desde el enlace del pie de página.</p>',()=>{
    $('resume').onclick=()=>this.closePanel();$('save').onclick=()=>this.save();$('help').onclick=()=>this.help();$('atlas').onclick=()=>this.atlas();
  });
 }
 journal(){
  const s=this.scene.state;
  this.panel('Vínculos del valle','<div class="cards">'+['brote','ascua','nimbo'].map(id=>{
    const a=C.SPECIES[id],found=s.party.includes(id);
    return '<article><img class="creature" src="'+Art.uri(id+'-0')+'" alt="'+a.name+'" style="'+(found?'':'filter:grayscale(1);opacity:.35')+'"><h3>'+a.name+'</h3><span class="badge">'+a.element.toUpperCase()+'</span><p>'+a.description+'</p>'+(found?'<p>'+s.hp[id]+' / '+a.hp+' vitalidad</p><button data-companion="'+id+'" '+(s.active===id?'disabled':'')+'>'+(s.active===id?'Te acompaña':'Elegir compañero')+'</button>':'<p>Aún por conocer</p>')+'</article>';
  }).join('')+'</div><p>Inventario: <strong>'+s.bells+' campanas</strong> · <strong>'+s.potions+' tónicos</strong> · '+s.xp+' experiencia de exploración.</p><p>Runas activadas: '+(s.runes.length?s.runes.join(' → '):'ninguna')+'.</p><p class="muted">Afinidades: Hoja supera a Agua; Agua a Fuego; Fuego a Hoja. Usa el movimiento elemental para aprovecharlas.</p>',()=>{
    document.querySelectorAll('[data-companion]').forEach(b=>b.onclick=()=>{s.active=b.dataset.companion;this.scene.refreshCompanion();this.save(false);this.update();this.journal();});
  });
 }
 drawMap(canvas,large=false){
  if(!this.scene?.map)return;
  const ctx=canvas.getContext('2d'),m=this.scene.map,sx=canvas.width/m.width,sy=canvas.height/m.height;
  const palette={grass:'#638858',path:'#cfbd8a',water:'#477e89',bridge:'#b89c6c',stone:'#a9ae89',floor:'#718578',wall:'#2b4645'};
  for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){ctx.fillStyle=palette[m.tiles[y][x]];ctx.fillRect(x*sx,y*sy,Math.ceil(sx),Math.ceil(sy));}
  for(const p of m.props)if(['house','shrine','tree','pine'].includes(p.kind)){ctx.fillStyle=p.kind==='house'?'#b88365':p.kind==='shrine'?'#e1d39a':'#3d684b';ctx.fillRect(p.x/32*sx-1,p.y/32*sy-2,large?5:2,large?5:2);}
  const p=this.scene.hero;ctx.fillStyle='#fff0b2';ctx.beginPath();ctx.arc(p.x/32*sx,p.y/32*sy,large?6:3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#365445';ctx.stroke();
  if(large && m.id==='valley'){
    ctx.font='bold 13px system-ui';ctx.textAlign='center';
    for(const [x,y,label] of [[14,30,'ALDEA DEL ALBA'],[13,6,'BOSQUE SUSURRANTE'],[39,5,'SANTUARIO'],[36,32,'RIBERA']]){ctx.lineWidth=4;ctx.strokeStyle='#284637';ctx.strokeText(label,x*sx,y*sy);ctx.fillStyle='#f0dfad';ctx.fillText(label,x*sx,y*sy);}
  }
 }
 map(){this.panel('El valle de Auralia','<canvas id="large-map" class="map-large" width="768" height="576"></canvas><p class="muted">El punto dorado eres tú. Cruza el puente al este para llegar a las ruinas del noreste.</p>',()=>this.drawMap($('large-map'),true));}
 atlas(){
  this.panel('El arte del valle','<p>Sprites y escenarios originales. Cada textura puede editarse en <code>assets/atlas.js</code>. Exporta una lámina PNG para revisar todo el arte.</p><button id="export-atlas">Descargar atlas PNG</button><div id="atlas-preview"></div>',()=>{
    const image=Art.atlas();image.style.width='100%';image.style.imageRendering='pixelated';$('atlas-preview').appendChild(image);
    $('export-atlas').onclick=()=>{const a=document.createElement('a');a.href=image.toDataURL();a.download='lumina-atlas.png';a.click();};
  });
 }
 encounter(entity){
  if(this.modal)return;
  const s=this.scene.state,id=entity.species,ally=s.active,boss=id==='guardian';
  if(boss && s.guardian)return;
  this.modal='battle';this.scene.clearInput();this.battle={entity,id,ally,boss,hp:C.SPECIES[id].hp,max:C.SPECIES[id].hp,allyHp:s.hp[ally],busy:false,guard:false,cooldown:0,turn:0};
  $('battle').classList.remove('hidden');$('battle-type').textContent=boss?'PRUEBA DEL SANTUARIO':'ENCUENTRO SILVESTRE';
  $('ally-name').textContent=C.SPECIES[ally].name;$('enemy-name').textContent=C.SPECIES[id].name;
  $('ally-art').src=Art.uri(ally+'-0');$('enemy-art').src=Art.uri(id+'-0');
  $('battle-log').textContent=boss?'El guardián pone a prueba el vínculo que has formado.':'Un '+C.SPECIES[id].name+' observa tus pasos. Debilítalo para facilitar el vínculo.';
  this.battleBars();this.battleButtons();
 }
 battleBars(){const b=this.battle;if(!b)return;$('ally-hp').textContent=b.allyHp+' / '+C.SPECIES[b.ally].hp;$('enemy-hp').textContent=b.hp+' / '+b.max;$('ally-bar').style.width=100*b.allyHp/C.SPECIES[b.ally].hp+'%';$('enemy-bar').style.width=100*b.hp/b.max+'%';}
 battleButtons(){
  const b=this.battle,s=this.scene.state;if(!b)return;
  const choices=[
    ['attack','1 · Ataque',false],
    ['special','2 · '+C.SPECIES[b.ally].move+(b.cooldown?' ('+b.cooldown+')':''),b.cooldown>0],
    ['guard','3 · Proteger',false],
    ['capture','4 · Campana ('+s.bells+')',b.boss||s.bells<=0||s.party.includes(b.id)],
    ['potion','5 · Tónico ('+s.potions+')',s.potions<=0||b.allyHp===C.SPECIES[b.ally].hp],
    ['flee','6 · Retirarse',false]
  ];
  $('battle-actions').innerHTML='';
  for(const [id,label,disabled] of choices){const button=document.createElement('button');button.textContent=label;button.disabled=b.busy||disabled;button.onclick=()=>this.act(id);$('battle-actions').appendChild(button);}
  if(!b.busy)$('battle-actions').querySelector('button:not(:disabled)')?.focus();
 }
 flash(id){const el=$(id);el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');}
 act(action){
  const b=this.battle;if(!b||b.busy)return;const s=this.scene.state;
  if(action==='flee'){this.endBattle('flee');return;}
  if(action==='special'&&b.cooldown>0||action==='capture'&&(b.boss||s.bells<=0||s.party.includes(b.id))||action==='potion'&&s.potions<=0)return;
  b.busy=true;b.turn++;b.guard=false;
  if(b.cooldown>0)b.cooldown--;
  if(action==='attack'||action==='special'){
    const d=C.damage(b.ally,b.id,action==='special');b.hp=Math.max(0,b.hp-d);
    if(action==='special')b.cooldown=2;
    const effective=action==='special'?C.multiplier(C.SPECIES[b.ally].element,C.SPECIES[b.id].element):1;
    $('battle-log').textContent=C.SPECIES[b.ally].name+' causa '+d+' de daño.'+(effective>1?' ¡La afinidad es favorable!':effective<1?' Esa afinidad es resistente.':'');
    this.flash('enemy-art');this.audio.play('hit');
  }else if(action==='guard'){b.guard=true;$('battle-log').textContent='Tu compañero se protege y recupera 5 de vitalidad.';b.allyHp=Math.min(C.SPECIES[b.ally].hp,b.allyHp+5);}
  else if(action==='potion'){s.potions--;b.allyHp=Math.min(C.SPECIES[b.ally].hp,b.allyHp+28);$('battle-log').textContent='El tónico restaura hasta 28 de vitalidad.';this.audio.play('heal');}
  else if(action==='capture'){
    s.bells--;const success=b.hp/b.max<=.3||Math.random()<C.captureChance(b.hp,b.max);
    if(success){s.party.push(b.id);s.hp[b.id]=C.SPECIES[b.id].hp;this.audio.play('capture');this.endBattle('capture');return;}
    $('battle-log').textContent='La campana resuena… pero el vínculo todavía no se forma.';
  }
  this.battleBars();this.battleButtons();
  setTimeout(()=>{
    if(this.battle!==b)return;
    if(b.hp<=0){this.endBattle('win');return;}
    let d=C.damage(b.id,b.ally,b.boss&&b.turn%3===0);
    if(b.guard)d=Math.max(1,Math.ceil(d*.3));
    b.allyHp=Math.max(0,b.allyHp-d);this.flash('ally-art');this.audio.play('hit');
    $('battle-log').textContent+=' '+C.SPECIES[b.id].name+' responde: '+d+' de daño.';
    this.battleBars();
    if(b.allyHp<=0){setTimeout(()=>{if(this.battle===b)this.endBattle('loss');},650);return;}
    b.busy=false;this.battleButtons();
  },750);
 }
 endBattle(result){
  const b=this.battle;if(!b)return;const s=this.scene.state;
  s.hp[b.ally]=Math.max(1,b.allyHp);b.entity.cooldown=this.scene.time.now+9000;
  if(result==='win'||result==='capture'){s.xp+=b.boss?100:20;if(b.boss){s.guardian=true;this.audio.play('win');}else if(result==='win')this.audio.play('win');}
  this.battle=null;this.modal=null;$('battle').classList.add('hidden');this.scene.clearInput();
  if(result==='loss'){this.scene.rest();this.toast('Inés te ha ayudado a recuperarte. Puedes volver a intentarlo.');}
  else if(b.boss&&result==='win'){
    this.scene.removeGuardian();
    this.say('La voz del santuario',['El guardián inclina la cabeza. La luz vuelve a recorrer las raíces del valle.','Has completado la primera travesía de Lúmina. Aún puedes conocer las tres criaturas, abrir cofres y explorar cada rincón.'],'guardian-0',()=>this.save(false));
  }else this.toast(result==='capture'?'¡'+C.SPECIES[b.id].name+' se une a tu travesía!':result==='win'?'Encuentro superado · +20 experiencia':'Te retiras con cuidado.');
  this.scene.refreshCompanion();this.update();this.save(false);$('game').focus();
 }
}
root.LuminaUI=UI;
})(window);
