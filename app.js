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
const TABS={teacher:[['sec','🗂 Sections'],['disp','📤 Dispatch'],['grade','📊 Gradebook']],student:[['todo','✅ To-Do'],['up','📎 Submit'],['quiz','📝 Quiz']],parent:[['rad','🚦 Progress'],['sf9','📄 Report Card']],principal:[['ops','📈 Operations'],['comp','📋 Compliance'],['lic','🔑 Licenses']]};
function doLogin(){view('dash');$('#rl').textContent=R.find(r=>r[0]==state.role)[1].slice(3);$('#kid').hidden=state.role!='parent';tab(TABS[state.role][0][0])}
function tab(k){$('#tabs').innerHTML=TABS[state.role].map(t=>`<button class="${t[0]==k?'on':''}" onclick="tab('${t[0]}')">${t[1]}</button>`).join('');$$('.panel').forEach(p=>p.hidden=p.id!=='p-'+k);if(k=='quiz')drawQuiz();if(k=='sf9')initSig();if(state.role=='parent')renderParent()}
/* Teacher */
const secs=[['7-Rizal',38,84],['7-Bonifacio',40,81],['8-Mabini',36,86]];
$('#secs').innerHTML=secs.map(s=>`<div class="card"><h3>Grade ${s[0]}</h3><p>${s[1]} learners</p><p class="out ok-t">Avg: ${s[2]}</p></div>`).join('');
$('#dsec').innerHTML=secs.map((s,i)=>`<label class="opt"><input type="checkbox" class="ds" value="${s[0]}"> Grade ${s[0]}</label>`).join('');
function deploy(){const c=$$('.ds:checked').map(x=>x.value);if(!c.length)return T('Select at least one section');T(`"${$('#at').value}" deployed to ${c.length} section(s) ✔`)}
const stu=[['Dela Cruz, Ana',42,45,38],['Reyes, Miguel',30,35,25],['Garcia, Sofia',48,50,46],['Lopez, Jose',20,28,22],['Tan, Bea',38,40,30]];
function tr(ig){return ig>=60?75+Math.floor((ig-60)/1.6):60+Math.floor(ig/4)}
function calc(i){const r=$$(`[data-r="${i}"]`).map(x=>Math.min(50,Math.max(0,+x.value||0)));const ig=(r[0]/50*40+r[1]/50*40+r[2]/50*20);const g=tr(ig);$('#i'+i).textContent=ig.toFixed(2);const o=$('#t'+i);o.textContent=g;o.className='out '+(g>=85?'ok-t':g>=75?'':'warn-t')}
$('#gb').innerHTML=stu.map((s,i)=>`<tr><td>${s[0]}</td>${[1,2,3].map(j=>`<td><input type="number" min="0" max="50" data-r="${i}" value="${s[j]}" oninput="calc(${i})" aria-label="score"></td>`).join('')}<td id="i${i}"></td><td class="out" id="t${i}"></td></tr>`).join('');stu.forEach((_,i)=>calc(i));
/* Student */
const tasks=[['Science Project – Plant Growth','red',0],['English Essay','org',0],['Math Worksheet 5','org',0],['Filipino Reading Log','grn',1]];
function drawTasks(){$('#tasks').innerHTML=tasks.map((t,i)=>`<div class="task ${t[2]?'grn':t[1]}" onclick="tasks[${i}][2]^=1;drawTasks()"><input type="checkbox" ${t[2]?'checked':''} tabindex="-1"><div><b>${t[0]}</b><div class="muted">${t[2]?'Done':t[1]=='red'?'Due today':'Due this week'}</div></div></div>`).join('')}drawTasks();
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