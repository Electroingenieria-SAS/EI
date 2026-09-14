/* Small original synthesis score and effects. Audio starts only after consent. */
(function(root){
'use strict';
class Audio {
 constructor(){this.enabled=false;this.ctx=null;this.step=0;this.timer=null;}
 async toggle(){
  if(!this.ctx){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return false;this.ctx=new Context();}
  this.enabled=!this.enabled;
  if(this.enabled){try{await this.ctx.resume();}catch{this.enabled=false;}}
  if(this.timer)clearInterval(this.timer);
  if(this.enabled)this.timer=setInterval(()=>this.tick(),520);
  else this.ctx.suspend().catch(()=>{});
  return this.enabled;
 }
 note(freq,duration=.14,volume=.04,type='sine',delay=0){
  if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;
  const o=this.ctx.createOscillator(),g=this.ctx.createGain(),at=this.ctx.currentTime+delay;
  o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.02);g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  o.connect(g);g.connect(this.ctx.destination);o.start(at);o.stop(at+duration+.04);
 }
 tick(){if(document.hidden)return;const notes=[261.63,0,329.63,392,0,329.63,293.66,0,220,0,293.66,349.23,0,293.66,261.63,0];let n=notes[this.step++%notes.length];if(n)this.note(n,.8,.012);if(this.step%8===1)this.note(this.step%16===1?130.81:110,2.4,.012,'sine');}
 play(kind){
  const sounds={talk:[440],chest:[523,659,784],rune:[392,523,659],wrong:[220,164],sword:[170,90],hit:[140,110],heal:[392,494,587,784],capture:[440,554,659,880],win:[392,523,659,784,1046],roll:[240,180]};
  (sounds[kind]||[440]).forEach((n,i)=>this.note(n,.18,.03,kind==='sword'?'triangle':'sine',i*.065));
 }
}
root.LuminaAudio=Audio;
})(window);
