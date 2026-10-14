const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={role:'student',kid:0};
const T=(m)=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(T.i);T.i=setTimeout(()=>t.hidden=true,2800)};const toast=T;
function view(id){$$('.view').forEach(v=>v.hidden=v.id!==id);scrollTo(0,0)}
/* Landing */
const plans=[['Starter','Starter Academy','₱24,900','Up to 300 learners',['Gradebook & SF9','Student hub','Email support']],['Academy','School Academy','₱79,900','Up to 1,000 learners',['Everything in Starter','Parent portal','Principal console','Offline-safe quizzes']],['Enterprise','Division Enterprise','Custom','Unlimited schools',['Division dashboards','SSO & data export','Dedicated manager']]];
$('#plans').innerHTML=plans.map(p=>`<div class="card price ${p[0]=='Academy'?'feat':''}"><h3>${p[1]}</h3>${p[0]=='Academy'?'<span class="pill g" style="width:fit-content">Most popular</span>':''}<div class="amt">${p[2]}</div><div class="muted">${p[3]} / year</div><ul>${p[4].map(x=>`<li>${x}</li>`).join('')}</ul><button class="btn" onclick="openBuy('${p[0]}')">Buy Plan</button></div>`).join('');
$('#bp').innerHTML=plans.map(p=>`<option value="${p[0]}">${p[1]} – ${p[2]}</option>`).join('');
function openBuy(p){$('#bp').value=p;$('#bf').hidden=false;$('#bd').hidden=true;$('#buy').hidden=false}
function submitBuy(){if(!$('#bs').value||!$('#bn').value)return T('Please fill in school name and email');$('#ref').textContent='LW-'+Math.floor(100000+Math.random()*900000);$('#bf').hidden=true;$('#bd').hidden=false}
/* Login */
const R=[['student','🎒 Student'],['teacher','👩‍🏫 Teacher'],['parent','👪 Parent'],['principal','🏫 Principal']];
function drawRoles(){$('#roles').innerHTML=R.map(r=>`<button class="${state.role==r[0]?'on':''}" onclick="state.role='${r[0]}';drawRoles()">${r[1]}</button>`).join('')}drawRoles();
const TABS={teacher:[['cls','🗂 My Classes'],['recent','📣 Recent Posts']],student:[['subj','📚 Subjects'],['todo','✅ To-Do'],['alerts','🔔 Alerts'],['up','📎 Submit'],['quiz','📝 Quiz']],parent:[['rad','🚦 Progress'],['sf9','📄 Report Card']],principal:[['ops','📈 Operations'],['comp','📋 Compliance'],['lic','🔑 Licenses']]};
function doLogin(){state.cls=null;state.subj=null;state.ct='stream';state.st='all';state.fresh=[];view('dash');$('#rl').textContent=R.find(r=>r[0]==state.role)[1].slice(3);$('#kid').hidden=state.role!='parent';tab(TABS[state.role][0][0])}
function tab(k){state.tab=k;({cls:rCls,recent:rRecent,subj:rSubj,todo:rTodo,alerts:rAlerts}[k]||(()=>{}))();$('#tabs').innerHTML=TABS[state.role].map(t=>`<button class="${t[0]==k?'on':''}" onclick="tab('${t[0]}')">${t[1]}${t[0]=='alerts'&&unread()?' ('+unread()+')':''}</button>`).join('');$$('.panel').forEach(p=>p.hidden=p.id!=='p-'+k);if(k=='quiz')drawQuiz();if(k=='sf9')initSig();if(state.role=='parent')renderParent()}
/* ===== Shared data store (teacher posts show up for students) ===== */
const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const seed=()=>({classes:[
{id:'m1',subj:'Mathematics',sec:'7-Rizal',ico:'➗',col:'#1E3A8A',t:'You',mine:1},
{id:'m2',subj:'Mathematics',sec:'7-Bonifacio',ico:'➗',col:'#1E3A8A',t:'You',mine:1},
{id:'s1',subj:'Science',sec:'7-Rizal',ico:'🔬',col:'#047857',t:'You',mine:1},
{id:'e1',subj:'English',sec:'7-Rizal',ico:'📖',col:'#B45309',t:'Mrs. Villanueva'},
{id:'f1',subj:'Filipino',sec:'7-Rizal',ico:'🇵🇭',col:'#B91C1C',t:'Mr. Aquino'},
{id:'a1',subj:'Araling Panlipunan',sec:'7-Rizal',ico:'🗺️',col:'#6D28D9',t:'Ms. Castillo'}],
items:[
{id:1,cid:'m1',type:'homework',title:'Worksheet 5: Fractions',body:'Answer items 1–20 in your notebook.',due:day(1),at:Date.now()-9e6},
{id:2,cid:'m1',type:'announcement',title:'Quiz on Friday',body:'Bring a calculator and pencil.',at:Date.now()-8e6},
{id:3,cid:'s1',type:'task',title:'Plant Growth Project',body:'Submit photos of your plant every week.',due:day(0),at:Date.now()-7e6},
{id:4,cid:'e1',type:'task',title:'Essay: My Hero',body:'Write 300 words.',due:day(5),at:Date.now()-6e6},
{id:5,cid:'f1',type:'announcement',title:'Buwan ng Wika Practice',body:'Rehearsal at the gym after class.',at:Date.now()-5e6},
{id:6,cid:'a1',type:'homework',title:'Map of Luzon',body:'Label all provinces.',due:day(3),at:Date.now()-4e6}],
done:{},read:{},grades:{},n:10});
let DB;(function(){try{DB=JSON.parse(localStorage.getItem('learningWheel_db'))}catch(e){}if(!DB||!DB.items)DB=seed()})();
const save=()=>{try{localStorage.setItem('learningWheel_db',JSON.stringify(DB))}catch(e){}};
function resetDB(){DB=seed();save();T('Demo data reset ✔')}
const cls=id=>DB.classes.find(c=>c.id==id),mine=()=>DB.classes.filter(c=>c.mine),mySec='7-Rizal';
const TYPE={task:['📝','Task'],homework:['🏠','Homework'],announcement:['📣','Announcement']};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const days=d=>Math.round((new Date(d)-new Date(day(0)))/864e5);
const sItems=()=>DB.items.filter(i=>cls(i.cid).sec==mySec).sort((a,b)=>b.at-a.at);
const unread=()=>sItems().filter(i=>!DB.read[i.id]).length;
const isT=i=>i.type!='announcement';
function stat(i){if(DB.done[i.id])return['grn','Done ✔'];if(!i.due)return['org','No due date'];const n=days(i.due);return[n<=2?'red':'org',n<0?'Overdue':n==0?'Due today':'Due in '+n+' day'+(n>1?'s':'')]}
const chips=(i,subj)=>`<span class="chip">${TYPE[i.type][0]} ${TYPE[i.type][1]}</span>${subj?`<span class="chip" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).subj} ${cls(i.cid).mine?cls(i.cid).sec:''}</span>`:''}`;
const empty=m=>`<div class="card muted">${m}</div>`;
/* ----- Student ----- */
function sItem(i,subj,noBtn){const s=stat(i),un=!DB.read[i.id]||(state.fresh||[]).includes(i.id);
return `<div class="task ${isT(i)?s[0]:'ann'}"><div style="flex:1">${chips(i,subj)}${un?'<span class="chip new">NEW</span>':''}<div><b>${esc(i.title)}</b></div><div class="muted">${esc(i.body)}</div>${isT(i)?`<div class="muted"><b>${s[1]}</b>${i.due?' · '+i.due:''}</div>`:''}</div>${isT(i)&&!noBtn?`<button class="btn ${DB.done[i.id]?'ghost':'ok'}" style="width:auto" onclick="tog(${i.id})">${DB.done[i.id]?'Undo':'✔ Done'}</button>`:''}</div>`}
function tog(id){DB.done[id]=!DB.done[id];save();tab(state.tab)}
function openSubj(id){state.subj=id;state.st='all';state.fresh=sItems().filter(i=>i.cid==id&&!DB.read[i.id]).map(i=>i.id);DB.items.forEach(i=>{if(i.cid==id)DB.read[i.id]=1});save();tab('subj')}
function rSubj(){const el=$('#p-subj');
if(!state.subj){state.fresh=[];el.innerHTML='<h2>My Subjects</h2><p class="muted">Tap a subject to see its tasks, homework and announcements.</p><div class="grid">'+DB.classes.filter(c=>c.sec==mySec).map(c=>{const it=DB.items.filter(i=>i.cid==c.id),p=it.filter(i=>isT(i)&&!DB.done[i.id]).length,u=it.filter(i=>!DB.read[i.id]).length;return `<button class="card click" onclick="openSubj('${c.id}')" style="border-top:8px solid ${c.col}"><div style="font-size:2.2rem">${c.ico}</div><h3>${c.subj}</h3><p class="muted">${c.t}</p><span class="pill y">${p} to do</span> ${u?`<span class="pill r">${u} new</span>`:''}</button>`}).join('')+'</div>';return}
const c=cls(state.subj),all=DB.items.filter(i=>i.cid==c.id).sort((a,b)=>b.at-a.at),f=state.st=='todo'?all.filter(isT):state.st=='ann'?all.filter(i=>!isT(i)):all;
el.innerHTML=`<button class="btn ghost" style="width:auto" onclick="state.subj=null;tab('subj')">← All Subjects</button><div class="card" style="margin:14px 0;border-left:8px solid ${c.col}"><h2>${c.ico} ${c.subj}</h2><div class="muted">Teacher: ${c.t} · Grade ${c.sec}</div></div><div class="tabs">${[['all','🔔 All Updates'],['todo','✅ To-Do'],['ann','📣 Announcements']].map(t=>`<button class="${state.st==t[0]?'on':''}" onclick="state.st='${t[0]}';tab('subj')">${t[1]}</button>`).join('')}</div>${f.map(i=>sItem(i)).join('')||empty('Nothing here yet.')}`}
function rTodo(){const l=sItems().filter(isT).sort((a,b)=>(!!DB.done[a.id]-!!DB.done[b.id])||(a.due>b.due?1:-1));$('#p-todo').innerHTML='<h2>My To-Do</h2><p class="muted">🔴 Urgent · 🟠 Later · 🟢 Done</p>'+(l.map(i=>sItem(i,1)).join('')||empty('No tasks yet.'))}
function rAlerts(){const u=sItems().filter(i=>!DB.read[i.id]);$('#p-alerts').innerHTML='<h2>Alerts</h2>'+(u.length?`<p><button class="btn ghost" style="width:auto" onclick="DB.items.forEach(i=>DB.read[i.id]=1);save();tab('alerts')">Mark all as read</button></p>`+u.map(i=>`<div style="cursor:pointer" onclick="state.tab='subj';openSubj('${i.cid}')">${sItem(i,1,1)}</div>`).join(''):empty('You are all caught up 🎉'))}
/* ----- Teacher ----- */
const stu=['Dela Cruz, Ana','Reyes, Miguel','Garcia, Sofia','Lopez, Jose','Tan, Bea'],base=[[42,45,38],[30,35,25],[48,50,46],[20,28,22],[38,40,30]];
const G=id=>DB.grades[id]||(DB.grades[id]=base.map((r,i)=>r.map(v=>Math.max(0,Math.min(50,v+((id.charCodeAt(1)+i)%5)-2)))));
function tr(ig){return ig>=60?75+Math.floor((ig-60)/1.6):60+Math.floor(ig/4)}
function calc(i){const r=$$(`[data-r="${i}"]`).map(x=>Math.min(50,Math.max(0,+x.value||0)));G(state.cls)[i]=r;save();const ig=r[0]/50*40+r[1]/50*40+r[2]/50*20,g=tr(ig);$('#i'+i).textContent=ig.toFixed(2);const o=$('#t'+i);o.textContent=g;o.className='out '+(g>=85?'ok-t':g>=75?'':'warn-t')}
function tItem(i,showCls){const n=(i.id*3)%6;return `<div class="task ${isT(i)?'org':'ann'}"><div style="flex:1">${chips(i)}${showCls?`<span class="chip" style="background:${cls(i.cid).col};color:#fff">${cls(i.cid).subj} · ${cls(i.cid).sec}</span>`:''}<div><b>${esc(i.title)}</b></div><div class="muted">${esc(i.body)}</div><div class="muted">${isT(i)?`Due ${i.due||'—'} · Submitted ${n}/${stu.length}`:'Visible to all learners'}</div></div><button class="btn ghost" style="width:auto" onclick="del(${i.id})">🗑 Delete</button></div>`}
function del(id){DB.items=DB.items.filter(i=>i.id!=id);save();tab(state.tab);T('Post deleted')}
function openCls(id){state.cls=id;state.ct='stream';tab('cls')}
function post(cid){const t=$('#ptl').value.trim();if(!t)return T('Please enter a title');const ids=[cid,...$$('.xc:checked').map(x=>x.value)],ty=$('#pt').value;
ids.forEach(id=>DB.items.push({id:DB.n++,cid:id,type:ty,title:t,body:$('#pb').value.trim(),due:ty=='announcement'?'':$('#pd').value,at:Date.now()}));save();state.ct='stream';tab('cls');T(`Posted to ${ids.length} class${ids.length>1?'es':''} ✔`)}
function rCls(){const el=$('#p-cls');
if(!state.cls){el.innerHTML='<h2>My Classes</h2><p class="muted">Tap a class to post tasks, homework and announcements.</p><div class="grid">'+mine().map(c=>`<button class="card click" onclick="openCls('${c.id}')" style="border-top:8px solid ${c.col}"><div style="font-size:2.2rem">${c.ico}</div><h3>${c.subj}</h3><p class="muted">Grade ${c.sec} · ${stu.length} learners</p><span class="pill g">${DB.items.filter(i=>i.cid==c.id).length} posts</span></button>`).join('')+'</div>';return}
const c=cls(state.cls),ct=state.ct;let body='';
if(ct=='stream')body=DB.items.filter(i=>i.cid==c.id).sort((a,b)=>b.at-a.at).map(i=>tItem(i)).join('')||empty('No posts yet. Use “Post New”.');
else if(ct=='post')body=`<div class="card"><h3>Post to ${c.subj} · ${c.sec}</h3><label for="pt">Type</label><select id="pt"><option value="task">📝 Task</option><option value="homework">🏠 Homework</option><option value="announcement">📣 Announcement</option></select><label for="ptl">Title</label><input id="ptl" placeholder="e.g. Chapter 3 Reading"><label for="pb">Details</label><textarea id="pb" placeholder="Instructions for learners"></textarea><label for="pd">Due date (tasks &amp; homework)</label><input type="date" id="pd" value="${day(3)}"><label>Also post to my other classes</label>${mine().filter(x=>x.id!=c.id).map(x=>`<label class="opt"><input type="checkbox" class="xc" value="${x.id}">${x.subj} · ${x.sec}</label>`).join('')}<p><button class="btn ok" onclick="post('${c.id}')">📤 Post</button></p></div>`;
else body=`<div class="card"><h3>Gradebook (DepEd Order 8, s. 2015)</h3><p class="muted">WW 40% · PT 40% · Exam 20%. Type a raw score to recalculate.</p><div class="scroll"><table><thead><tr><th>Learner</th><th>WW /50</th><th>PT /50</th><th>Exam /50</th><th>Initial</th><th>Grade</th></tr></thead><tbody>${G(c.id).map((r,i)=>`<tr><td>${stu[i]}</td>${r.map(v=>`<td><input type="number" min="0" max="50" data-r="${i}" value="${v}" oninput="calc(${i})" aria-label="score"></td>`).join('')}<td id="i${i}"></td><td class="out" id="t${i}"></td></tr>`).join('')}</tbody></table></div><p><button class="btn" onclick="toast('SF9/SF10 report cards exported (simulated)')">📄 Export SF9/SF10</button></p></div>`;
el.innerHTML=`<button class="btn ghost" style="width:auto" onclick="state.cls=null;tab('cls')">← All Classes</button><div class="card" style="margin:14px 0;border-left:8px solid ${c.col}"><h2>${c.ico} ${c.subj} · ${c.sec}</h2><div class="muted">${stu.length} learners</div></div><div class="tabs">${[['stream','📋 Stream'],['post','➕ Post New'],['grade','📊 Gradebook']].map(t=>`<button class="${ct==t[0]?'on':''}" onclick="state.ct='${t[0]}';tab('cls')">${t[1]}</button>`).join('')}</div>${body}`;
if(ct=='grade')G(c.id).forEach((_,i)=>calc(i))}
function rRecent(){const l=DB.items.filter(i=>cls(i.cid).mine).sort((a,b)=>b.at-a.at);$('#p-recent').innerHTML='<h2>Recent Posts</h2><p class="muted">Everything you posted across all classes.</p>'+(l.map(i=>tItem(i,1)).join('')||empty('No posts yet.'))}
/* ----- Student extras ----- */
function compress(){const b=$('#cb');b.disabled=true;let p=0;const iv=setInterval(()=>{p+=4;$('#pb').style.width=p+'%';const mb=5000-(4850*p/100);$('#sz').textContent=mb>1000?(mb/1000).toFixed(1)+' MB':Math.round(mb)+' KB';$('#pm').textContent='Compressing… '+p+'%';if(p>=100){clearInterval(iv);$('#pm').textContent='✅ 5 MB → 150 KB. Submitted!';b.disabled=false;T('Submitted using 97% less data')}},90)}
const Q=[['What gas do plants absorb?',['Oxygen','Carbon dioxide','Helium']],['Which planet is closest to the Sun?',['Mercury','Venus','Mars']],['Water boils at…',['50°C','100°C','150°C']]],ans=[1,0,1];
let qa={};function load(){try{qa=JSON.parse(localStorage.getItem('learningWheel_quiz')||'{}')}catch(e){qa={}}}
function pick(q,o){qa[q]=o;try{localStorage.setItem('learningWheel_quiz',JSON.stringify(qa))}catch(e){}T('Answer saved 💾')}
function drawQuiz(){$('#qz').innerHTML=Q.map((q,i)=>`<h3>${i+1}. ${q[0]}</h3>${q[1].map((o,j)=>`<label class="opt"><input type="radio" name="q${i}" ${qa[i]===j?'checked':''} onclick="pick(${i},${j})">${o}</label>`).join('')}`).join('')}
function brownout(){$('#qz').innerHTML='<p class="bad-t out">⚡ Power lost… restarting</p>';qa={};setTimeout(()=>{load();drawQuiz();$('#qm').textContent='✅ Recovered '+Object.keys(qa).length+' saved answer(s) from this device.'},1200)}
function gradeQuiz(){$('#qm').textContent='Score: '+ans.filter((a,i)=>qa[i]===a).length+' / 3'}load();
/* Parent */
const kids=[{n:'Maria Santos',g:'Grade 5',gen:92,pend:1,att:98},{n:'Juan Santos',g:'Grade 2',gen:78,pend:3,att:92},{n:'Pedro Santos',g:'Grade 9',gen:72,pend:6,att:85}];
$('#kid').innerHTML=kids.map((k,i)=>`<option value="${i}">${k.n} (${k.g})</option>`).join('');
const col=(v,a,b)=>v>=a?'g':v>=b?'y':'r';
function renderParent(){const k=kids[state.kid];$('#kn').textContent=k.n+' · '+k.g;
const L=[['📚 General Average',k.gen,col(k.gen,85,75),k.gen>=85?'On track':k.gen>=75?'Watch closely':'Needs help'],['📝 Pending Tasks',k.pend,col(-k.pend,-2,-4),k.pend+' to finish'],['🗓 Attendance',k.att+'%',col(k.att,95,90),k.att>=95?'Excellent':k.att>=90?'Some absences':'Too many absences']];
$('#tl').innerHTML=L.map(l=>`<div class="card light"><div class="dot ${l[2]}"></div><div><h3>${l[0]}</h3><div class="out">${l[1]}</div><div class="muted">${l[3]}</div></div></div>`).join('');
const s=['Filipino','English','Math','Science','Araling Panlipunan'];
$('#sf').innerHTML=`<p><b>${k.n}</b> · ${k.g} · S.Y. 2026–2027</p><div class="scroll"><table><tr><th>Subject</th><th>Q1</th><th>Q2</th><th>Final</th></tr>${s.map((x,i)=>{const a=Math.min(100,k.gen+[2,-3,4,-1,0][i]);return`<tr><td>${x}</td><td>${a-1}</td><td>${a+1>100?100:a+1}</td><td class="out">${a}</td></tr>`}).join('')}<tr><th>General Average</th><th></th><th></th><th>${k.gen}</th></tr></table></div>`;$('#ap').textContent=''}
/* Signature pad */
let drawing=false;function initSig(){const c=$('#sig');c.width=c.clientWidth;c.height=150;const x=c.getContext('2d');x.lineWidth=3;x.lineCap='round';x.strokeStyle='#1E3A8A';
const pos=e=>{const r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
c.onpointerdown=e=>{drawing=true;x.beginPath();x.moveTo(...pos(e))};c.onpointermove=e=>{if(drawing){x.lineTo(...pos(e));x.stroke()}};c.onpointerup=()=>drawing=false}
function clearSig(){const c=$('#sig');c.getContext('2d').clearRect(0,0,c.width,c.height)}
function approve(m){$('#ap').textContent=`✔ ${kids[state.kid].n}'s report card approved via ${m} · ${new Date().toLocaleDateString()}`;T('Report card approved')}
/* Principal */
function bars(id,d,max,u,c){$(id).innerHTML=d.map(x=>`<div class="row"><span class="lb">${x[0]}</span><div class="bar"><i style="width:${x[1]/max*100}%;background:${c}"></i></div><b>${x[1]}${u}</b></div>`).join('')}
bars('#c1',[['Gr 7',310],['Gr 8',285],['Gr 9',270],['Gr 10',255]],320,'','#1E3A8A');bars('#c2',[['Gr 7',84],['Gr 8',82],['Gr 9',80],['Gr 10',83]],100,'','#047857');bars('#c3',[['Gr 7',96],['Gr 8',94],['Gr 9',91],['Gr 10',93]],100,'%','#B45309');
$('#cl').innerHTML=[['Mrs. Villanueva','12 of 12 reviewed','Up to date','g','Compliant'],['Mr. Aquino','8 of 11 reviewed','2 weeks late','y','Pending'],['Ms. Castillo','3 of 10 reviewed','Missing','r','Overdue'],['Mr. Ramos','10 of 10 reviewed','Up to date','g','Compliant']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="pill ${r[3]}">${r[4]}</span></td></tr>`).join('');

// Keep the signature pad sharp after rotation / resize
window.addEventListener('resize',()=>{if(!$('#p-sf9').hidden)initSig()});