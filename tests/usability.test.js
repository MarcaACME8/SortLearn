import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {algorithms,questions,publicQuestion} from '../src/content.js';
import {traceSort} from '../src/algorithms.js';

test('cada ejercicio tiene solución guiada y un identificador único',()=>{
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const a of algorithms){
  const bank=questions.filter(q=>q.algorithm===a.id&&q.purpose==='exercise');
  assert.equal(bank.length,3);
  for(const q of bank){assert.equal(q.solution.length,3);assert.ok(q.solution.every(s=>s.length>25));assert.equal(publicQuestion(q).solution,undefined);}
 }
});

test('la evaluación muestra pendientes específicos y solo se habilita con las cuatro rutas',async()=>{
 const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/,'').split("try{await refresh();}catch(error)")[0];
 const context=vm.createContext({document:{querySelector:()=>({}),addEventListener(){}},window:{addEventListener(){}},algorithms});
 vm.runInContext(source,context);
 vm.runInContext("session={algorithms,state:{viewed:['bubble'],practiced:[]},evaluations:[{kind:'diagnostic'}]};",context);
 let html=vm.runInContext('finalAccess()',context);
 assert.match(html,/Evaluación final bloqueada/);assert.match(html,/Pendiente: responder un ejercicio/);assert.match(html,/Pendiente: consultar teoría/);
 assert.doesNotMatch(html,/Iniciar evaluación final/);
 vm.runInContext("session.state.viewed=algorithms.map(a=>a.id);session.state.practiced=algorithms.map(a=>a.id);",context);
 html=vm.runInContext('finalAccess()',context);assert.match(html,/Iniciar evaluación final/);assert.doesNotMatch(html,/ disabled/);
});

test('las comparaciones explican la decisión con los valores reales',()=>{
 const bubble=traceSort('bubble',[7,2]).find(s=>s.kind==='compare');assert.match(bubble.description,/7/);assert.match(bubble.description,/2/);assert.match(bubble.description,/mayor/);
 const quick=traceSort('quick',[9,2,5]).find(s=>s.kind==='compare');assert.match(quick.description,/pivote 5/);assert.match(quick.description,/mayor/);
 const merge=traceSort('merge',[3,1]).find(s=>s.kind==='compare');assert.match(merge.description,/copiará 1/);
});
