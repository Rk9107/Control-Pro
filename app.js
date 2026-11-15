const $ = (id) => document.getElementById(id);
const dateKey = (d=new Date()) => {const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`};
const today = () => dateKey();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
const defaultState = () => ({
  version:1, activeProfileId:"cashier",
  profiles:[
    {id:"cashier",name:"Cajero Principal",description:"Control operativo, efectivo, auditoría y seguimiento.",responsibilities:[
      {id:uid(),name:"Apertura y controles diarios",description:"Verificar documentación y controles de apertura.",area:"Operación"},
      {id:uid(),name:"Control de efectivo",description:"Seguimiento de dotaciones, cortes y diferencias.",area:"Efectivo"},
      {id:uid(),name:"Auditoría y arqueos",description:"Realizar revisiones y documentar resultados.",area:"Auditoría"},
      {id:uid(),name:"Cajero automático",description:"Revisar cortes, dotaciones y documentación ATM.",area:"ATM"},
      {id:uid(),name:"Indicadores y seguimiento",description:"Dar seguimiento a resultados y compromisos.",area:"Resultados"}
    ]},
    {id:"submanager",name:"Subgerente",description:"Gestión de equipo, operación y cumplimiento.",responsibilities:[
      {id:uid(),name:"Seguimiento operativo",description:"Supervisar la ejecución de procesos.",area:"Operación"},
      {id:uid(),name:"Gestión del equipo",description:"Organizar responsabilidades y dar retroalimentación.",area:"Personal"},
      {id:uid(),name:"Indicadores",description:"Revisar avances y compromisos.",area:"Resultados"}
    ]},
    {id:"manager",name:"Gerente",description:"Dirección, estrategia y resultados de sucursal.",responsibilities:[
      {id:uid(),name:"Resultados de sucursal",description:"Monitorear metas y desempeño.",area:"Resultados"},
      {id:uid(),name:"Gestión de personas",description:"Desarrollar al equipo y organizar prioridades.",area:"Personal"},
      {id:uid(),name:"Control y riesgos",description:"Dar seguimiento a controles y riesgos.",area:"Control"}
    ]}
  ],
  tasks:[],projects:[],journal:[],activity:[]
});
let state = loadState();
function loadState(){try{const raw=localStorage.getItem("controlProState");return raw?JSON.parse(raw):defaultState()}catch(e){return defaultState()}}
function save(){localStorage.setItem("controlProState",JSON.stringify(state));renderAll()}
function profile(){return state.profiles.find(p=>p.id===state.activeProfileId)||state.profiles[0]}
function log(message){state.activity.unshift({id:uid(),message,date:new Date().toISOString()});state.activity=state.activity.slice(0,30)}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2300)}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fmtDate(d){if(!d)return "Sin fecha";return new Date(d+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"})}
function activeTasks(){return state.tasks.filter(t=>t.profileId===state.activeProfileId)}
function priorityLabel(p){return p==="high"?"Alta":p==="medium"?"Media":"Baja"}
function taskMarkup(t){return `<div class="task-row ${t.done?"completed":""}"><input class="task-check" type="checkbox" data-check="${t.id}" ${t.done?"checked":""} ${(t.done||(t.due&&t.due>today()))?"disabled":""} aria-label="Completar tarea"><div class="task-main"><div class="task-name">${escapeHTML(t.name)}</div><div class="task-meta">${escapeHTML(t.area||"General")} · ${t.due?fmtDate(t.due):"Sin fecha"}${t.due&&t.due<today()&&!t.done?" · VENCIDA":""}</div></div><span class="priority ${t.priority}">${priorityLabel(t.priority)}</span><div class="task-actions"><button class="mini-button" data-edit-task="${t.id}" title="Editar">✎</button><button class="mini-button" data-delete-task="${t.id}" title="Eliminar">×</button></div></div>`}
function renderDashboard(){
 const tasks=activeTasks();
 const open=tasks.filter(t=>!t.done);
 const todayKey=today();
 const taskSeries=t=>t.recurrenceId||t.id;
 const completedToday=[...new Set(tasks.filter(t=>t.done&&t.doneAt&&dateKey(new Date(t.doneAt))===todayKey).map(taskSeries))];
 const todayScope=[...new Map(tasks.filter(t=>t.due===todayKey||(t.done&&t.doneAt&&dateKey(new Date(t.doneAt))===todayKey)).map(t=>[taskSeries(t),t])).values()];
 const todayDone=completedToday.length;
 const totalToday=todayScope.length;
 const pct=totalToday?Math.min(100,Math.round(todayDone/totalToday*100)):0;
 $("statDone").textContent=todayDone+" de "+totalToday;
 $("dailyProgressHint").textContent=totalToday?(todayDone===totalToday?"¡Completaste todas tus tareas de hoy!":"Vas "+pct+"% de tu jornada"):"Agrega tus tareas del día para comenzar";
 $("progressBar").style.width=pct+"%";
 const quotes=["La constancia convierte los pequeños avances en grandes resultados.","No necesitas hacerlo todo hoy; necesitas avanzar en lo importante.","La disciplina es cumplir contigo incluso en los días difíciles.","Cada tarea terminada es una decisión a favor de tus objetivos.","El progreso se construye con acciones pequeñas, repetidas con intención.","Enfócate en lo que puedes resolver hoy. Lo demás puede esperar.","Un buen día no es perfecto: es un día en el que avanzaste.","La organización libera espacio para pensar mejor.","Hazlo con calma, pero hazlo con propósito.","Tu siguiente paso vale más que esperar el momento perfecto.","La excelencia está en cuidar los detalles, incluso cuando nadie mira.","La confianza se construye cumpliendo los compromisos que haces contigo.","No midas el día por lo ocupado que estuviste, sino por lo que lograste.","La mejora continua empieza con una decisión pequeña.","Hoy tienes una nueva oportunidad para hacerlo mejor."];
 const dayNumber=Math.floor(new Date(today()+"T12:00:00").getTime()/86400000);
 $("dailyQuote").textContent="“"+quotes[((dayNumber%quotes.length)+quotes.length)%quotes.length]+"”";
 const ordered=[...open].sort((a,b)=>({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority])||(a.due||"9999").localeCompare(b.due||"9999"));
 $("todayTasks").innerHTML=ordered.slice(0,5).map(taskMarkup).join("")||`<div class="empty-state">No tienes tareas pendientes. ¡Buen trabajo!</div>`;
 const resp=profile()?.responsibilities||[];$("profileSummary").innerHTML=resp.slice(0,6).map(r=>`<div class="summary-item"><span>${escapeHTML(r.name)}</span><span>${escapeHTML(r.area||"General")}</span></div>`).join("")||`<div class="empty-state">Agrega responsabilidades a tu perfil.</div>`;
 $("recentActivity").innerHTML=state.activity.slice(0,5).map(a=>`<div class="activity-item"><span class="activity-bullet"></span><span>${escapeHTML(a.message)}<br><small>${new Date(a.date).toLocaleString("es-MX")}</small></span></div>`).join("")||`<div class="empty-state">Aquí aparecerán tus movimientos.</div>`;
}
function renderTasks(){
 const q=$("taskSearch").value.toLowerCase(),filter=$("taskFilter").value,pf=$("taskPriorityFilter").value;
 let list=activeTasks().filter(t=>(t.name+" "+(t.area||"")).toLowerCase().includes(q));
 if(filter==="open")list=list.filter(t=>!t.done);if(filter==="done")list=list.filter(t=>t.done);if(filter==="overdue")list=list.filter(t=>!t.done&&t.due&&t.due<today());
 if(pf!=="all")list=list.filter(t=>t.priority===pf);
 list.sort((a,b)=>Number(a.done)-Number(b.done)||({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority])||(a.due||"9999").localeCompare(b.due||"9999"));
 $("allTasks").innerHTML=list.map(taskMarkup).join("")||`<div class="empty-state">No hay tareas que coincidan con tu búsqueda.</div>`;
 const area=$("taskArea");area.innerHTML=`<option value="">General</option>`+(profile()?.responsibilities||[]).map(r=>`<option value="${escapeHTML(r.name)}">${escapeHTML(r.name)}</option>`).join("");
}
function renderResponsibilities(){
 const p=profile();$("responsibilityList").innerHTML=(p.responsibilities||[]).map(r=>`<article class="responsibility-card"><span class="tag">${escapeHTML(r.area||"General")}</span><h3>${escapeHTML(r.name)}</h3><p>${escapeHTML(r.description||"Sin descripción")}</p><div class="card-footer"><button class="text-button" data-edit-resp="${r.id}">Editar</button><button class="mini-button" data-delete-resp="${r.id}">Eliminar ×</button></div></article>`).join("")||`<div class="empty-state">Este perfil aún no tiene responsabilidades.</div>`;
}
function renderProjects(){$("projectList").innerHTML=state.projects.map(p=>`<article class="project-card"><span class="tag">${escapeHTML(p.status||"En curso")}</span><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description||"Sin descripción")}</p><div class="card-footer"><small class="muted">Objetivo: ${fmtDate(p.due)}</small><button class="mini-button" data-delete-project="${p.id}">Eliminar ×</button></div></article>`).join("")||`<div class="empty-state">Todavía no tienes proyectos. Crea uno para dar seguimiento a un objetivo.</div>`}
function renderJournal(){$("journalList").innerHTML=state.journal.map(j=>`<article class="journal-entry"><div class="journal-date">${new Date(j.date).toLocaleString("es-MX")} · ${escapeHTML(j.profileName||"")}</div><h3>${escapeHTML(j.title)}</h3><p>${escapeHTML(j.body)}</p></article>`).join("")||`<div class="empty-state">Tu bitácora está vacía. Registra decisiones, resultados o aprendizajes.</div>`}
function renderProfiles(){$("profileSelect").innerHTML=state.profiles.map(p=>`<option value="${p.id}" ${p.id===state.activeProfileId?"selected":""}>${escapeHTML(p.name)}</option>`).join("")}
function renderAll(){renderProfiles();renderDashboard();renderTasks();renderResponsibilities();renderProjects();renderJournal()}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));const labels={dashboard:"Mi día",tasks:"Mis tareas",responsibilities:"Responsabilidades",projects:"Proyectos",journal:"Bitácora",settings:"Ajustes"};$("viewTitle").textContent=labels[name]||"CONTROL PRO";$("sidebar").classList.remove("open")}
function openTask(id){const t=state.tasks.find(x=>x.id===id);$("taskDialogTitle").textContent=t?"Editar tarea":"Nueva tarea";$("taskId").value=t?.id||"";$("taskName").value=t?.name||"";$("taskPriority").value=t?.priority||"medium";$("taskDue").value=t?.due||today();$("taskNotes").value=t?.notes||"";$("taskRecurring").checked=!!t?.recurring;renderTasks();$("taskArea").value=t?.area||"";$("taskDialog").showModal()}
function openSimple(title,eyebrow,fields,onSave){$("simpleTitle").textContent=title;$("simpleEyebrow").textContent=eyebrow;$("simpleFields").innerHTML=fields;$("simpleForm").onsubmit=(e)=>{e.preventDefault();onSave();$("simpleDialog").close()};$("simpleDialog").showModal()}
function profileManager(){const html=`<div class="profile-manager">${state.profiles.map(p=>`<div class="summary-item"><span>${escapeHTML(p.name)} ${p.id===state.activeProfileId?"(Activo)":""}</span><button type="button" class="text-button" data-profile-edit="${p.id}">Editar</button></div>`).join("")}</div><label>Nombre del nuevo perfil<input id="newProfileName" placeholder="Ej. Coordinador regional"></label><label>Descripción<input id="newProfileDesc" placeholder="Responsabilidades principales"></label><button type="button" class="secondary-button" id="createProfile">＋ Crear perfil personalizado</button>`;
 openSimple("Administrar perfiles","PERFILES DE PUESTO",html,()=>{});
 $("simpleForm").onsubmit=(e)=>{e.preventDefault();$("simpleDialog").close()};
 $("createProfile").onclick=()=>{const name=$("newProfileName").value.trim();if(!name){toast("Escribe el nombre del perfil.");return}const p={id:uid(),name,description:$("newProfileDesc").value.trim(),responsibilities:[]};state.profiles.push(p);state.activeProfileId=p.id;log("Creaste el perfil "+name);save();$("simpleDialog").close();toast("Perfil creado.")};
 document.querySelectorAll("[data-profile-edit]").forEach(b=>b.onclick=()=>{const p=state.profiles.find(x=>x.id===b.dataset.profileEdit);$("simpleDialog").close();openSimple("Editar perfil","PERFILES DE PUESTO",`<label>Nombre<input id="profileName" value="${escapeHTML(p.name)}" required></label><label>Descripción<textarea id="profileDesc">${escapeHTML(p.description||"")}</textarea></label>`,()=>{p.name=$("profileName").value.trim();p.description=$("profileDesc").value.trim();log("Actualizaste el perfil "+p.name);save()})});
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
$("dateLabel").textContent=new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase();
$("profileSelect").onchange=e=>{state.activeProfileId=e.target.value;log("Cambiaste al perfil "+profile().name);save();toast("Perfil cambiado.")};
$("manageProfiles").onclick=$("settingsProfiles").onclick=profileManager;
$("quickAdd").onclick=$("dashboardAdd").onclick=$("taskAdd").onclick=()=>openTask();
$("taskSearch").oninput=renderTasks;$("taskFilter").onchange=renderTasks;$("taskPriorityFilter").onchange=renderTasks;
$("taskForm").onsubmit=e=>{e.preventDefault();const id=$("taskId").value;const existing=state.tasks.find(t=>t.id===id);const obj={id:id||uid(),profileId:state.activeProfileId,name:$("taskName").value.trim(),priority:$("taskPriority").value,due:$("taskDue").value,area:$("taskArea").value,notes:$("taskNotes").value.trim(),recurring:$("taskRecurring").checked,done:existing?.done||false,createdAt:existing?.createdAt||new Date().toISOString()};if(existing)Object.assign(existing,obj);else state.tasks.unshift(obj);log((existing?"Editaste: ":"Creaste: ")+obj.name);$("taskDialog").close();save();toast("Tarea guardada.")};
document.addEventListener("change",e=>{if(e.target.matches("[data-check]")){const t=state.tasks.find(x=>x.id===e.target.dataset.check);if(!t)return;const localToday=today();if(t.due&&t.due>localToday){e.target.checked=false;toast("Esta tarea todavía no vence. Podrás completarla el día programado.");return}if(t.recurring){const recurrenceId=t.recurrenceId||t.id;const alreadyCompletedToday=state.tasks.some(x=>x.recurring&&(x.recurrenceId||x.id)===recurrenceId&&x.done&&x.doneAt&&dateKey(new Date(x.doneAt))===localToday);if(t.done||alreadyCompletedToday){e.target.checked=!!t.done;toast("Esta tarea recurrente ya fue completada hoy.");return}}t.done=e.target.checked;t.doneAt=t.done?new Date().toISOString():null;log((t.done?"Completaste: ":"Reabriste: ")+t.name);if(t.done&&t.recurring){const recurrenceId=t.recurrenceId||t.id;const nextDue=nextDay(localToday);const alreadyScheduled=state.tasks.some(x=>x.recurring&&(x.recurrenceId||x.id)===recurrenceId&&x.due===nextDue);if(!alreadyScheduled){state.tasks.unshift({...t,id:uid(),recurrenceId,done:false,doneAt:null,due:nextDue,createdAt:new Date().toISOString()});log("Se programó la siguiente repetición de: "+t.name)}}save()}});function nextDay(d){const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+1);return x.toISOString().slice(0,10)}
document.addEventListener("click",e=>{const edit=e.target.closest("[data-edit-task]");if(edit)openTask(edit.dataset.editTask);const del=e.target.closest("[data-delete-task]");if(del&&confirm("¿Eliminar esta tarea?")){state.tasks=state.tasks.filter(t=>t.id!==del.dataset.deleteTask);log("Eliminaste una tarea.");save()}const er=e.target.closest("[data-edit-resp]");if(er){const r=profile().responsibilities.find(x=>x.id===er.dataset.editResp);openSimple("Editar responsabilidad","TU PUESTO",`<label>Nombre<input id="respName" value="${escapeHTML(r.name)}" required></label><label>Área<input id="respArea" value="${escapeHTML(r.area||"")}"></label><label>Descripción<textarea id="respDesc">${escapeHTML(r.description||"")}</textarea></label>`,()=>{r.name=$("respName").value.trim();r.area=$("respArea").value.trim();r.description=$("respDesc").value.trim();log("Actualizaste responsabilidad: "+r.name);save()})}const dr=e.target.closest("[data-delete-resp]");if(dr&&confirm("¿Eliminar esta responsabilidad?")){profile().responsibilities=profile().responsibilities.filter(r=>r.id!==dr.dataset.deleteResp);save()}const dp=e.target.closest("[data-delete-project]");if(dp&&confirm("¿Eliminar proyecto?")){state.projects=state.projects.filter(p=>p.id!==dp.dataset.deleteProject);save()}});
$("addResponsibility").onclick=()=>openSimple("Nueva responsabilidad","TU PUESTO",`<label>Nombre<input id="respName" required placeholder="Ej. Seguimiento de indicadores"></label><label>Área<input id="respArea" placeholder="Ej. Resultados"></label><label>Descripción<textarea id="respDesc" placeholder="¿Qué implica esta responsabilidad?"></textarea></label>`,()=>{profile().responsibilities.push({id:uid(),name:$("respName").value.trim(),area:$("respArea").value.trim(),description:$("respDesc").value.trim()});log("Agregaste responsabilidad: "+$("respName").value);save();toast("Responsabilidad agregada.")});
$("addProject").onclick=()=>openSimple("Nuevo proyecto","OBJETIVOS",`<label>Nombre<input id="projectName" required placeholder="Ej. Mejorar control operativo"></label><label>Descripción<textarea id="projectDesc"></textarea></label><label>Fecha objetivo<input id="projectDue" type="date"></label><label>Estado<select id="projectStatus"><option>En curso</option><option>En pausa</option><option>Completado</option></select></label>`,()=>{state.projects.unshift({id:uid(),name:$("projectName").value.trim(),description:$("projectDesc").value.trim(),due:$("projectDue").value,status:$("projectStatus").value});log("Creaste el proyecto "+$("projectName").value);save()});
$("addJournal").onclick=()=>openSimple("Nueva entrada","BITÁCORA",`<label>Título<input id="journalTitle" required placeholder="Ej. Resultado de revisión"></label><label>Registro<textarea id="journalBody" rows="5" required placeholder="Describe lo ocurrido, decisiones o aprendizajes..."></textarea></label>`,()=>{state.journal.unshift({id:uid(),title:$("journalTitle").value.trim(),body:$("journalBody").value.trim(),date:new Date().toISOString(),profileName:profile().name});log("Agregaste una entrada a la bitácora.");save()});
$("exportData").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="control-pro-respaldo-"+today()+".json";a.click();URL.revokeObjectURL(a.href);toast("Respaldo exportado.")};
$("importData").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data.profiles||!data.tasks)throw new Error();if(confirm("Esto reemplazará los datos actuales. ¿Continuar?")){state=data;save();toast("Respaldo restaurado.")}}catch(err){alert("El archivo no parece ser un respaldo válido de CONTROL PRO.")}e.target.value=""};
document.querySelectorAll(".close-dialog").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderAll();