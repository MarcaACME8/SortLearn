import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createHandler} from '../server.js';
import {traceSort} from '../src/algorithms.js';

test('consultar una sesión no bloquea ni escribe su estado',async()=>{
 const queries=[];
 const db={async query(sql){queries.push(sql);return {rows:sql.startsWith('SELECT * FROM learning_sessions')?[{name:'QA',state:{viewed:[],practiced:[],drafts:{}}}]:[]};},release(){}};
 const res={writeHead(status){this.status=status;},end(){}};
 await createHandler({connect:async()=>db})({url:'/api/session',method:'GET',headers:{cookie:'sortlearn=11111111-1111-4111-8111-111111111111'}},res);
 assert.equal(res.status,200);
 assert.ok(queries.every(sql=>!sql.includes('FOR UPDATE')&&!sql.startsWith('UPDATE')));
});

test('Merge Sort señala comparación y copia; al terminar no señala instrucciones',()=>{
 const steps=traceSort('merge',[3,1,2]);
 assert.equal(steps.find(s=>s.kind==='compare').codeLine,2);
 assert.equal(steps.find(s=>s.kind==='write').codeLine,3);
 for(const algorithm of ['bubble','insertion','merge','quick'])assert.equal(traceSort(algorithm,[2,1]).at(-1).codeLine,null);
});

test('una respuesta tardía de ejercicio no reemplaza la sección actual',async()=>{
 const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/,'').split("try{await refresh();}catch(error)")[0];
 const main={innerHTML:'',focus(){}},header={},notice={};
 const listeners={};let resolveExercise;
 const context=vm.createContext({
  document:{querySelector:selector=>({'#main':main,'#header':header,'#notice':notice}[selector]),addEventListener:(type,fn)=>{listeners[type]=fn;}},
  location:{hash:'#exercise/bubble'},window:{addEventListener(){},scrollTo(){}},
  clearInterval(){},clearTimeout(){},setTimeout(){},
  fetch:()=>new Promise(resolve=>{resolveExercise=resolve;})
 });
 vm.runInContext(source,context);
 vm.runInContext("session={name:'QA',state:{practiced:[],viewed:['bubble'],drafts:{}},evaluations:[{kind:'diagnostic'}],algorithms:[]};exercise={question:{id:'e-bubble'},answer:0};",context);
 const button={dataset:{action:'check'},disabled:false};
 const pending=listeners.click({target:{closest:()=>button}});
 context.location.hash='#home';
 await vm.runInContext('route()',context);
 const expected=main.innerHTML;
 resolveExercise({ok:true,json:async()=>({correct:true,explanation:'Respuesta tardía',correctAnswer:0})});
 await pending;
 assert.equal(main.innerHTML,expected);
 assert.ok(main.innerHTML.includes('Bienvenido'));
});
