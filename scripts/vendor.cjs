/* Download the exact engine version, including its upstream MIT license.
   After this command, the game no longer needs a CDN connection. */
const fs = require('node:fs/promises');
const path = require('node:path');
async function get(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(response.status+' '+url);
  return response.text();
}
(async()=>{
  const [engine,license]=await Promise.all([
    get('https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js'),
    get('https://raw.githubusercontent.com/phaserjs/phaser/v3.90.0/LICENSE.md')
  ]);
  if(engine.length<500000||!engine.includes('3.90.0'))throw new Error('Unexpected Phaser build');
  if(!license.includes('MIT'))throw new Error('Unexpected license');
  const dir=path.resolve(__dirname,'../vendor');await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,'phaser.min.js'),engine);
  await fs.writeFile(path.join(dir,'PHASER-LICENSE.txt'),license);
  console.log('Phaser 3.90.0 installed locally. You can now play without internet.');
})().catch(error=>{console.error(error);process.exitCode=1;});
