import {ChromeVisualBrowser} from 'file:///C:/Users/derek/.agents/skills/archify/bin/visual-check.mjs';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const b=new ChromeVisualBrowser('C:/Program Files/Google/Chrome/Application/chrome.exe');
const report=[];
try{
 const s=await b.sessionPromise;
 const send=(m,p)=>b.cdp.send(m,p,s);
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
 await send('Page.navigate',{url:pathToFileURL(path.resolve('Practica03/index.html')).href});
 await new Promise(r=>setTimeout(r,700));
 for(const [width,height] of [[1440,900],[1600,1000],[1920,1080],[2048,1320],[390,844]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 await new Promise(r=>setTimeout(r,150));
 report.push(await ev(`({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,cards:document.querySelectorAll('.card').length,items:document.querySelectorAll('.item').length})`));
 if(width===1440||width===2048){const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('Practica03/canvas-'+width+'.png',Buffer.from(shot.data,'base64'))}
 }
 report.push(await ev(`(()=>{let count=0;document.querySelectorAll('.item').forEach(x=>{x.click();if(!detail.open||!document.querySelector('#detail-body').textContent)throw Error('Missing explanation');detail.close();count++});document.querySelectorAll('[data-flow]').forEach(x=>{x.click();if(document.querySelectorAll('.step').length!==4)throw Error('Flow failure')});document.querySelector('#motion').click();return {dialogsTested:count,flowsTested:4,motionButton:document.querySelector('#motion').textContent}})()`));
 report.push(await ev(`(()=>{let n=0;document.querySelectorAll('.section-more').forEach(b=>{b.click();const list=document.querySelectorAll('.dialog-items button');if(!list.length)throw Error('No expanded items');list[list.length-1].click();if(!detail.open)throw Error('Detail did not open');detail.close();n++});return {expandedSectionsTested:n}})()`));
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await ev(`document.querySelector('#ecosystem-tab').click()`);
 await new Promise(r=>setTimeout(r,1200));
 report.push(await ev(`({ecosystemVisible:!document.querySelector('#ecosystem-panel').hidden,embeddedSvg:!!document.querySelector('iframe').contentDocument.querySelector('svg')})`));
 const embeddedShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('Practica03/embedded-ecosystem.png',Buffer.from(embeddedShot.data,'base64'));
 fs.writeFileSync('Practica03/browser-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await b.close()}
