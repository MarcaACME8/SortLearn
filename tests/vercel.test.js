import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../server.js';
import vercelHandler from '../api/index.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);},end(data){this.data=JSON.parse(data);}};}
test('Vercel acepta origen HTTPS, cuerpo procesado y cookie Secure',async()=>{
 const previous=process.env.VERCEL;process.env.VERCEL='1';
 try{
  const pool={query:async()=>({rows:[],rowCount:1})};
  const handler=createHandler(pool);
  const req={url:'/api/session',method:'POST',headers:{host:'sortlearn.example',origin:'https://sortlearn.example','content-type':'application/json'},body:{name:'QA Vercel'}};
  const res=response();await handler(req,res);
  assert.equal(res.status,201);assert.match(res.headers['Set-Cookie'],/; Secure/);
  const rejected=response();await handler({...req,headers:{...req.headers,origin:'https://otro.example'}},rejected);assert.equal(rejected.status,403);
 }finally{if(previous===undefined)delete process.env.VERCEL;else process.env.VERCEL=previous;}
});
test('Vercel falla de forma controlada cuando no hay base externa',async()=>{
 const previous=process.env.DATABASE_URL;delete process.env.DATABASE_URL;
 try{const res=response();await vercelHandler({},res);assert.equal(res.status,503);assert.deepEqual(res.data,{error:'Servicio temporalmente no disponible.'});}
 finally{if(previous!==undefined)process.env.DATABASE_URL=previous;}
});
