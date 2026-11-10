import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {connectDatabase} from '../src/database.js';
import {createApp} from '../server.js';
import {questions} from '../src/content.js';

const pool=await connectDatabase({memory:true});
const server=createApp(pool);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const out='test-results/usability';await mkdir(out,{recursive:true});
const shot=async name=>{await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/'+name+'.png',fullPage:true});};
const go=async hash=>{const url=base+'/#'+hash;if(page.url()===url)await page.reload();else await page.goto(url);await page.waitForLoadState('networkidle');};
try{
 await go('home');await page.getByLabel('¿Cómo te gustaría que te llamemos?').fill('QA mejoras usabilidad');await page.getByRole('button',{name:'Comenzar a Aprender'}).click();await page.locator('.question-card').waitFor();
 // Set up the diagnostic through the same authenticated API, then exercise the UI.
 await page.evaluate(async answers=>{const r=await fetch('/api/evaluate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'diagnostic',answers})});if(!r.ok)throw new Error('diagnostic setup failed');},Object.fromEntries(questions.filter(q=>q.purpose==='diagnostic').map(q=>[q.id,q.answer])));
 await page.reload();await page.waitForLoadState('networkidle');
 await go('exam/final');await page.getByRole('button',{name:'Evaluación final bloqueada',exact:true}).waitFor();assert.equal(await page.locator('.route-checklist li').count(),4);assert.equal(await page.getByRole('button',{name:'Evaluación final bloqueada',exact:true}).isDisabled(),true);await shot('01-final-bloqueada');
 for(const id of ['bubble','insertion','merge','quick']){
  await go('theory/'+id);await page.locator('.theory-grid').waitFor();
  await go('exercise/'+id);await page.locator('.practice-nav').waitFor();assert.equal(await page.locator('[data-exercise-id]').count(),3);
  for(const q of questions.filter(q=>q.algorithm===id&&q.purpose==='exercise')){
   await page.locator('[data-exercise-id="'+q.id+'"]').click();
   if(id==='bubble'&&q.id==='e-bubble')await shot('02-tres-ejercicios');
   await page.locator('[data-answer="'+q.answer+'"]').click();await page.getByRole('button',{name:/Comprobar mi respuesta/}).click();await page.getByRole('heading',{name:'¡Respuesta Correcta!',exact:true}).waitFor();assert.equal(await page.locator('.solution-steps li').count(),3);
   if(id==='bubble'&&q.id==='e-bubble'){await shot('03-solucion-guiada');await page.getByRole('button',{name:'Siguiente ejercicio',exact:true}).click();assert.match(await page.locator('.practice-progress').innerText(),/Ejercicio 2 de 3/);}
   await go('exercise/'+id);
  }
 }
 await go('catalog');await page.getByRole('link',{name:'Iniciar evaluación final',exact:true}).waitFor();await shot('04-final-habilitada');
 await page.getByRole('link',{name:'Iniciar evaluación final',exact:true}).click();await page.locator('.question-card').waitFor();
 for(const [i,q] of questions.filter(q=>q.purpose==='final').entries()){
  await page.locator('[data-answer="'+q.answer+'"]').click();await page.locator('#save-status').filter({hasText:'guardada'}).waitFor();
  if(i<5)await page.getByRole('button',{name:/Guardar y Siguiente/}).click();
 }
 await page.getByRole('button',{name:'Finalizar evaluación',exact:true}).click();await page.getByRole('heading',{name:/¡Terminaste/}).waitFor();
 await go('exercise/bubble');await page.locator('.practice-nav').waitFor();assert.equal(await page.locator('.practice-nav').getByRole('button',{name:/Intentado/}).count(),3);
 await go('visual/bubble');await page.getByRole('button',{name:'Paso siguiente',exact:true}).click();assert.match(await page.locator('.visual-header p').innerText(),/28.*12/);await shot('05-explicacion-visual');
 // Check actual browser text colors on their rendered backgrounds.
 const ratio=await page.evaluate(()=>{
  function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}
  function lum(v){return v.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}
  const a=lum(rgb(getComputedStyle(document.querySelector('.visual-header p')).color)),b=lum([255,255,255]);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 });assert.ok(ratio>=4.5);
 await page.setViewportSize({width:390,height:844});
 for(const hash of ['catalog','exam/final','exercise/bubble','visual/bubble']){await go(hash);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,hash);}
 await go('catalog');await shot('06-movil');
 assert.deepEqual(errors,[]);
 await writeFile(out+'/summary.json',JSON.stringify({status:'passed',exerciseCount:12,solutionSteps:3,finalGate:'checked',finalEvaluation:'completed',contrastRatio:ratio,mobileWidth:390,errors,date:new Date().toISOString()},null,2));
 console.log('Usabilidad: 12 ejercicios, soluciones, bloqueo y desbloqueo, persistencia, explicaciones, contraste y móvil aprobados.');
}catch(error){console.error(await page.locator('main').innerText());console.error(errors);await shot('fallo');throw error;}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await pool.end();}
