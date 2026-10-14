import {chromium,firefox} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.APP_URL||'http://127.0.0.1:3100';
const channel=process.env.TEST_BROWSER||'msedge';
const browser=channel==='firefox'?await firefox.launch({headless:true}):await chromium.launch({channel,headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const out='test-results/'+channel;await mkdir(out,{recursive:true});
const shots=[];
async function shot(name){await page.waitForLoadState('networkidle');const missing=await page.locator('img').evaluateAll(items=>items.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));assert.deepEqual(missing,[]);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:out+'/'+name+'.png',fullPage:true});shots.push(name);}
async function go(hash){await page.goto(base+'/#'+hash);await page.waitForLoadState('networkidle');}
try{
 await go('home');await page.getByLabel('¿Cómo te gustaría que te llamemos?').waitFor();await page.evaluate(()=>document.fonts.ready);
 await shot('01-inicio');
 await page.getByRole('button',{name:'Comenzar a Aprender'}).click();
 await page.locator('#name-error').filter({hasText:'Escribe tu nombre'}).waitFor();
 await page.getByLabel('¿Cómo te gustaría que te llamemos?').fill('Camila QA '+channel);
 await page.getByRole('button',{name:'Comenzar a Aprender'}).click();
 await page.getByRole('heading',{name:/Evaluación Diagnóstica/}).waitFor();
 await shot('02-diagnostico');
 // Diagnostic deliberately has 3/6 correct, final has 6/6.
 for(let i=0;i<6;i++){
  const answer=i<3?i%3:(i%3+1)%3;
  await page.locator('[data-answer="'+answer+'"]').click();
  await page.locator('#save-status').filter({hasText:'guardada'}).waitFor();
  if(i<5)await page.getByRole('button',{name:/Guardar y Siguiente/}).click();
 }
 await page.getByRole('button',{name:'Finalizar evaluación'}).click();
 await page.getByRole('heading',{name:/Tu punto de partida/}).waitFor();
 await go('catalog');await page.getByRole('heading',{name:/Selecciona el algoritmo/}).waitFor();await shot('03-catalogo');
 await page.getByRole('button',{name:'Básicos / Iterativos'}).click();assert.equal(await page.locator('.algorithm-card').count(),2);
 await page.getByRole('button',{name:'Todos (4)'}).click();
 for(const [index,id]of ['bubble','insertion','merge','quick'].entries()){
  await go('theory/'+id);await page.locator('.theory-grid').waitFor();
  if(index===0)await shot('04-contenido');
  await page.getByRole('link',{name:/Ver en Acción/}).click();await page.locator('.bars').waitFor();
  if(index===0){
   await page.getByRole('button',{name:'Paso siguiente',exact:true}).click();
   const advanced=await page.locator('.visual-header').innerText();
   await page.getByRole('button',{name:'Paso anterior',exact:true}).click();
   assert.notEqual(await page.locator('.visual-header').innerText(),advanced);
   await page.getByRole('button',{name:'Continuar',exact:true}).click();
   await page.getByRole('button',{name:'Pausar',exact:true}).click();
   const paused=await page.locator('.visual-header').innerText();await page.waitForTimeout(1000);
   assert.equal(await page.locator('.visual-header').innerText(),paused);
   await page.getByLabel('Mis números separados por comas').fill('5, 1, 4, 2, 8');
   await page.getByRole('button',{name:'Aplicar',exact:true}).click();
   await shot('05-visualizador');
  }
  await go('exercise/'+id);await page.locator('.exercise-grid').waitFor();
  if(index===0)await shot('06-ejercicios');
  await page.locator('[data-answer="'+[0,1,2,0][index]+'"]').click();
  await page.getByRole('button',{name:/Comprobar mi respuesta/}).click();
  await page.getByRole('heading',{name:'¡Respuesta Correcta!'}).waitFor();
  if(index===0)await shot('07-retroalimentacion');
 }
 await go('exam/final');await page.getByRole('heading',{name:/Evaluación Final/}).waitFor();
 for(let i=0;i<6;i++){
  await page.locator('[data-answer="'+i%3+'"]').click();
  await page.locator('#save-status').filter({hasText:'guardada'}).waitFor();
  if(i<5)await page.getByRole('button',{name:/Guardar y Siguiente/}).click();
 }
 await page.getByRole('button',{name:'Finalizar evaluación'}).click();await page.getByRole('heading',{name:/¡Terminaste/}).waitFor();
 assert.match(await page.locator('.result-metrics').innerText(),/\+50 pp/);
 await shot('08-resultados');await page.reload();await page.getByRole('heading',{name:/¡Terminaste/}).waitFor();
 assert.match(await page.locator('.result-metrics').innerText(),/\+50 pp/);
 const missing=await page.locator('img').evaluateAll(imgs=>imgs.filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src));
 assert.deepEqual(missing,[]);
 await page.setViewportSize({width:390,height:844});
 await go('catalog');await page.locator('.algorithm-card').first().waitFor();await shot('09-movil');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await go('visual/bubble');await page.locator('.bars').waitFor();await shot('10-movil-visualizador');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 await writeFile(out+'/summary.json',JSON.stringify({browser:channel,version:browser.version(),status:'passed',screenshots:shots,errors,date:new Date().toISOString()},null,2));
 console.log(channel+': recorrido completo aprobado; comparación +50 pp, persistencia al recargar, pausa, controles, filtros, recursos y vista móvil.');
}finally{await browser.close();}
