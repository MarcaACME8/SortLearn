import {createHandler} from '../server.js';
import {connectDatabase} from '../src/database.js';
let ready;
export default async function handler(req,res) {
 try {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required on Vercel');
  ready ??= connectDatabase().then(createHandler).catch(error=>{ready=undefined;throw error;});
  return await (await ready)(req,res);
 } catch(error) {
  console.error('Database initialization failed:', error.message);
  res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify({error:'Servicio temporalmente no disponible.'}));
 }
}
