import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { algorithms, questions } from './content.js';

export async function connectDatabase(options={}) {
 let pool;
 const connectionString=options.connectionString ?? process.env.DATABASE_URL;
 if(connectionString && !options.memory){
  pool=new pg.Pool({connectionString,connectionTimeoutMillis:4000});
  pool.mode='postgresql';
 }else{
  const dataPath=options.memory?'memory://':fileURLToPath(new URL('../.local/pglite/',import.meta.url));
  if(!options.memory)await mkdir(dataPath,{recursive:true});
  const db=await PGlite.create(dataPath);
  // Serialize whole transactions, not individual queries, on the single connection.
  let tail=Promise.resolve();
  async function acquire(){
   const previous=tail;let release;
   tail=new Promise(resolve=>{release=resolve;});await previous;
   const query=async(sql,params)=>{
    const result=params?await db.query(sql,params):(await db.exec(sql)).at(-1);
    return {...result,rowCount:result.rows?.length||result.affectedRows||0};
   };
   return {query,release};
  }
  pool={
   mode:'pglite',
   connect:acquire,
   async query(sql,params){const client=await acquire();try{return await client.query(sql,params);}finally{client.release();}},
   async end(){await tail;await db.close();}
  };
 }
 await pool.query((await readFile(new URL('../db/schema.sql',import.meta.url),'utf8')).replace(/^\uFEFF/,''));
 for(const a of algorithms) await pool.query('INSERT INTO algorithms(id,content) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET content=$2',[a.id,JSON.stringify(a)]);
 for(const q of questions) await pool.query('INSERT INTO questions(id,algorithm_id,purpose,content) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET content=$4',[q.id,q.algorithm,q.purpose,JSON.stringify(q)]);
 return pool;
}
