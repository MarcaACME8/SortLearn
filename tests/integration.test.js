import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectDatabase} from '../src/database.js';
import {createApp} from '../server.js';
import {questions} from '../src/content.js';

test('recorrido integrado con PostgreSQL embebido',async t=>{
 const pool=await connectDatabase({memory:true});
 const server=createApp(pool);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const clients=[];
 const client=()=>{const state={cookie:''};clients.push(state);return async(path,data)=>{
  const res=await fetch(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Cookie:state.cookie,...(data===undefined?{}:{'Content-Type':'application/json'})},body:data===undefined?undefined:JSON.stringify(data)});
  if(res.headers.get('set-cookie'))state.cookie=res.headers.get('set-cookie').split(';')[0];
  return {status:res.status,body:await res.json()};
 };};
 const a=client(),b=client();
 const answers=kind=>Object.fromEntries(questions.filter(q=>q.purpose===kind).map(q=>[q.id,q.answer]));
 try{
 await t.test('sesión obligatoria y validación del nombre',async()=>{
  assert.equal((await a('session')).status,401);
  for(const name of ['', '   ', 'x'.repeat(81), null])assert.equal((await a('session',{name})).status,400);
  assert.equal((await a('session',{name:'Ana'})).status,201);
  assert.equal((await b('session',{name:'Luis'})).status,201);
 });
 await t.test('diagnóstico completo, guardado de borrador y respuestas privadas',async()=>{
  assert.equal((await a('viewed',{algorithm:'bubble'})).status,409);
  const bank=await a('questions?kind=diagnostic');
  assert.equal(bank.body.length,6);
  assert.ok(bank.body.every(q=>q.answer===undefined&&q.explanation===undefined));
  assert.equal((await a('evaluate',{kind:'diagnostic',answers:{d1:0}})).status,400);
  assert.equal((await a('draft',{kind:'diagnostic',answers:{d1:0}})).status,200);
  assert.deepEqual((await a('session')).body.state.drafts.diagnostic,{d1:0});
  const submitted=await a('evaluate',{kind:'diagnostic',answers:answers('diagnostic')});
  assert.equal(submitted.body.correct,6);
  assert.equal((await a('evaluate',{kind:'diagnostic',answers:answers('diagnostic')})).status,409);
 });
 await t.test('sesiones aisladas y final bloqueado sin recorrido',async()=>{
  assert.equal((await b('session')).body.evaluations.length,0);
  assert.equal((await a('questions?kind=final')).status,409);
  assert.equal((await a('evaluate',{kind:'final',answers:answers('final')})).status,409);
  assert.equal((await a('exercise',{id:'e-bubble',answer:0})).status,409);
 });
 await t.test('contenidos, validación de ejercicios y retroalimentación',async()=>{
  assert.equal((await a('viewed',{algorithm:'unknown'})).status,400);
  for(const id of ['bubble','insertion','merge','quick']){
   assert.equal((await a('viewed',{algorithm:id})).status,200);
   const q=questions.find(q=>q.id==='e-'+id);
   assert.equal((await a('exercise',{id:q.id,answer:-1})).status,400);
   const wrong=await a('exercise',{id:q.id,answer:(q.answer+1)%q.options.length});
   assert.equal(wrong.body.correct,false);assert.ok(wrong.body.explanation);
   const correct=await a('exercise',{id:q.id,answer:q.answer});
   assert.equal(correct.body.correct,true);
  }
  assert.equal((await a('session')).body.state.practiced.length,4);
 });
 await t.test('final completo y comparación con disminución',async()=>{
  assert.equal((await a('questions?kind=final')).status,200);
  assert.equal((await a('evaluate',{kind:'final',answers:{}})).status,400);
  const finalAnswers=answers('final');finalAnswers.f1=1;
  assert.equal((await a('evaluate',{kind:'final',answers:finalAnswers})).body.correct,5);
  const state=(await a('session')).body;
  assert.equal(state.evaluations.length,2);assert.equal(state.attempts.length,8);
  assert.equal(state.evaluations.find(e=>e.kind==='final').total,6);
  assert.equal((await a('draft',{kind:'final',answers:finalAnswers})).status,409);
 });
 await t.test('envíos simultáneos no duplican una evaluación',async()=>{
  const payload={kind:'diagnostic',answers:answers('diagnostic')};
  const result=await Promise.all([b('evaluate',payload),b('evaluate',payload)]);
  assert.deepEqual(result.map(r=>r.status).sort(),[200,409]);
  assert.equal((await b('session')).body.evaluations.length,1);
 });
 await t.test('no se exponen fuentes privadas ni operaciones desde otro origen',async()=>{
  assert.equal((await fetch(base+'/src/content.js')).status,404);
  const res=await fetch(base+'/api/session',{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json'},body:'{"name":"Otra"}'});
  assert.equal(res.status,403);
 });
 await t.test('cerrar sesión impide recuperar sus datos con la cookie eliminada',async()=>{
  assert.equal((await a('logout',{})).status,200);
  assert.equal((await a('session')).status,401);
 });
 }finally{await new Promise(resolve=>server.close(resolve));await pool.end();}
});
