import {traceSort,Playback} from '/algorithms.js';
const main=document.querySelector('#main'),header=document.querySelector('#header');
let session=null,active='bubble',filter='all',player=null,timer=null,speed=800,exam=null,exercise=null,feedback=null,routeVersion=0,busy=false;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=(file,alt='',cls='icon')=>'<img class="'+cls+'" src="/assets/'+file+'" alt="'+escape(alt)+'">';
const link=(route,label,cls='secondary')=>'<a class="'+cls+'" href="#'+route+'">'+label+'</a>';
const notice=message=>{document.querySelector('#notice').textContent=message;clearTimeout(notice.timeout);notice.timeout=setTimeout(()=>document.querySelector('#notice').textContent='',6500);};
async function api(path,data){
 const response=await fetch('/api/'+path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
 const payload=await response.json();
 if(!response.ok){const error=new Error(payload.error||'No fue posible completar la operación.');error.status=response.status;throw error;}
 return payload;
}
const refresh=async(version=routeVersion)=>{const current=await api('session');if(version!==routeVersion)return false;session=current;renderHeader();return true;};
const alg=()=>session.algorithms.find(a=>a.id===active);
const hasDiagnostic=()=>session?.evaluations.some(e=>e.kind==='diagnostic');
const hasFinal=()=>session?.evaluations.some(e=>e.kind==='final');
const completed=()=>session?.state.practiced.length||0;
const stop=()=>{clearInterval(timer);timer=null;};
function renderHeader(){
 const current=location.hash.slice(1).split('/')[0]||'home';
 header.innerHTML='<div class="header-inner"><a class="brand" href="#home">'+img('897cb.png','SortLearn','')+'<span class="brand-word">Sort<span class="blue">Learn</span></span></a><nav aria-label="Navegación principal">'+[['home','Inicio'],['catalog','Algoritmos'],['visual/'+active,'Visualizador'],['exercise/'+active,'Ejercicios'],['exam','Evaluación'],['results','Comparativa']].map(([r,t])=>'<a class="'+(current===r.split('/')[0]?'active':'')+'" href="#'+r+'">'+t+'</a>').join('')+'</nav><div class="header-progress mono">RUTA '+completed()+'/4<progress max="4" value="'+completed()+'" aria-label="Progreso del recorrido"></progress></div><button class="help-button" data-action="help">'+img('7902f.svg')+'¿Necesitas ayuda?</button>'+(session?'<div class="identity">'+img('d5f4c.png','','profile')+'<div><div class="identity-name">'+escape(session.name)+'</div><button class="logout" data-action="logout">Cambiar estudiante</button></div></div>':'')+'</div>';
}
function values(array,indices=[]){return '<div class="values">'+array.map((v,i)=>'<div class="value-box '+(indices.includes(i)?'active':'')+'">'+v+'<small>['+i+']</small></div>').join('')+'</div>';}
function home(){
 main.innerHTML='<section class="home"><div class="home-intro"><span class="badge">APRENDE A TU RITMO · INGENIERÍA DE SISTEMAS</span><h1>¡Hola! Bienvenido al mundo de los<br><span class="blue">Algoritmos de Ordenamiento</span></h1><p class="lead">Una experiencia interactiva y visual diseñada para comprender cómo las computadoras organizan datos paso a paso.</p></div>'+
 (session?'<div class="card name-card center"><h2>¡Hola, '+escape(session.name)+'!</h2><p>Tu recorrido de aprendizaje está guardado.</p>'+link(hasDiagnostic()?'catalog':'exam/diagnostic','Continuar aprendiendo '+img('77060.svg'),'primary')+'</div>':
 '<form id="name-form" class="card name-card"><div class="row between wrap"><label for="student-name">¿Cómo te gustaría que te llamemos?</label><span class="mono muted">PASO 1 DE 3</span></div><div class="input-wrap">'+img('07fdb.svg')+'<input id="student-name" name="name" type="text" maxlength="80" autocomplete="given-name" placeholder="Escribe tu nombre aquí (ej. Camila)" aria-describedby="name-error"></div><button class="primary" type="submit">Comenzar a Aprender '+img('77060.svg')+'</button><p id="name-error" class="error" role="alert"></p><p class="privacy mono">'+img('e5041.svg')+'Sin contraseñas · Tu sesión se recuerda en este navegador y tu progreso se guarda automáticamente.</p></form>')+
 '<div class="three features">'+[['f2dd9.svg','Descubre el concepto','Explicaciones claras y analogías cotidianas sin jerga técnica pesada ni intimidante.'],['856de.svg','Visualiza en vivo','Observa cómo se comparan e intercambian las barras de datos a tu propia velocidad.'],['82715.svg','Practica y domina','Pon a prueba tu intuición lógica resolviendo retos paso a paso sin presión.']].map(([icon,title,text],i)=>'<article class="card"><div class="feature-icon">'+img(icon)+'</div><div class="eyebrow">FASE '+(i+1)+'</div><h3>'+(i+1)+'. '+title+'</h3><p>'+text+'</p></article>').join('')+'</div><div class="home-algos"><span>'+img('b1f5c.svg')+' Burbuja</span><span>'+img('56183.svg')+' Inserción</span><span>'+img('0714d.svg')+' Mezcla</span><span>'+img('8ed96.svg')+' Quicksort</span></div></section>';
}
function catalog(){
 const list=session.algorithms.filter(a=>filter==='all'||a.group===filter).sort((a,b)=>['bubble','insertion','merge','quick'].indexOf(a.id)-['bubble','insertion','merge','quick'].indexOf(b.id));
 main.innerHTML='<section class="card hero"><div><span class="badge">MÓDULO ACTIVO · ESTRUCTURAS DE DATOS</span><div class="greeting">¡Qué alegría tenerte aquí, '+escape(session.name)+'! 👋</div><h1>Selecciona el algoritmo que deseas explorar hoy</h1><p>Hemos ordenado los algoritmos de menor a mayor complejidad para facilitar tu aprendizaje secuencial e intuitivo.</p></div><div class="metric"><span class="mono">'+img('888b0.svg')+' Progreso de Ruta</span><div><strong>'+completed()+'/4</strong> <small>practicados</small></div></div></section><div class="filters"><div class="segmented">'+[['all','Todos (4)'],['basic','Básicos / Iterativos'],['advanced','Avanzados / Divide y Vencerás']].map(([id,label])=>'<button data-filter="'+id+'" class="'+(filter===id?'active':'')+'" aria-pressed="'+(filter===id)+'">'+label+'</button>').join('')+'</div><span class="mono">'+img('2fa04.svg')+' Orden: Progresión pedagógica</span></div><div class="grid">'+list.map(a=>'<article class="card algorithm-card" data-color="'+a.color+'"><div class="row between"><span class="badge '+a.color+'">NIVEL: '+a.level+'</span><span class="complexity">'+img('aec7c.svg')+' '+(a.group==='basic'?'Tiempo: O(n²)':'Tiempo: O(n log n)')+(a.id==='quick'?' promedio':'')+'</span></div><h2>'+a.name+' <span>('+a.spanish+')</span></h2><p>'+a.description+'</p><div class="preview"><div class="preview-title"><span>'+img(a.id==='bubble'?'421c6.svg':a.id==='insertion'?'1c7d5.svg':a.id==='merge'?'83bad.svg':'089e7.svg')+' '+(a.id==='merge'?'Fusión de subarreglos':a.id==='quick'?'Partición y selección de pivote':'Vista previa de recorrido')+'</span><span class="'+a.color+'">'+(session.state.practiced.includes(a.id)?'Practicado ✓':'Por explorar')+'</span></div><div class="mini-bars" aria-hidden="true">'+a.preview.map(v=>'<i style="height:'+v+'px"></i>').join('')+'</div></div>'+link('theory/'+a.id,'Explorar '+a.name+' '+img('d63dd.svg'))+'</article>').join('')+'</div><aside class="recommendation">'+img('966f9.svg')+'<div><strong>¿No sabes por dónde empezar?</strong><p>Te recomendamos iniciar con <b class="blue">Bubble Sort</b> para asimilar el concepto de punteros contiguos e intercambios.</p></div>'+link('theory/bubble','Empezar con Bubble Sort '+img('af966.svg'))+'</aside>';
}
function theory(){
 const a=alg();
 main.innerHTML='<div class="breadcrumb">'+link('catalog','Algoritmos','')+' › '+a.name+' › Teoría y Concepto</div><section class="theory-intro"><span class="badge">ORDENAMIENTO POR COMPARACIÓN</span><h1>'+a.name+': Entendiendo la<br><span class="blue">'+(a.id==='bubble'?'Lógica de la Burbuja':'lógica de '+a.spanish.toLowerCase())+'</span></h1><p>Aprende la idea intuitiva antes de ver el código o las matemáticas.</p></section><div class="grid theory-grid"><div class="stack"><article class="card"><div class="row"><div class="feature-icon">'+img('f3ebf.svg')+'</div><div><div class="eyebrow">ANALOGÍA COTIDIANA</div><h3>'+a.analogy+'</h3></div></div><p>'+a.detail+'</p><div class="soft row between"><span class="badge">1</span><span class="mono blue">De menor a mayor '+img('af966.svg')+'</span><span class="badge">8</span></div></article><article class="card"><div class="eyebrow purple">EL ALGORITMO DESARMADO</div><h3>¿Cómo funciona en 3 simples pasos?</h3><div class="rules">'+a.rules.map((rule,i)=>'<div class="rule"><span class="number">'+(i+1)+'</span><p>'+rule+'</p></div>').join('')+'</div></article></div><div class="stack"><article class="card"><div class="eyebrow">DEMOSTRACIÓN GRÁFICA</div><h3>Paso a paso: el primer cambio</h3><p>Tomamos el arreglo <code>[5, 1, 4, 2, 8]</code>.</p><div class="soft">'+values([5,1,4,2,8],[0,1])+'<p class="mono">'+escape(traceSort(a.id,[5,1,4,2,8]).find(s=>s.kind==='swap'||s.kind==='write').description)+'</p>'+values(traceSort(a.id,[5,1,4,2,8]).find(s=>s.kind==='swap'||s.kind==='write').values)+'</div></article><article class="card"><h3>'+img('7b263.svg')+' Complejidad sin Complicaciones</h3><div class="facts">'+[['Mejor caso',a.best],['Peor caso',a.worst],['¿Es estable?',a.stable],['Espacio auxiliar',a.space]].map(([k,v])=>'<div class="fact"><span>'+k+'</span><code>'+v+'</code></div>').join('')+'</div><p class="storage-note mt">La memoria indicada corresponde al algoritmo. El visualizador usa memoria adicional para guardar los pasos.</p></article></div></div><div class="card actionbar">'+link('catalog','← Volver a Selección')+'<p>'+img('fdf63.svg')+' Explora los cambios sobre los datos</p>'+link('visual/'+a.id,'Ver en Acción (Paso a Paso) '+img('77060.svg'),'primary')+'</div>';
}
function visual(){
 if(!player)player=new Playback(traceSort(active,[28,12,45,35,80]));
 const a=alg(),s=player.current,history=player.steps.slice(0,player.index+1),max=Math.max(1,...s.values.map(v=>Math.abs(v)));
 main.innerHTML='<section class="card row between visual-header"><div><span class="badge">ALGORITMO ACTIVO</span><h2>'+a.name+' · Modo Interactivo</h2><p aria-live="polite">'+img('e08d6.svg')+' '+escape(s.description)+'</p></div><span class="badge">Paso '+(player.index+1)+' de '+player.steps.length+'</span></section><section class="card visual-card"><div class="row between wrap"><span class="mono">ÍNDICES DE ARREGLO [0 .. '+(s.values.length-1)+'] · N = '+s.values.length+'</span><div class="legend"><span><i class="dot"></i>Sin evaluar</span><span><i class="dot purple"></i>Activo</span><span><i class="dot green"></i>Ordenado</span></div></div><div class="bars" role="img" aria-label="'+escape(s.values.join(', '))+'. '+escape(s.description)+'">'+s.values.map((v,i)=>'<div class="bar-column '+(s.kind==='complete'?'done':s.indices[0]===i?'active':s.indices.includes(i)?'secondary-active':'')+'"><span class="bar-label">'+v+'</span><div class="bar" style="height:'+Math.max(8,Math.abs(v)/max*220)+'px">'+v+'</div><span class="bar-index">['+i+']</span></div>').join('')+'</div></section><div class="grid controls-grid"><section class="card"><div class="row between"><span class="eyebrow">CONTROL DE EJECUCIÓN</span><small>Modo paso a paso asistido</small></div><div class="play-controls"><button class="round" data-action="reset" aria-label="Reiniciar">'+img('7cec6.svg')+'</button><button class="round" data-action="previous" aria-label="Paso anterior" '+(player.index===0?'disabled':'')+'>'+img('f5981.svg')+'</button><button class="primary" data-action="play" '+(s.kind==='complete'?'disabled':'')+'>'+img('3246b.svg')+' '+(timer?'Pausar':'Continuar')+'</button><button class="round" data-action="next" aria-label="Paso siguiente" '+(s.kind==='complete'?'disabled':'')+'>'+img('d0f76.svg')+'</button></div><div class="row between wrap"><label>Velocidad de Simulación <select id="speed"><option value="1400" '+(speed===1400?'selected':'')+'>Lento</option><option value="800" '+(speed===800?'selected':'')+'>Normal</option><option value="250" '+(speed===250?'selected':'')+'>Rápido</option></select></label><button class="secondary" data-action="random">'+img('67181.svg')+' Aleatorio</button></div><form id="numbers-form" class="custom-input"><input type="text" id="numbers" aria-label="Mis números separados por comas" placeholder="Mis números: 5, 1, 4, 2, 8"><button class="secondary" type="submit">'+img('b13a5.svg')+' Aplicar</button></form><small>Entre 2 y 12 números, de −999 a 999. Separados por comas.</small></section><section class="card"><div class="eyebrow">'+img('e04f2.svg')+' PSEUDOCÓDIGO EN VIVO</div><div class="code">'+a.code.map((line,i)=>'<div class="'+(i===s.codeLine?'current':'')+'">'+(i+1)+'  '+escape(line)+'</div>').join('')+'</div><div class="stats"><div><span>Comparaciones</span>'+history.filter(s=>s.kind==='compare').length+'</div><div><span>Intercambios / copias</span>'+history.filter(s=>['swap','write'].includes(s.kind)).length+'</div><div><span>Estado</span>'+(s.kind==='complete'?'Terminado':'En proceso')+'</div></div></section></div><aside class="recommendation">'+img('9f23d.svg')+'<div><strong>Nota didáctica</strong><p>'+a.detail+(a.id==='merge'?' Durante las copias, la lista visible puede repetir valores temporalmente; los originales permanecen en las mitades auxiliares.':'')+'</p></div>'+link('exercise/'+a.id,'Practicar '+img('af966.svg'))+'</aside>';
}
const options=(q,selected)=>q.options.map((text,i)=>'<button class="option '+(selected===i?'selected':'')+'" data-answer="'+i+'" role="radio" aria-checked="'+(selected===i)+'"><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+escape(text)+'</span></button>').join('');
function exerciseView(){
 const a=alg(),q=exercise.question;
 main.innerHTML='<section class="exercise"><span class="badge">PRÁCTICA GUIADA · '+a.name+'</span><h1>¿Cuál es el siguiente paso?</h1><p>Observa el arreglo actual de <b class="blue">'+a.name+'</b> y selecciona qué acción lógica debe ejecutarse.</p><div class="grid exercise-grid"><article class="card exercise-values"><span class="mono">ESTADO DEL VECTOR · MEMORIA</span>'+values(q.values,a.id==='bubble'?[1,2]:[])+'<div class="soft"><strong>'+img('1df81.svg')+' Razonamiento paso a paso</strong><p>'+a.rules[0]+'</p></div></article><div class="stack"><div class="card"><span class="eyebrow">PREGUNTA DE RAZONAMIENTO</span><h3>'+escape(q.prompt)+'</h3></div><div class="options" role="radiogroup" aria-label="Respuesta al ejercicio">'+options(q,exercise.answer)+'</div></div></div><div class="card actionbar"><p>'+img('4a51d.svg')+' <b>Pista:</b> '+a.rules[1]+'</p><span class="mono">MÓDULOS PRACTICADOS '+completed()+' DE 4</span><button class="primary" data-action="check" '+(busy?'disabled':'')+'>Comprobar mi respuesta '+img('bc582.svg')+'</button></div></section>';
}
function feedbackView(){
 const a=alg(),q=exercise.question;
 main.innerHTML='<section class="feedback"><div class="row between mb"><span class="badge">MÓDULO · '+a.name+'</span><span class="mono green">PRÁCTICA REGISTRADA</span></div><div class="card feedback-main"><div class="success-icon '+(feedback.correct?'':'incorrect')+'">'+(feedback.correct?img('a0cd9.svg'):'↻')+'</div><span class="badge '+(feedback.correct?'green':'')+'">'+(feedback.correct?'¡Excelente deducción, ':'Sigamos aprendiendo, ')+escape(session.name)+'!</span><h1 class="mt">'+(feedback.correct?'¡Respuesta Correcta!':'Revisemos la respuesta')+'</h1><p>'+escape(feedback.explanation)+'</p><div class="soft"><div class="eyebrow">CONCEPTO CLAVE REFORZADO</div><h3>'+escape(q.options[feedback.correctAnswer])+'</h3>'+values(q.values)+'<p>'+a.detail+'</p></div><p class="mono">Intento guardado · '+completed()+' de 4 algoritmos practicados</p><div class="feedback-actions"><button class="secondary" data-action="retry">'+img('f5661.svg')+' Intentar de nuevo</button>'+link('catalog','Siguiente algoritmo '+img('03d99.svg'),'primary')+(completed()===4?link('exam/final','Evaluación final','primary'):'')+'</div></div></section>';
}
function examView(){
 const q=exam.questions[exam.index],count=Object.keys(exam.answers).length;
 main.innerHTML='<section class="exam"><div class="exam-head"><span class="eyebrow">'+img('f68bb.svg')+' MÓDULO CS101 · AUTOEVALUACIÓN SIN PENALIZACIÓN</span><div class="row between wrap"><h1>Evaluación '+(exam.kind==='diagnostic'?'Diagnóstica':'Final')+': Algoritmos de Ordenamiento</h1><span class="badge">'+img('ea6a3.svg')+' Sin límite estricto</span></div><div class="exam-progress"><span>Progreso del examen</span><span class="mono blue">'+count+' de '+exam.questions.length+' respondidas</span></div><progress value="'+count+'" max="'+exam.questions.length+'" aria-label="Preguntas respondidas"></progress></div><article class="card question-card"><div class="row between wrap"><span class="badge">'+q.algorithm.toUpperCase()+' SORT</span><button class="text-button" data-action="mark">'+img('e6267.svg')+' '+(exam.marked.has(q.id)?'Marcada para revisar':'Marcar para revisar después')+'</button></div><p class="mono mt">ENUNCIADO '+String(exam.index+1).padStart(2,'0')+'</p><h2>'+escape(q.prompt)+'</h2><div class="options" role="radiogroup" aria-label="Respuesta a la pregunta">'+options(q,exam.answers[q.id])+'</div><div class="soft mt">'+img('54d98.svg')+' Responde según lo que sabes. El diagnóstico permite comparar tus conocimientos antes y después del recorrido.</div></article><div class="exam-actions"><button class="secondary" data-action="exam-prev" '+(exam.index===0?'disabled':'')+'>← Pregunta Anterior</button><span id="save-status" class="save-status">'+(exam.saved?'Respuesta guardada automáticamente ●':'Selecciona una respuesta')+'</span>'+(exam.index<exam.questions.length-1?'<button class="primary" data-action="exam-next">Guardar y Siguiente Pregunta '+img('03d99.svg')+'</button>':'<button class="primary" data-action="finish" '+(busy?'disabled':'')+'>Finalizar evaluación '+img('03d99.svg')+'</button>')+'</div><div class="card question-nav"><span class="mono">'+img('5ec7c.svg')+' Cuadrícula rápida de navegación:</span><div class="row wrap">'+exam.questions.map((q,i)=>'<button data-question="'+i+'" aria-label="Pregunta '+(i+1)+'" class="'+(exam.index===i?'current':Object.hasOwn(exam.answers,q.id)?'answered':'')+' '+(exam.marked.has(q.id)?'marked':'')+'">'+(i+1)+'</button>').join('')+'</div></div></section>';
}
function results(){
 const diagnostic=session.evaluations.find(e=>e.kind==='diagnostic'),final=session.evaluations.find(e=>e.kind==='final');
 const pct=e=>e?Math.round(e.correct/e.total*10000)/100:null;
 if(!diagnostic){main.innerHTML='<section class="card empty"><h1>Aún no hay resultados</h1><p>Completa la evaluación diagnóstica para conocer tu punto de partida.</p>'+link('exam/diagnostic','Comenzar diagnóstico','primary')+'</section>';return;}
 const latest=final||diagnostic,score=pct(latest),delta=final?Math.round((pct(final)-pct(diagnostic))*100)/100:null;
 main.innerHTML='<section class="card result-hero"><div class="hero"><div><span class="badge green">'+(final?'RECORRIDO COMPLETADO':'DIAGNÓSTICO COMPLETADO')+'</span><h1 class="mt">'+(final?'¡Terminaste, ':'Tu punto de partida, ')+escape(session.name)+'!</h1><p>'+(final?'Estos son tus resultados reales antes y después de estudiar los algoritmos.':'Ya conocemos tus conocimientos iniciales. Explora los contenidos y practica para continuar con la evaluación final.')+'</p></div><div class="result-score"><div class="score-ring" style="--score:'+score+'%"><div><strong>'+score.toLocaleString('es-CO')+'</strong><span class="mono">DE 100</span></div></div><span class="badge">'+latest.correct+' de '+latest.total+' respuestas correctas</span></div></div><div class="three result-metrics"><div class="soft"><span class="eyebrow">EVALUACIÓN DIAGNÓSTICA</span><strong>'+pct(diagnostic).toLocaleString('es-CO')+' %</strong></div><div class="soft"><span class="eyebrow">EVALUACIÓN FINAL</span><strong>'+(final?pct(final).toLocaleString('es-CO')+' %':'Pendiente')+'</strong></div><div class="soft"><span class="eyebrow">VARIACIÓN DEL DESEMPEÑO</span><strong class="'+(delta<0?'negative':'green')+'">'+(delta===null?'Pendiente':(delta>0?'+':'')+delta.toLocaleString('es-CO')+' pp')+'</strong><small>'+(delta===null?'Requiere ambas evaluaciones.':'Diferencia en puntos porcentuales.')+'</small></div></div></section><div class="comparison-title"><div class="eyebrow">SÍNTESIS TEÓRICA · NOTACIÓN ASINTÓTICA</div><h2>Tabla Comparativa Didáctica de Algoritmos</h2><p>Compara tiempo, memoria auxiliar y contexto de aplicación.</p></div><div class="table-wrap"><table><thead><tr><th>ALGORITMO</th><th>MEJOR CASO</th><th>PEOR CASO</th><th>ESPACIO EN MEMORIA</th><th>¿CUÁNDO CONVIENE USARLO?</th><th>ACCIÓN</th></tr></thead><tbody>'+session.algorithms.sort((a,b)=>['bubble','insertion','merge','quick'].indexOf(a.id)-['bubble','insertion','merge','quick'].indexOf(b.id)).map(a=>'<tr><td>'+a.name+'</td><td><code>'+a.best+'</code></td><td><code>'+a.worst+'</code></td><td>'+a.space+'</td><td>'+a.use+'</td><td>'+link('visual/'+a.id,img('73f46.svg'),'text-button')+'</td></tr>').join('')+'</tbody></table></div><div class="card actionbar"><div><h3>¿Listo para el siguiente paso formativo?</h3><p>Guarda tus resultados o continúa experimentando en el laboratorio.</p></div><div class="row wrap"><button class="secondary" data-action="print">'+img('0bfe4.svg')+' Imprimir / Guardar PDF</button>'+link(final?'visual/'+active:completed()===4?'exam/final':'catalog',final?'Explorar Visualizador Libre':completed()===4?'Realizar evaluación final':'Continuar aprendiendo','primary')+'</div></div>';
}
async function route(){
 const version=++routeVersion;stop();busy=false;
 const [page='home',id]=(location.hash.slice(1)||'home').split('/');
 renderHeader();
 if(!session&&page!=='home'){location.hash='home';notice('Ingresa tu nombre para iniciar tu sesión de aprendizaje.');return;}
 if(page==='home'||!page){home();return;}
 if(!hasDiagnostic()&&!['exam','results'].includes(page)){location.hash='exam/diagnostic';notice('Primero completa el diagnóstico para registrar tu punto de partida.');return;}
 try{
  if(['theory','visual','exercise'].includes(page)){
   active=session.algorithms.some(a=>a.id===id)?id:'bubble';renderHeader();
  }
  if(page==='catalog'){catalog();}
  else if(page==='theory'){await api('viewed',{algorithm:active});if(version!==routeVersion)return;await refresh(version);if(version===routeVersion)theory();}
  else if(page==='visual'){if(!session.state.viewed.includes(active)){location.hash='theory/'+active;return;}player=new Playback(traceSort(active,[28,12,45,35,80]));visual();}
  else if(page==='exercise'){
   if(!session.state.viewed.includes(active)){location.hash='theory/'+active;return;}
   const bank=await api('questions?kind=exercise');if(version!==routeVersion)return;
   exercise={question:bank.find(q=>q.algorithm===active),answer:undefined};feedback=null;exerciseView();
  }else if(page==='exam'){
   const kind=id==='diagnostic'?'diagnostic':id==='final'?'final':hasDiagnostic()?'final':'diagnostic';
   if(session.evaluations.some(e=>e.kind===kind)){location.hash='results';return;}
   if(kind==='final'&&(session.state.viewed.length<4||completed()<4)){main.innerHTML='<section class="card empty"><h1>Completa tu recorrido</h1><p>Consulta el contenido y responde el ejercicio de cada uno de los cuatro algoritmos. Llevas '+completed()+' de 4 practicados.</p>'+link('catalog','Volver a los algoritmos','primary')+'</section>';return;}
   const bank=await api('questions?kind='+kind);if(version!==routeVersion)return;
   exam={kind,questions:bank,index:0,answers:session.state.drafts[kind]||{},marked:new Set(),saved:false};examView();
  }else if(page==='results'){await refresh(version);if(version===routeVersion)results();}
  else{location.hash='home';}
  main.focus({preventScroll:true});window.scrollTo(0,0);
 }catch(error){if(version===routeVersion)main.innerHTML='<section class="card empty"><h2>No pudimos cargar esta sección</h2><p>'+escape(error.message)+'</p><button class="primary" data-action="reload">Volver a intentar</button></section>';}
}
function run(){stop();timer=setInterval(()=>{player.next();if(player.index===player.steps.length-1)stop();visual();},speed);visual();}
document.addEventListener('submit',async event=>{
 event.preventDefault();
 if(event.target.id==='name-form'){
  const button=event.target.querySelector('button');button.disabled=true;
  try{await api('session',{name:document.querySelector('#student-name').value});await refresh();location.hash='exam/diagnostic';}
  catch(error){document.querySelector('#name-error').textContent=error.message;button.disabled=false;}
 }
 if(event.target.id==='numbers-form'){
  const raw=document.querySelector('#numbers').value.split(',').map(v=>v.trim());
  const nums=raw.map(Number);
  if(raw.some(v=>!v)||nums.length<2||nums.length>12||nums.some(v=>!Number.isFinite(v)||Math.abs(v)>999)){notice('Ingresa entre 2 y 12 números válidos, de −999 a 999, separados por comas.');return;}
  stop();player=new Playback(traceSort(active,nums));visual();
 }
});
document.addEventListener('change',event=>{if(event.target.id==='speed'){speed=Number(event.target.value);if(timer)run();}});
document.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;
 try{
  const action=button.dataset.action; if(action==='skip'){main.focus();main.scrollIntoView();return;}
  if(action==='help'){document.querySelector('#help').showModal();return;}
  if(button.id==='close-help'){document.querySelector('#help').close();return;}
  if(action==='logout'){++routeVersion;stop();await api('logout',{});session=null;exam=null;exercise=null;location.hash='home';renderHeader();home();return;}
  if(action==='reload'){await route();return;}
  if(button.dataset.filter){filter=button.dataset.filter;catalog();return;}
  if(['next','previous','reset','play','random'].includes(action)){
   if(action==='play'){if(timer){stop();visual();}else run();return;}
   stop();if(action==='next')player.next();if(action==='previous')player.previous();if(action==='reset')player.reset();
   if(action==='random')player=new Playback(traceSort(active,Array.from({length:5},()=>Math.floor(Math.random()*90)+10)));
   visual();return;
  }
  if(button.dataset.answer!==undefined){
   if(busy)return;
   const answer=Number(button.dataset.answer);
   if(location.hash.startsWith('#exam')){
    busy=true;const target=exam;const q=target.questions[target.index];const next={...target.answers,[q.id]:answer};
    button.disabled=true; document.querySelector('#save-status').textContent='Guardando respuesta…';
    const version=routeVersion;
    try{await api('draft',{kind:target.kind,answers:next});target.answers=next;target.saved=true;if(version===routeVersion){busy=false;if(exam===target&&location.hash.startsWith('#exam'))examView();}}
    finally{if(version===routeVersion)busy=false;button.disabled=false;}
   }else if(exercise){exercise.answer=answer;exerciseView();}
   return;
  }
  if(action==='check'){
   if(busy)return;if(exercise.answer===undefined){notice('Selecciona una respuesta antes de continuar.');return;}
   busy=true;button.disabled=true;const version=routeVersion,target=exercise;
   try{const result=await api('exercise',{id:target.question.id,answer:target.answer});if(version!==routeVersion)return;if(!await refresh(version))return;feedback=result;feedbackView();}finally{if(version===routeVersion)busy=false;button.disabled=false;}
  }
  if(action==='retry'){exercise.answer=undefined;feedback=null;exerciseView();}
  if(action==='mark'){const id=exam.questions[exam.index].id;exam.marked.has(id)?exam.marked.delete(id):exam.marked.add(id);examView();}
  if(busy)return;
  if(action==='exam-prev'){exam.index=Math.max(0,exam.index-1);examView();}
  if(action==='exam-next'){if(exam.answers[exam.questions[exam.index].id]===undefined){notice('Responde esta pregunta antes de avanzar.');return;}exam.index++;examView();}
  if(button.dataset.question!==undefined){exam.index=Number(button.dataset.question);examView();}
  if(action==='finish'){
   const pending=exam.questions.findIndex(q=>!Object.hasOwn(exam.answers,q.id));
   if(pending!==-1){exam.index=pending;examView();notice('Completa todas las preguntas antes de finalizar.');return;}
   busy=true;button.disabled=true;const version=routeVersion,target=exam;
   try{await api('evaluate',{kind:target.kind,answers:target.answers});if(version!==routeVersion)return;if(!await refresh(version))return;location.hash='results';}finally{if(version===routeVersion)busy=false;button.disabled=false;}
  }
  if(action==='print')window.print();
 }catch(error){notice(error.message);}
});
window.addEventListener('hashchange',route);
try{await refresh();}catch(error){if(error.status!==401)notice('No se pudo conectar con el servidor. '+error.message);}
await route();
