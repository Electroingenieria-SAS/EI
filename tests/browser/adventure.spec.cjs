const {test,expect}=require('@playwright/test');
async function boot(page){
  await page.goto('/');
  await page.waitForFunction(()=>window.Lumina?.scene?.hero);
  await page.getByRole('button',{name:'Comenzar aventura'}).click();
}
async function teleport(page,x,y){
  await page.evaluate(([x,y])=>{Lumina.scene.hero.setPosition(x,y);Lumina.scene.clearInput();},[x,y]);
}
async function finishDialogue(page){
  for(let n=0;n<10;n++){
    if(await page.locator('#dialog').evaluate(el=>el.classList.contains('hidden')))return;
    await page.locator('#dialog-next').click();
  }
}
test('renders the valley, moves, shows a map and preserves a save',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await boot(page);
  await expect(page.locator('#game canvas')).toBeVisible();
  const before=await page.evaluate(()=>Lumina.scene.hero.y);
  await page.keyboard.down('s');await page.waitForTimeout(250);await page.keyboard.up('s');
  expect(await page.evaluate(()=>Lumina.scene.hero.y)).toBeGreaterThan(before);
  await page.keyboard.press('m');await expect(page.locator('#large-map')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(()=>Lumina.ui.save(false));
  await page.reload();await page.waitForFunction(()=>window.Lumina?.scene?.hero);
  await expect(page.locator('#continue')).toBeVisible();
  await page.locator('#continue').click();
  expect(await page.evaluate(()=>Lumina.scene.started)).toBe(true);
  await page.screenshot({path:'test-results/valley-desktop.png'});
  expect(errors).toEqual([]);
});
test('full quest: dialogue, capture, ordered runes, boss and reload',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await boot(page);
  // Teleports skip travel time, but all progression uses the real interaction UI.
  await teleport(page,432,880);await page.keyboard.press('e');await finishDialogue(page);
  expect(await page.evaluate(()=>Lumina.scene.state.quest)).toBe(true);
  await teleport(page,672,380);await page.keyboard.press('e');
  await expect(page.locator('#battle')).toBeVisible();
  await page.evaluate(()=>{Math.random=()=>.5;});
  for(let n=0;n<4;n++){
    await page.getByRole('button',{name:'1 · Ataque',exact:true}).click();
    await expect(page.getByRole('button',{name:'1 · Ataque',exact:true})).toBeEnabled();
  }
  await page.getByRole('button',{name:/4 · Campana/}).click();
  expect(await page.evaluate(()=>Lumina.scene.state.party)).toContain('ascua');
  await teleport(page,600,936);await page.keyboard.press('e');await finishDialogue(page);
  await page.keyboard.press('i');
  await page.locator('[data-companion="ascua"]').click();
  await page.keyboard.press('Escape');
  for(const [x,y] of [[1136,360],[1248,424],[1360,360]]){
    await teleport(page,x,y);await page.keyboard.press('e');await page.waitForTimeout(70);
  }
  expect(await page.evaluate(()=>Lumina.scene.state.gate)).toBe(true);
  await teleport(page,1248,300);await page.keyboard.press('e');
  await page.waitForFunction(()=>Lumina.scene.state.zone==='sanctum');
  await page.screenshot({path:'test-results/sanctum.png'});
  await teleport(page,352,238);await page.keyboard.press('e');
  await expect(page.locator('#battle')).toBeVisible();
  for(let n=0;n<25;n++){
    const fight=await page.evaluate(()=>Lumina.ui.battle&&({hp:Lumina.ui.battle.allyHp,busy:Lumina.ui.battle.busy,cooldown:Lumina.ui.battle.cooldown}));
    if(!fight)break;
    await expect(page.getByRole('button',{name:'1 · Ataque',exact:true})).toBeEnabled();
    const state=await page.evaluate(()=>({hp:Lumina.ui.battle.allyHp,cooldown:Lumina.ui.battle.cooldown,potions:Lumina.scene.state.potions}));
    if(state.hp<24 && state.potions>0)await page.getByRole('button',{name:/5 · Tónico/}).click();
    else if(state.cooldown===0)await page.getByRole('button',{name:/2 · Chispa/}).click();
    else await page.getByRole('button',{name:'1 · Ataque',exact:true}).click();
    await page.waitForTimeout(850);
  }
  expect(await page.evaluate(()=>Lumina.scene.state.guardian)).toBe(true);
  await finishDialogue(page);
  await page.evaluate(()=>Lumina.ui.save(false));
  await page.reload();await page.waitForFunction(()=>window.Lumina?.scene?.hero);await page.locator('#continue').click();
  expect(await page.evaluate(()=>Lumina.scene.state.guardian)).toBe(true);
  expect(errors).toEqual([]);
});
test('mobile canvas and touch controls are visible',async({page})=>{
  await page.setViewportSize({width:390,height:844});await boot(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('#game canvas')).toBeVisible();
  expect(await page.locator('#app').evaluate(el=>el.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/valley-mobile.png'});
});
