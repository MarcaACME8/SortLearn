import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {connectDatabase} from './src/database.js';
import {publicQuestion} from './src/content.js';
const root=resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const problem=(message,status=400)=>Object.assign(new Error(message),{status});
async function body(req) {
 let value='';
 for await(const chunk of req){value+=chunk;if(value.length>16000)throw problem('Solicitud demasiado grande.',413);}
 try{return JSON.parse(value||'{}');}catch{throw problem('Solicitud inválida.');}
}
export function createApp(pool) {
 return http.createServer(async(req,res)=>{
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
   if(req.method!=='GET' && req.headers.origin && req.headers.origin!== 'http://'+req.headers.host)throw problem('Origen no permitido.',403);
   if(req.method==='POST' && !req.headers['content-type']?.startsWith('application/json'))throw problem('Se requiere JSON.',415);
   if(url.pathname==='/api/health'){send(200,{ok:!!(await pool.query('SELECT 1')).rowCount});return;}
   if(req.method==='POST' && url.pathname==='/api/session'){
    const {name}=await body(req);
    if(typeof name!=='string'||!name.trim()||name.trim().length>80)throw problem('Escribe tu nombre (máximo 80 caracteres).');
    const id=randomUUID();
    await pool.query('INSERT INTO learning_sessions(id,name) VALUES($1,$2)',[id,name.trim()]);
    res.setHeader('Set-Cookie','sortlearn='+id+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000');
    send(201,{name:name.trim()});return;
   }
   const token=req.headers.cookie?.match(/(?:^|;\s*)sortlearn=([a-f0-9-]{36})(?:;|$)/)?.[1];
   if(!token)throw problem('Inicia una sesión para continuar.',401);
   const db=await pool.connect();
   try{
    await db.query('BEGIN');
    const session=(await db.query('SELECT * FROM learning_sessions WHERE id=$1 FOR UPDATE',[token])).rows[0];
    if(!session)throw problem('La sesión ya no está disponible.',401);
    const evaluations=(await db.query('SELECT kind,correct,total,created_at FROM evaluations WHERE session_id=$1 ORDER BY created_at',[token])).rows;
    const diagnostic=evaluations.find(e=>e.kind==='diagnostic');
    const final=evaluations.find(e=>e.kind==='final');
    const state=session.state;
    const catalog=(await db.query('SELECT content FROM algorithms ORDER BY id')).rows.map(r=>r.content);
    const getQuestions=async purpose=>(await db.query('SELECT content FROM questions WHERE purpose=$1 ORDER BY id',[purpose])).rows.map(r=>r.content);
    let result;
    if(req.method==='GET' && url.pathname==='/api/session'){
     const attempts=(await db.query('SELECT question_id,answer,correct FROM exercise_attempts WHERE session_id=$1 ORDER BY id',[token])).rows;
     result={name:session.name,createdAt:session.created_at,state,evaluations,attempts,algorithms:catalog};
    }else if(req.method==='POST' && url.pathname==='/api/logout'){
     res.setHeader('Set-Cookie','sortlearn=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');result={ok:true};
    }else if(req.method==='POST' && url.pathname==='/api/viewed'){
     if(!diagnostic)throw problem('Completa primero la evaluación diagnóstica.',409);
     const {algorithm}=await body(req);
     if(!catalog.some(a=>a.id===algorithm))throw problem('Algoritmo inválido.');
     state.viewed=[...new Set([...state.viewed,algorithm])];result={ok:true};
    }else if(req.method==='GET' && url.pathname==='/api/questions'){
     const kind=url.searchParams.get('kind');
     if(!['diagnostic','final','exercise'].includes(kind))throw problem('Evaluación inválida.');
     if(kind!=='diagnostic' && !diagnostic)throw problem('Completa primero el diagnóstico.',409);
     if(kind==='final' && (state.viewed.length<4||state.practiced.length<4))throw problem('Consulta y practica los cuatro algoritmos antes de la evaluación final.',409);
     result=(await getQuestions(kind)).map(publicQuestion);
    }else if(req.method==='POST' && url.pathname==='/api/draft'){
     const {kind,answers}=await body(req);
     if(!['diagnostic','final'].includes(kind)||!answers||typeof answers!=='object'||Array.isArray(answers))throw problem('Borrador inválido.');
     if(kind==='final' && (!diagnostic||state.viewed.length<4||state.practiced.length<4))throw problem('Completa el recorrido antes de la evaluación final.',409);
     if(evaluations.some(e=>e.kind===kind))throw problem('Esta evaluación ya se completó.',409);
     const bank=await getQuestions(kind);
     const valid={};
     for(const q of bank)if(Object.hasOwn(answers,q.id)){
      if(!Number.isInteger(answers[q.id])||answers[q.id]<0||answers[q.id]>=q.options.length)throw problem('Respuesta inválida.');
      valid[q.id]=answers[q.id];
     }
     state.drafts[kind]=valid;result={ok:true};
    }else if(req.method==='POST' && url.pathname==='/api/evaluate'){
     const {kind,answers}=await body(req);
     if(!['diagnostic','final'].includes(kind))throw problem('Evaluación inválida.');
     if(evaluations.some(e=>e.kind===kind))throw problem('La evaluación ya fue guardada.',409);
     if(kind==='final'&&(!diagnostic||state.viewed.length<4||state.practiced.length<4))throw problem('Completa el diagnóstico y el recorrido de aprendizaje.',409);
     const bank=await getQuestions(kind);
     if(!answers||bank.some(q=>!Number.isInteger(answers[q.id])||answers[q.id]<0||answers[q.id]>=q.options.length))throw problem('Responde todas las preguntas antes de finalizar.');
     const correct=bank.filter(q=>answers[q.id]===q.answer).length;
     await db.query('INSERT INTO evaluations(session_id,kind,answers,correct,total) VALUES($1,$2,$3,$4,$5)',[token,kind,answers,correct,bank.length]);
     delete state.drafts[kind];result={kind,correct,total:bank.length};
    }else if(req.method==='POST' && url.pathname==='/api/exercise'){
     if(!diagnostic)throw problem('Completa el diagnóstico.',409);
     const {id,answer}=await body(req);
     const q=(await getQuestions('exercise')).find(q=>q.id===id);
     if(!q||!Number.isInteger(answer)||answer<0||answer>=q.options.length)throw problem('Selecciona una respuesta válida.');
     if(!state.viewed.includes(q.algorithm))throw problem('Consulta primero el contenido del algoritmo.',409);
     const correct=answer===q.answer;
     await db.query('INSERT INTO exercise_attempts(session_id,question_id,answer,correct) VALUES($1,$2,$3,$4)',[token,id,answer,correct]);
     state.practiced=[...new Set([...state.practiced,q.algorithm])];
     result={correct,explanation:q.explanation,correctAnswer:q.answer};
    }else throw problem('Ruta no disponible.',404);
    await db.query('UPDATE learning_sessions SET state=$2 WHERE id=$1',[token,state]);
    await db.query('COMMIT');send(200,result);
   }catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}
   return;
  }
  if(req.method!=='GET' && req.method!=='HEAD')throw problem('Método no permitido.',405);
  const pathname=decodeURIComponent(url.pathname);
  const target=pathname==='/algorithms.js'?fileURLToPath(new URL('./src/algorithms.js',import.meta.url)):resolve(root,'.'+pathname);
  if(pathname!=='/algorithms.js'&&target!==root&&!target.startsWith(root+sep))throw problem('Ruta inválida.',403);
  const file=target===root?resolve(root,'index.html'):target;
  let data;try{data=await readFile(file);}catch{throw problem('Archivo no disponible.',404);}
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
  res.writeHead(200,{'Content-Type':(types[extname(file)]||'application/octet-stream')+'; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch(error){if(!error.status)console.error(error.message);send(error.status||500,{error:error.status?error.message:'No fue posible completar la operación. Inténtalo nuevamente.'});}
 });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const pool=await connectDatabase();const server=createApp(pool);server.listen(Number(process.env.PORT||3100),'127.0.0.1',()=>console.log('SortLearn: http://127.0.0.1:'+(process.env.PORT||3100)));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await pool.end();process.exit(0);}));
 }catch(error){console.error('No se pudo iniciar SortLearn. Ejecuta npm run db:start y revisa DATABASE_URL. '+error.message);process.exitCode=1;}
}
