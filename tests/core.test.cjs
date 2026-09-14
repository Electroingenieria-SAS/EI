const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../src/core.js');
const W=require('../src/world.js');
test('invalid and corrupt save fields fall back to safe values',()=>{
  const s=C.sanitize({version:1,x:NaN,y:Infinity,party:['guardian','ascua','ascua','bad'],active:'bad',hearts:-3,hp:{ascua:999}});
  assert.deepEqual(s.party,['brote','ascua']);assert.equal(s.active,'brote');assert.equal(s.hearts,1);assert.equal(s.x,400);assert.equal(s.hp.ascua,42);
});
test('unopened sanctum cannot be resumed from a corrupted save',()=>{
  const s=C.sanitize({version:1,zone:'sanctum',gate:true,runes:['fuego'],guardian:true});
  assert.equal(s.zone,'valley');assert.equal(s.gate,false);assert.equal(s.guardian,false);
});
test('full valid progress survives a save round trip',()=>{
  const s=C.initialState();Object.assign(s,{quest:true,party:['brote','ascua'],hp:{brote:21,ascua:32},active:'ascua',runes:['hoja','agua','fuego'],gate:true,zone:'sanctum',guardian:true});
  const loaded=C.sanitize(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.guardian,true);assert.equal(loaded.zone,'sanctum');assert.equal(loaded.hp.ascua,32);
});
test('runes require the exact sequence and reset on a mistake',()=>{
  assert.deepEqual(C.runeStep(['hoja'],'fuego').runes,[]);
  assert.equal(C.runeStep(['hoja','agua'],'fuego').solved,true);
});
test('elemental affinities favor fire against leaf',()=>{
  assert.equal(C.multiplier('fuego','hoja'),1.5);
  assert.equal(C.multiplier('hoja','fuego'),.7);
  assert.ok(C.damage('ascua','guardian',true,()=>.5)>C.damage('ascua','guardian',false,()=>.5));
});
test('capture probability increases as health decreases',()=>{
  assert.ok(C.captureChance(5,50)>C.captureChance(45,50));
  assert.ok(C.captureChance(-100,50)<=.98);assert.ok(C.captureChance(1000,50)>=.2);
});
test('map generation is deterministic',()=>{
  assert.deepEqual(W.valley().props,W.valley().props);
});
test('river blocks movement while the bridge is walkable',()=>{
  const m=W.valley();
  assert.equal(C.blocked(m,27*32+16,600),true);
  assert.equal(C.blocked(m,27*32+16,23*32+16),false);
});
test('large movement steps cannot tunnel through the river',()=>{
  const m=W.valley(),p=C.move(m,800,600,300,0);
  assert.ok(p.x<832);
});
test('destroyed bushes and defeated shadows stay removed',()=>{
  const s=C.initialState();s.cut.push('bush-a');s.defeated.push('slime-a');const m=W.valley(s);
  assert.ok(!m.props.some(p=>p.id==='bush-a'));assert.ok(!m.solids.some(p=>p.id==='bush-a'));assert.ok(!m.enemies.some(p=>p.id==='slime-a'));
});
function reachable(map,start){
  const queue=[start],seen=new Set([start.join(',')]);
  for(let i=0;i<queue.length;i++){
    const [x,y]=queue[i];
    for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]){
      const nx=x+dx,ny=y+dy,key=nx+','+ny;
      if(!seen.has(key)&&!C.blocked(map,nx,ny)){seen.add(key);queue.push([nx,ny]);}
    }
  }
  return queue;
}
test('every quest object and NPC can be reached from the village',()=>{
  const m=W.valley(),points=reachable(m,[400,880]);
  for(const p of [...W.VALLEY.objects,...W.VALLEY.npcs,...W.VALLEY.wild]){
    assert.ok(points.some(([x,y])=>Math.hypot(x-p.x,y-p.y)<40),'Unreachable: '+p.id);
  }
});
test('sanctum entrance reaches the guardian, altar and exit',()=>{
  const m=W.sanctum(),points=reachable(m,[352,472]);
  for(const p of [...m.props.filter(o=>o.label),...m.wild])assert.ok(points.some(([x,y])=>Math.hypot(x-p.x,y-p.y)<40),'Unreachable: '+p.id);
});
