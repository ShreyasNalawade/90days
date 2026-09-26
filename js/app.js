/* App logic: calendar, logging, and screens. Plan content lives in plans.js. */
const STORAGE = 'shreyas_90_day_recomp_v2';
const OLD = 'shreyas_90_day_recomp_v1';


const TITLES = {today:'Today', week:'Week', plan:'Plan', diet:'Diet', progress:'Progress'};

function iso(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function startOfDay(d){return new Date(d.getFullYear(), d.getMonth(), d.getDate())}
function addDays(date, n){const d=new Date(date); d.setDate(d.getDate()+n); return d}
function mondayOf(d){
  const x=startOfDay(d);
  return addDays(x, -((x.getDay()+6)%7));
}
function esc(s){
  return String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function fmt(d, withYear){
  return d.toLocaleDateString('en-IN', withYear
    ? {weekday:'short', day:'numeric', month:'short', year:'numeric'}
    : {weekday:'short', day:'numeric', month:'short'});
}
function fmtLong(d){
  return d.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'});
}
function num(v){
  const n=parseFloat(String(v??'').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
function phaseName(i){return i<30?'Foundation':i<60?'Progression':'Intensification'}
function today(){return startOfDay(new Date())}

function buildDays(){
  const arr=[]; let gym=0;
  for(let i=0;i<DAYS;i++){
    const d=addDays(START, i);
    const key=iso(d);
    const sunday=d.getDay()===0;
    const holiday=HOLIDAYS[key]||'';
    const phase=phaseName(i);
    if(sunday || holiday){
      const restLabel = holiday && sunday ? 'Sunday · '+holiday : holiday || 'Sunday — gym closed';
      arr.push({i, d, key, type:'rest', phase, holiday, restLabel, sunday});
    }else{
      arr.push({i, d, key, type:['push','pull','legs'][gym%3], phase, holiday:'', restLabel:'', sunday:false});
      gym++;
    }
  }
  return arr;
}
const plan=buildDays();
const planByKey=Object.fromEntries(plan.map(d=>[d.key, d]));
const END=plan[plan.length-1].d;
const firstMonday=mondayOf(START);
const lastMonday=mondayOf(END);
const gymCount=plan.filter(d=>d.type!=='rest').length;

let storageOK=true;
try{localStorage.setItem('__recomp','1'); localStorage.removeItem('__recomp')}catch(e){storageOK=false}

function load(){
  let raw=null;
  try{raw=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch(e){}
  if(raw && typeof raw==='object' && (raw.days || raw.body)){
    return {days:raw.days||{}, body:Array.isArray(raw.body)?raw.body:[]};
  }
  let old=null;
  try{old=JSON.parse(localStorage.getItem(OLD)||'null')}catch(e){}
  const days={};
  if(old && typeof old==='object' && !Array.isArray(old) && !old.days){
    Object.keys(old).forEach(k=>{
      if(old[k]===true) days[k]={done:true, notes:'', weights:{}, checks:{}};
    });
  }
  return {days, body:[]};
}
let state=load();
function save(){
  try{localStorage.setItem(STORAGE, JSON.stringify(state))}catch(e){storageOK=false}
}

let view='today';
try{
  const saved=sessionStorage.getItem('recomp-view');
  if(['today','week','plan','diet','progress'].includes(saved)) view=saved;
}catch(e){}
let weekAnchor=defaultAnchor();
let selectedKey=null;
let filter='all';
let query='';
let openKey=null;
let chromeNextKey=null;
const history=[];
let toastTimer=0;

function focusDay(){
  const key=iso(today());
  if(planByKey[key]) return planByKey[key];
  if(today()<START) return plan[0];
  return plan[plan.length-1];
}
function defaultAnchor(){
  return mondayOf(focusDay().d);
}
function openSection(name){
  if(name==='today' || name==='week' || name==='diet'){
    const day=focusDay();
    weekAnchor=mondayOf(day.d);
    selectedKey=day.key;
  }
  if(view!==name) setView(name);
  else render(false);
}
function position(){
  const t=today();
  if(t<START) return {mode:'before', days:Math.round((START-t)/86400000)};
  if(t>END) return {mode:'after'};
  const day=planByKey[iso(t)];
  return {mode:'during', day};
}
function isPast(day){return startOfDay(day.d)<today()}
function isToday(day){return day.key===iso(today())}
function ensure(key){
  if(!state.days[key]) state.days[key]={done:false, notes:'', weights:{}, checks:{}};
  const rec=state.days[key];
  rec.notes??=''; rec.weights??={}; rec.checks??={}; rec.eaten??={}; rec.done=!!rec.done;
  return rec;
}
function sessionParts(day){
  if(day.type==='rest') return {warmup:[], lifts:[], stretch:REST_MOBILITY};
  const prep=PREP[day.type];
  return {warmup:prep.warmup, lifts:WORKOUTS[day.type].exercises, stretch:prep.stretch};
}
function namesOf(day){
  const parts=sessionParts(day);
  return [...parts.warmup, ...parts.lifts, ...parts.stretch].map(item=>item.name);
}
function checkMap(rec, names){
  const explicit=rec.checks && Object.keys(rec.checks).length>0;
  const map={};
  names.forEach(n=>{map[n]=explicit?!!rec.checks[n]:!!rec.done});
  return map;
}
function progressOf(day){
  const rec=state.days[day.key]||{done:false, notes:'', weights:{}, checks:{}};
  const names=namesOf(day);
  const map=checkMap(rec, names);
  const checked=names.filter(n=>map[n]).length;
  return {done:!!rec.done||(names.length>0 && checked===names.length), checked, total:names.length, map};
}
function lastWeight(key, name){
  const idx=plan.findIndex(d=>d.key===key);
  for(let i=idx-1;i>=0;i--){
    const v=state.days[plan[i].key]?.weights?.[name];
    if(v!=null && String(v).trim()!=='') return {value:String(v), date:plan[i].d};
  }
  return null;
}
function prescription(ex, phase){
  let sets=ex.sets, reps=ex.reps;
  if(phase==='Progression'){
    if(sets===3 && reps==='8–12') reps='8–10';
    else if(sets===2 && reps==='8–12'){sets=3; reps='8–10'}
  }else if(phase==='Intensification'){
    if(sets===3 && reps==='8–12') reps='6–10';
  }
  return {sets, reps, text:sets+' × '+reps};
}
function gymStreak(){
  const rows=plan.filter(d=>{
    if(d.type==='rest') return false;
    if(isPast(d)) return true;
    return isToday(d) && progressOf(d).done;
  });
  let n=0;
  for(let i=rows.length-1;i>=0;i--){
    if(progressOf(rows[i]).done) n++;
    else break;
  }
  return n;
}
function loggedCount(){return plan.filter(d=>progressOf(d).done).length}
function sessionsDone(){return plan.filter(d=>d.type!=='rest' && progressOf(d).done).length}
function nextGym(fromKey){
  const start=fromKey?plan.findIndex(d=>d.key===fromKey)+1:0;
  const t=iso(today());
  const from=fromKey?start:plan.findIndex(d=>d.key>=t);
  const slice=plan.slice(Math.max(0, from));
  return slice.find(d=>d.type!=='rest')||null;
}
function nextOpenGym(afterKey){
  let i=0;
  if(afterKey) i=plan.findIndex(d=>d.key===afterKey)+1;
  else {
    i=plan.findIndex(d=>d.key>=iso(today()));
    if(i<0) i=0;
  }
  for(;i<plan.length;i++){
    if(plan[i].type!=='rest' && !progressOf(plan[i]).done) return plan[i];
  }
  return null;
}
function kindOf(day){
  if(day.type==='rest') return day.holiday?'holiday':'rest';
  return day.type;
}
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'), 2200);
}
function remember(){
  history.push({view, weekAnchor:iso(weekAnchor), selectedKey, openKey, query, filter, scroll:window.scrollY});
  if(history.length>40) history.shift();
}
function setView(next){
  if(next!==view) remember();
  view=next;
  try{sessionStorage.setItem('recomp-view', view)}catch(e){}
  render(false);
}
function goBack(){
  if(view==='plan' && openKey){
    openKey=null;
    render(true);
    return;
  }
  const prev=history.pop();
  if(!prev){
    if(view!=='today'){
      view='today';
      try{sessionStorage.setItem('recomp-view', view)}catch(e){}
      render(false);
    }
    return;
  }
  view=prev.view;
  const parts=prev.weekAnchor.split('-').map(Number);
  weekAnchor=new Date(parts[0], parts[1]-1, parts[2]);
  selectedKey=prev.selectedKey;
  openKey=prev.openKey;
  query=prev.query;
  filter=prev.filter;
  try{sessionStorage.setItem('recomp-view', view)}catch(e){}
  render(false);
  window.scrollTo(0, prev.scroll||0);
}
function render(keepScroll){
  const y=keepScroll?window.scrollY:0;
  document.getElementById('view').innerHTML='<div class="view-wrap">'+({today:renderToday, week:renderWeek, plan:renderPlan, diet:renderDiet, progress:renderProgress}[view]())+'</div>';
  document.querySelectorAll('[data-nav]').forEach(btn=>{
    const on=btn.dataset.nav===view;
    btn.classList.toggle('active', on);
    if(on) btn.setAttribute('aria-current','page');
    else btn.removeAttribute('aria-current');
  });
  updateChrome();
  window.scrollTo(0, keepScroll?y:0);
}
function updateChrome(){
  const pos=position();
  const logged=loggedCount();
  const sessions=sessionsDone();
  const streak=gymStreak();
  const pct=Math.round(logged/DAYS*100);
  const brand=document.getElementById('brand-range');
  if(brand){
    brand.textContent=START.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' – '+END.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  }
  document.getElementById('top-title').textContent=TITLES[view];
  document.getElementById('back-btn').hidden=!(history.length || (view==='plan' && openKey) || view!=='today');
  document.getElementById('eyebrow').textContent = pos.mode==='before'
    ? (pos.days===1?'Starts tomorrow':'Starts in '+pos.days+' days')
    : pos.mode==='after'
      ? '90 days complete'
      : 'Day '+(pos.day.i+1)+' of 90 · '+pos.day.phase;
  document.getElementById('top-meta').textContent=sessions+'/'+gymCount+' gym'+(streak? ' · '+streak+' streak':'');
  document.getElementById('mini-fill').style.width=pct+'%';
  document.documentElement.style.setProperty('--top-h', document.querySelector('.topbar').offsetHeight+'px');
  const upcoming=pos.mode==='during' && pos.day.type!=='rest' && !progressOf(pos.day).done
    ? pos.day
    : nextOpenGym(pos.mode==='during'?pos.day.key:null) || plan.filter(d=>d.type!=='rest').at(-1);
  chromeNextKey=upcoming?upcoming.key:null;
  const side=document.getElementById('side-next');
  if(upcoming){
    const w=upcoming.type==='rest'?null:WORKOUTS[upcoming.type];
    side.innerHTML='<span class="muted">'+(isToday(upcoming)?'Today’s session':'Next gym session')+'</span><strong>'+esc(fmt(upcoming.d))+' · '+esc(w.title)+'</strong><span class="muted">'+esc(w.focus)+'</span>';
  }
}

function macrosOf(items){
  let k=0, p=0, f=0;
  items.forEach(it=>{
    const food=FOOD[it.id];
    k+=food.kcal*it.g; p+=food.p*it.g; f+=food.f*it.g;
  });
  return {kcal:Math.round(k), p:Math.round(p), f:Math.round(f)};
}
function applySwap(meals, slot, fromId, addId, addG, removeG, label, note, dishBit){
  const meal=meals.find(m=>m.id===slot);
  const item=meal.items.find(it=>it.id===fromId);
  item.g-=removeG;
  meal.items.push({id:addId, g:addG, label});
  meal.dish+=dishBit;
  meal.note=note;
}
function menuFor(day){
  const src=MENUS[day.i%3];
  const dow=day.d.getDay();
  const paneer=dow===3 || dow===6;
  const soy=dow===1 || dow===4;
  const meals=src.meals.map(m=>({
    id:m.id, title:m.title, dish:m.dish, note:'',
    items:m.items.map(it=>({id:it.id, g:it.g, label:it.label}))
  }));
  if(paneer) applySwap(meals, src.paneerSlot, src.paneerFrom, 'paneer', 50, 38, 'paneer, as bhurji or palak paneer', '50 g paneer replaces part of the dal. It is not an extra on top of the full dal.', ' + paneer');
  if(soy) applySwap(meals, src.soySlot, src.soyFrom, 'soya', 20, 28, 'dry soya chunks, cooked as usal', '20 g dry soya chunks replace part of the dal. They swell once cooked.', ' + soya usal');
  const macros=meals.map(m=>macrosOf(m.items));
  const totals=macros.reduce((a,m)=>({kcal:a.kcal+m.kcal, p:a.p+m.p, f:a.f+m.f}), {kcal:0, p:0, f:0});
  return {cycle:day.i%3, name:src.name, short:src.short, paneer, soy, meals, macros, totals};
}
function portionLine(it){
  if(it.id==='oil') return '½ teaspoon oil';
  if(it.id==='milk' || it.id==='taak') return it.g+' ml '+it.label;
  return it.g+' g '+it.label;
}
function macroHTML(m){
  return `<div class="macro-grid">
    <div class="macro"><b>${m.kcal.toLocaleString('en-IN')}</b><span>kcal</span></div>
    <div class="macro"><b>${m.p} g</b><span>protein</span></div>
    <div class="macro"><b>${m.f} g</b><span>fiber</span></div>
  </div>`;
}
function plateNote(plate){
  if(plate.paneer) return 'Paneer day. Paneer is only on Wednesday and Saturday.';
  if(plate.soy) return 'Soya day. Soya chunks are only on Monday and Thursday.';
  return 'No paneer or soya today.';
}
function mealHTML(day, meal, macro){
  const eaten=!!(state.days[day.key] && state.days[day.key].eaten && state.days[day.key].eaten[meal.id]);
  return `<div class="meal ${eaten?'done':''}">
    <div>
      <label class="ex-hit">
        <input type="checkbox" data-action="check-meal" data-key="${day.key}" data-slot="${meal.id}" ${eaten?'checked':''} aria-label="Mark ${esc(meal.title)} eaten">
        <span>
          <span class="ex-name">${esc(meal.title)}</span>
          <span class="dish">${esc(meal.dish)}</span>
        </span>
      </label>
      ${meal.note?`<p class="muted" style="margin:8px 0 0">${esc(meal.note)}</p>`:''}
    </div>
    <ul class="portions">${meal.items.map(it=>`<li>${esc(portionLine(it))}</li>`).join('')}</ul>
    ${macroHTML(macro)}
  </div>`;
}
function dietCard(day, on){
  const plate=menuFor(day);
  return `<article class="card diet-card ${on?'is-on':''}">
    <p class="kicker">Meal day ${plate.cycle+1} of 3 · ${esc(plate.name)}</p>
    <h2>${esc(fmt(day.d, true))}</h2>
    <p class="muted" style="margin:6px 0 0">${esc(plateNote(plate))}</p>
    ${macroHTML(plate.totals)}
    <div class="stack" style="margin-top:12px">
      ${plate.meals.map((meal,i)=>mealHTML(day, meal, plate.macros[i])).join('')}
    </div>
  </article>`;
}
function dietEmbed(day){
  return `<div class="stack diet-wide" id="meals">${dietCard(day, true)}</div>`;
}
function renderDiet(){
  const days=[0,1,2,3,4,5,6].map(i=>addDays(weekAnchor, i));
  if(!days.some(d=>iso(d)===selectedKey)){
    const t=iso(today());
    selectedKey = days.some(d=>iso(d)===t && planByKey[t]) ? t : iso(days.find(d=>planByKey[iso(d)])||days[0]);
  }
  const selected=planByKey[selectedKey]||focusDay();
  const start=Math.min(selected.i, DAYS-3);
  const trio=[plan[start], plan[start+1], plan[start+2]];
  const atStart=iso(weekAnchor)===iso(firstMonday);
  const atEnd=iso(weekAnchor)===iso(lastMonday);
  const onDefault=iso(weekAnchor)===iso(defaultAnchor());
  return `<div class="stack">
    <section class="card">
      <h2>Maharashtrian plate</h2>
      <p class="muted" style="margin-top:0">Normal home food for three days, then it repeats. No egg, chicken, fish, meat, or protein shake. Every lunch has a bhakri. Dinner changes.</p>
      <div class="pills">
        <span class="pill">1,500–1,800 kcal</span>
        <span class="pill">120 g+ protein</span>
        <span class="pill">Paneer · Wed and Sat</span>
        <span class="pill">Soya · Mon and Thu</span>
      </div>
      <p class="muted" style="margin:10px 0 0">The protein is dal, besan, sprouts, peanuts, skimmed milk, and low-fat dahi. Portions are bigger than a usual thali so the day reaches 120 g. Use about ½ teaspoon of oil in a dish. Full-cream milk will push the day over 1,800 kcal.</p>
    </section>
    <div class="card">
      <div class="week-bar">
        <button class="icon-btn" type="button" data-action="shift-week" data-dir="-1" ${atStart?'disabled':''} aria-label="Previous week">‹</button>
        <div>
          <h2>${esc(fmt(weekAnchor))} – ${esc(fmt(addDays(weekAnchor,6)))}</h2>
          <p class="muted" style="margin:4px 0 0">Pick a day. The three cards are that day and the next two.</p>
        </div>
        <button class="icon-btn" type="button" data-action="shift-week" data-dir="1" ${atEnd?'disabled':''} aria-label="Next week">›</button>
      </div>
      ${onDefault?'':`<p style="margin:10px 0 0"><button class="linkish" type="button" data-action="this-week">${today()<START?'Show opening week':'Jump to this week'}</button></p>`}
    </div>
    <div class="week-strip is-static">
      ${days.map(d=>{
        const key=iso(d);
        const day=planByKey[key];
        if(!day){
          const tag=startOfDay(d)<START?'Before':'After';
          return `<button class="week-day is-out" type="button" disabled><small>${d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>${d.getDate()}</b><em>${tag}</em></button>`;
        }
        const plate=menuFor(day);
        const label=plate.paneer?'Paneer':plate.soy?'Soya':plate.short;
        const cls=['week-day', key===selectedKey?'is-selected':'', isToday(day)?'is-today':''].filter(Boolean).join(' ');
        return `<button class="${cls}" type="button" data-action="select-day" data-key="${key}"><small>${d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>${d.getDate()}</b><em>${esc(label)}</em></button>`;
      }).join('')}
    </div>
    ${start!==selected.i?'<p class="rule">These are the last three days of the plan.</p>':''}
    <div class="diet-cols">
      ${trio.map(day=>dietCard(day, day.key===selected.key)).join('')}
    </div>
    <p class="muted">Tick a meal after you eat it. The figures are kitchen estimates, rounded, and the day total is the sum of the three meals. Water is free. Tea or coffee without sugar can be extra.</p>
  </div>`;
}

function heroHTML(day, extra){
  const kind=kindOf(day);
  const prog=progressOf(day);
  const plate=menuFor(day);
  const w=day.type==='rest'?null:WORKOUTS[day.type];
  const label=day.type==='rest'?(day.holiday?'Holiday':'Rest'):w.title;
  return `<section class="hero ${kind}">
    <p class="kicker">Day ${day.i+1} of 90 · ${esc(day.phase)}</p>
    <h2 class="hero-title">${esc(fmtLong(day.d))}</h2>
    <p class="hero-sub">${esc(day.type==='rest'?day.restLabel:w.focus)}</p>
    <div class="pills">
      <span class="badge ${kind}">${esc(label.toUpperCase())}</span>
      ${day.type!=='rest'?'<span class="pill">Warm-up · lifts · stretch</span>':''}
      <span class="pill">${prog.done?'Logged':isToday(day)?'Today':day.key===iso(addDays(today(),1))?'Tomorrow':isPast(day)?'Not logged':'Ahead'}</span>
      <span class="pill">${plate.totals.kcal.toLocaleString('en-IN')} kcal · ${plate.totals.p} g protein</span>
    </div>
    ${extra||''}
  </section>`;
}

function stepRow(day, item, prog){
  const on=!!prog.map[item.name];
  return `<div class="ex ${on?'done':''}">
    <label class="ex-hit">
      <input type="checkbox" data-action="check-ex" data-key="${day.key}" data-name="${esc(item.name)}" ${on?'checked':''}>
      <span>
        <span class="ex-name">${esc(item.name)}</span>
        <span class="ex-rx"><span class="rest-tag">${esc(item.how)}</span></span>
      </span>
    </label>
  </div>`;
}
function counted(items, map){return items.filter(item=>map[item.name]).length}
function exerciseHTML(day){
  const w=WORKOUTS[day.type];
  const parts=sessionParts(day);
  const rec=state.days[day.key]||{weights:{}, notes:''};
  const prog=progressOf(day);
  const canFill=parts.lifts.some(ex=>{
    if(ex.hold) return false;
    const last=lastWeight(day.key, ex.name);
    const cur=rec.weights?.[ex.name];
    return last && !(cur && String(cur).trim());
  });
  const lifts=parts.lifts.map(ex=>{
    const rx=prescription(ex, day.phase);
    const on=!!prog.map[ex.name];
    const last=lastWeight(day.key, ex.name);
    const cur=rec.weights?.[ex.name]??'';
    const lastNum=last?num(last.value):null;
    const nowNum=num(cur);
    let delta='';
    if(lastNum!=null && nowNum!=null){
      const d=Math.round((nowNum-lastNum)*10)/10;
      const cls=d>0?'up':d<0?'down':'';
      const txt=d>0?`+${d} kg`:d<0?`${d} kg`:'Same weight';
      delta=`<span class="delta ${cls}">${txt}</span>`;
    }
    return `<div class="ex ${on?'done':''}">
      <label class="ex-hit">
        <input type="checkbox" data-action="check-ex" data-key="${day.key}" data-name="${esc(ex.name)}" ${on?'checked':''}>
        <span>
          <span class="ex-name">${esc(ex.name)}</span>
          <span class="ex-rx"><span class="rx">${esc(rx.text)}</span><span class="rest-tag">Rest ${esc(ex.rest)}</span></span>
        </span>
      </label>
      ${ex.hold?'':`<div class="ex-log">
        <input class="wt" inputmode="decimal" autocomplete="off" placeholder="kg" aria-label="Weight for ${esc(ex.name)}" data-action="weight" data-key="${day.key}" data-name="${esc(ex.name)}" data-last="${last?esc(last.value):''}" value="${esc(cur)}">
        ${last?`<span class="last">Last ${esc(last.value)} kg · ${esc(fmt(last.date))}</span>`:''}
        ${delta}
        ${last && String(cur).trim()!==last.value?`<button class="btn-tiny" type="button" data-action="use-last" data-key="${day.key}" data-name="${esc(ex.name)}" data-value="${esc(last.value)}">Use ${esc(last.value)}</button>`:''}
      </div>`}
    </div>`;
  }).join('');
  const warmDone=counted(parts.warmup, prog.map);
  const liftDone=counted(parts.lifts, prog.map);
  const stretchDone=counted(parts.stretch, prog.map);
  return `<div class="stack">
    <ol class="flow">
      <li><b>1 · Warm-up</b><span>${warmDone}/${parts.warmup.length} · about 5 min</span></li>
      <li><b>2 · Lifts</b><span>${liftDone}/${parts.lifts.length} ticked</span></li>
      <li><b>3 · Stretch</b><span>${stretchDone}/${parts.stretch.length} · about 5 min</span></li>
    </ol>
    <div class="session-label"><h3>Before · warm-up</h3><span class="muted">${warmDone}/${parts.warmup.length}</span></div>
    <p class="muted block-note" style="margin:0">Do this before the first heavy set. Keep every move easy, especially around the shoulder.</p>
    ${parts.warmup.map(item=>stepRow(day, item, prog)).join('')}
    <div class="session-label"><h3>Workout</h3><span class="muted">${liftDone}/${parts.lifts.length}</span></div>
    ${canFill?`<button class="btn btn-ghost" type="button" data-action="fill-weights" data-key="${day.key}">Fill empty weights from last time</button>`:''}
    ${lifts}
    <p class="rule">After the lifts: ${esc(w.cardio)}. Then stretch.</p>
    <div class="session-label"><h3>After · stretching</h3><span class="muted">${stretchDone}/${parts.stretch.length}</span></div>
    <p class="muted" style="margin:0">Hold each stretch. Do not bounce. Stop if a shoulder pinches, slips, or feels unstable.</p>
    ${parts.stretch.map(item=>stepRow(day, item, prog)).join('')}
    <label class="field">Session note
      <textarea class="notes" data-action="note" data-key="${day.key}" placeholder="Sleep, energy, a sore spot, or the weight you want next time.">${esc(rec.notes||'')}</textarea>
    </label>
    <button class="btn ${prog.done?'btn-done':'btn-primary'}" type="button" data-action="toggle-day" data-key="${day.key}">${prog.done?'Session logged · tap to undo':prog.checked?`Finish session · ${prog.checked}/${prog.total}`:'Mark session complete'}</button>
    <p class="rule">When every set reaches the top of the rep range with clean form, add the smallest weight next time.</p>
  </div>`;
}

function restHTML(day){
  const prog=progressOf(day);
  const parts=sessionParts(day);
  const nxt=nextGym(day.key);
  const done=counted(parts.stretch, prog.map);
  return `<div class="stack">
    <div class="card">
      <h2>Recovery</h2>
      <p class="muted" style="margin:0">No gym session. Sleep, food, and water come first. A short walk and these stretches are optional.</p>
    </div>
    <div class="session-label"><h3>Easy mobility</h3><span class="muted">${done}/${parts.stretch.length}</span></div>
    ${parts.stretch.map(item=>stepRow(day, item, prog)).join('')}
    <label class="field">Note
      <textarea class="notes" data-action="note" data-key="${day.key}" placeholder="How recovery felt.">${esc(state.days[day.key]?.notes||'')}</textarea>
    </label>
    <button class="btn ${prog.done?'btn-done':'btn-primary'}" type="button" data-action="toggle-day" data-key="${day.key}">${prog.done?'Recovery logged · tap to undo':'Log this recovery day'}</button>
    ${nxt? nextCard(nxt):''}
  </div>`;
}
function nextCard(day){
  const w=WORKOUTS[day.type];
  return `<button class="card next-card" type="button" data-action="goto-day" data-key="${day.key}">
    <span class="muted">Next gym session</span>
    <strong>${esc(fmtLong(day.d))} · ${esc(w.title)}</strong>
    <span class="muted">${esc(w.focus)} · ${esc(day.phase)}</span>
  </button>`;
}
function sideFacts(day){
  const logged=loggedCount();
  const sessions=sessionsDone();
  const streak=gymStreak();
  const nxt=day?nextGym(day.key):nextOpenGym(null);
  const showNext=!day || day.type!=='rest';
  return `<div class="stack side">
    <div class="card">
      <h3>At a glance</h3>
      <div class="stat-row">
        <div class="stat"><b>${sessions}</b><span>Gym done</span></div>
        <div class="stat"><b>${gymCount-sessions}</b><span>Gym left</span></div>
        <div class="stat"><b>${streak}</b><span>Streak</span></div>
      </div>
      <div class="track" aria-hidden="true"><i style="width:${Math.round(logged/DAYS*100)}%"></i></div>
      <p class="muted" style="margin:8px 0 0">${logged} of ${DAYS} days logged</p>
    </div>
    ${showNext&&nxt?nextCard(nxt):''}
    <div class="card">
      <h3>How a session works</h3>
      <p class="muted" style="margin:0">Warm up first, tick each lift and log the weight, then stretch. Progress stays on this device.</p>
      <p style="margin:10px 0 0"><button class="linkish" type="button" data-action="show-guide">Read the phase rules</button></p>
    </div>
  </div>`;
}

function renderToday(){
  if(today()>END){
    return `<div class="layout">
      <div class="stack">
        <section class="hero">
          <p class="kicker">${esc(fmtLong(END))}</p>
          <h2 class="hero-title">The 90 days are complete</h2>
          <p class="hero-sub">${sessionsDone()} of ${gymCount} gym sessions logged.</p>
          <div class="pills"><button class="btn btn-primary" style="width:auto" type="button" data-nav="progress">Open progress</button></div>
        </section>
      </div>
      ${sideFacts(plan[plan.length-1])}
    </div>`;
  }
  const day=focusDay();
  const startsLater=today()<START;
  return `<div class="day-page">
    <div class="stack session">
      ${startsLater?`<p class="rule">The plan starts tomorrow, ${esc(fmtLong(day.d))}. This is that day’s session.</p>`:''}
      ${heroHTML(day)}
      ${day.type==='rest'?restHTML(day):exerciseHTML(day)}
    </div>
    ${sideFacts(day)}
    ${dietEmbed(day)}
  </div>`;
}

function renderWeek(){
  const days=[0,1,2,3,4,5,6].map(i=>addDays(weekAnchor, i));
  if(!days.some(d=>iso(d)===selectedKey)){
    const t=iso(today());
    selectedKey = days.some(d=>iso(d)===t && planByKey[t]) ? t : iso(days.find(d=>planByKey[iso(d)])||days[0]);
  }
  const selected=planByKey[selectedKey];
  const gym=days.map(d=>planByKey[iso(d)]).filter(d=>d&&d.type!=='rest');
  const gymDone=gym.filter(d=>progressOf(d).done).length;
  const atStart=iso(weekAnchor)===iso(firstMonday);
  const atEnd=iso(weekAnchor)===iso(lastMonday);
  const onDefault=iso(weekAnchor)===iso(defaultAnchor());
  return `<div class="stack">
    <div class="card">
      <div class="week-bar">
        <button class="icon-btn" type="button" data-action="shift-week" data-dir="-1" ${atStart?'disabled':''} aria-label="Previous week">‹</button>
        <div>
          <h2>${esc(fmt(weekAnchor))} – ${esc(fmt(addDays(weekAnchor,6)))}</h2>
          <p class="muted" style="margin:4px 0 0">${gymDone} of ${gym.length} gym days logged this week</p>
        </div>
        <button class="icon-btn" type="button" data-action="shift-week" data-dir="1" ${atEnd?'disabled':''} aria-label="Next week">›</button>
      </div>
      ${onDefault?'':`<p style="margin:10px 0 0"><button class="linkish" type="button" data-action="this-week">${today()<START?'Show opening week':'Jump to this week'}</button></p>`}
    </div>
    <div class="week-strip">
      ${days.map(d=>{
        const key=iso(d);
        const day=planByKey[key];
        if(!day){
          const tag=startOfDay(d)<START?'Before':'After';
          return `<button class="week-day is-out" type="button" disabled><small>${d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>${d.getDate()}</b><em>${tag}</em></button>`;
        }
        const prog=progressOf(day);
        const kind=kindOf(day);
        const label=day.type==='rest'?(day.holiday?'Off':'Rest'):WORKOUTS[day.type].title;
        const cls=['week-day', kind, key===selectedKey?'is-selected':'', isToday(day)?'is-today':'', prog.done?'is-done':'', isPast(day)&&!prog.done&&day.type!=='rest'?'is-missed':''].filter(Boolean).join(' ');
        return `<button class="${cls}" type="button" data-action="select-day" data-key="${key}"><small>${d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>${d.getDate()}</b><em>${esc(label)}</em></button>`;
      }).join('')}
    </div>
    ${selected?`<div class="day-page"><div class="stack session">${heroHTML(selected)}${selected.type==='rest'?restHTML(selected):exerciseHTML(selected)}</div>${sideFacts(selected)}${dietEmbed(selected)}</div>`:''}
  </div>`;
}

function planMatches(day){
  const prog=progressOf(day);
  const q=query.trim().toLowerCase();
  if(q){
    const plate=menuFor(day);
    const blob=[day.key, fmt(day.d), fmtLong(day.d), day.phase, day.restLabel, plate.name, plate.meals.map(m=>m.dish+' '+m.items.map(it=>it.label).join(' ')).join(' '), day.type==='rest'?'rest holiday recovery':WORKOUTS[day.type].title+' '+WORKOUTS[day.type].focus+' '+WORKOUTS[day.type].exercises.map(e=>e.name).join(' ')].join(' ').toLowerCase();
    if(!blob.includes(q)) return false;
  }
  if(filter==='todo' && prog.done) return false;
  if(filter==='done' && !prog.done) return false;
  if(filter==='gym' && day.type==='rest') return false;
  if(filter==='rest' && day.type!=='rest') return false;
  if(filter==='gaps' && !(day.type!=='rest' && isPast(day) && !prog.done)) return false;
  return true;
}
function renderPlan(){
  const chips=[['all','All'],['todo','To do'],['done','Done'],['gym','Gym'],['rest','Rest'],['gaps','Not logged']];
  const months=[];
  plan.filter(planMatches).forEach(day=>{
    const id=day.key.slice(0,7);
    let bucket=months.find(m=>m.id===id);
    if(!bucket){bucket={id, label:day.d.toLocaleDateString('en-IN',{month:'long', year:'numeric'}), days:[]}; months.push(bucket)}
    bucket.days.push(day);
  });
  const seen=[];
  plan.forEach(day=>{
    const id=day.key.slice(0,7);
    if(!seen.some(m=>m.id===id)) seen.push({id, name:day.d.toLocaleDateString('en-IN',{month:'long'})});
  });
  const jumps=seen.map(m=>`<button class="jump" type="button" data-action="jump-month" data-month="${m.id}">${esc(m.name)}</button>`).join('');
  const body=months.length?months.map(m=>{
    const all=plan.filter(d=>d.key.startsWith(m.id) && d.type!=='rest');
    const done=all.filter(d=>progressOf(d).done).length;
    return `<h2 class="month-head" id="month-${m.id}"><span>${esc(m.label)}</span><span class="muted" style="font-size:14px">${done} of ${all.length} sessions</span></h2>
      ${m.days.map(planRow).join('')}`;
  }).join(''):`<div class="empty">Nothing matches. <button class="linkish" type="button" data-action="clear-filters">Show every day</button></div>`;
  return `<div class="tools">
      <input class="search" id="search" placeholder="Search a date, lift, or meal" value="${esc(query)}" autocomplete="off">
      <div class="chips">${chips.map(([id,label])=>`<button class="chip ${filter===id?'active':''}" type="button" data-action="filter" data-filter="${id}">${label}</button>`).join('')}</div>
      <div class="jumps">${jumps}</div>
    </div>
    <div id="plan-list">${body}</div>
    <details class="card" style="margin-top:14px" id="closures">
      <summary><strong>Closed days</strong></summary>
      <p class="muted">The gym plan treats every Sunday as closed, plus these Maharashtra public holidays. Other observance dates are training days unless you decide otherwise.</p>
      <ul class="holiday-list">
        <li>2 Oct — Gandhi Jayanti</li>
        <li>20 Oct — Dasara / Vijayadashami</li>
        <li>8 Nov — Diwali Amavasya (also a Sunday)</li>
        <li>10 Nov — Diwali / Bali Pratipada</li>
        <li>24 Nov — Guru Nanak Jayanti</li>
      </ul>
    </details>`;
}
function planRow(day){
  const prog=progressOf(day);
  const kind=kindOf(day);
  const plate=menuFor(day);
  const title=day.type==='rest'?day.restLabel:WORKOUTS[day.type].title+' · '+WORKOUTS[day.type].focus;
  const missed=day.type!=='rest' && isPast(day) && !prog.done;
  const status=prog.done?'Done':(day.type!=='rest'&&prog.checked?prog.checked+'/'+prog.total:isToday(day)?'Today':missed?'Not logged':'');
  const cls=['plan-row', isToday(day)?'is-today':'', prog.done?'is-done':'', missed?'is-missed':''].filter(Boolean).join(' ');
  const open=openKey===day.key;
  return `<button class="${cls}" type="button" data-action="open-plan" data-key="${day.key}" id="row-${day.key}">
      <span class="plan-date"><b>${String(day.d.getDate()).padStart(2,'0')}</b><small>${day.d.toLocaleDateString('en-IN',{weekday:'short'})}</small></span>
      <span class="plan-copy"><strong>${esc(title)}</strong><em>${esc(day.phase)}${day.type==='rest'?'':' · '+WORKOUTS[day.type].exercises.length+' lifts'} · ${esc(plate.name)}</em></span>
      <span class="plan-status"><span class="badge ${kind}">${day.type==='rest'?(day.holiday?'OFF':'REST'):day.type.toUpperCase()}</span><br>${esc(status)}</span>
    </button>
    ${open?`<div class="expand">${day.type==='rest'?restHTML(day):exerciseHTML(day)}${dietEmbed(day)}</div>`:''}`;
}

function renderProgress(){
  const logged=loggedCount();
  const sessions=sessionsDone();
  const streak=gymStreak();
  const pct=Math.round(logged/DAYS*100);
  const gaps=plan.filter(d=>d.type!=='rest' && isPast(d) && !progressOf(d).done).length;
  const pos=position();
  const activePhase=pos.mode==='during'?pos.day.phase:pos.mode==='after'?'Intensification':'Foundation';
  const entries=[...state.body].filter(e=>num(e.weight)!=null).sort((a,b)=>a.date<b.date?-1:1);
  const first=entries[0], last=entries[entries.length-1];
  let change='Log a starting weight. During a recomp the scale can stay flat, so waist is worth tracking too.';
  if(first && last && entries.length>1){
    const d=Math.round((last.weight-first.weight)*10)/10;
    change = d<0 ? `Down ${Math.abs(d)} kg from the first weigh-in.` : d>0 ? `Up ${d} kg from the first weigh-in.` : 'Same as the first weigh-in.';
  }else if(first) change=`Latest weigh-in is ${first.weight} kg.`;
  return `<div class="stack">
    <section class="metrics">
      <div class="metric"><b>${pct}%</b><span>Days logged</span></div>
      <div class="metric"><b>${sessions}<span style="font-size:16px;color:var(--muted)">/${gymCount}</span></b><span>Gym sessions</span></div>
      <div class="metric"><b>${streak}</b><span>Gym streak</span></div>
      <div class="metric"><b>${gaps}</b><span>Past days not logged</span></div>
    </section>
    <section class="card">
      <h2>Phases</h2>
      <div class="phase">
        ${PHASES.map(p=>{
          const slice=plan.slice(p.from, p.to);
          const done=slice.filter(d=>progressOf(d).done).length;
          const width=Math.round(done/slice.length*100);
          return `<div class="phase-card ${p.name===activePhase?'active':''}">
            <div class="phase-top"><strong>${p.name}</strong><span class="muted">Days ${p.from+1}–${p.to}</span></div>
            <p class="muted" style="margin:6px 0">${p.text}</p>
            <div class="track"><i style="width:${width}%"></i></div>
            <p class="muted" style="margin:6px 0 0">${done} of ${slice.length} days logged</p>
          </div>`;
        }).join('')}
      </div>
    </section>
    <section class="card">
      <h2>90-day board</h2>
      <p class="muted" style="margin-top:0">Each square is a day. A green edge means it is logged. Tap a day to open that week.</p>
      <div class="legend" style="margin-bottom:12px">
        <span><i class="swatch" style="background:var(--push)"></i>Push</span>
        <span><i class="swatch" style="background:var(--pull)"></i>Pull</span>
        <span><i class="swatch" style="background:var(--legs)"></i>Legs</span>
        <span><i class="swatch" style="background:#2a3832"></i>Rest</span>
        <span><i class="swatch" style="background:var(--holiday)"></i>Holiday</span>
      </div>
      <div class="months-heat">${monthHeats()}</div>
    </section>
    <div class="split">
      <section class="card">
        <h2>Body log</h2>
        <p class="muted" style="margin-top:0">${change}</p>
        ${chartHTML(entries)}
        <form class="body-form" id="body-form">
          <div class="form-row">
            <label class="field">Date<input type="date" name="date" required value="${esc(defaultLogDate())}"></label>
            <label class="field">Weight (kg)<input name="weight" inputmode="decimal" required placeholder="78.5" autocomplete="off"></label>
          </div>
          <label class="field">Waist (cm, optional)<input name="waist" inputmode="decimal" placeholder="86" autocomplete="off"></label>
          <p class="err" id="body-error"></p>
          <button class="btn btn-primary" type="submit">Save weigh-in</button>
        </form>
        <div style="margin-top:8px">
          ${entries.slice().reverse().map(e=>`<div class="log-row"><span><strong>${esc(e.weight)} kg</strong> <span class="muted">${esc(fmt(new Date(e.date+'T00:00:00'), true))}${e.waist? ' · waist '+esc(e.waist)+' cm':''}</span></span><button class="btn-tiny" type="button" data-action="delete-body" data-date="${esc(e.date)}">Remove</button></div>`).join('')||'<p class="muted">No weigh-ins yet.</p>'}
        </div>
      </section>
      <section class="card" id="guide">
        <h2>Plan rules</h2>
        <div class="guide-grid">
          <div><h3>Training</h3><p class="muted">Follow the card for that day. Sets and reps already include the phase change, so you do not recalculate them.</p></div>
          <div><h3>Progress</h3><p class="muted">Top of the rep range, clean form, then the smallest weight jump. Log the load so the next session shows it.</p></div>
          <div><h3>Rest</h3><p class="muted">Sundays are closed. Public holidays in this plan are rest days too. Festival dates that are not public holidays stay as training days.</p></div>
          <div><h3>Shoulder</h3><p class="muted">Do not push through shoulder pain. Comfortable range only. Get clinician or physio clearance if a movement causes pain, instability, numbness, or a slipping feeling.</p></div>
          <div><h3>Food</h3><p class="muted">Three Maharashtrian meals a day, with bhakri at lunch. Open Diet for the plate, the portions, and the calories, protein, and fiber.</p></div>
        </div>
        <h3 style="margin-top:16px">Your data</h3>
        <p class="muted">Workouts, notes, weights, and weigh-ins are saved on this phone or computer only. Export a backup before you switch devices.</p>
        <div class="pills">
          <button class="btn btn-ghost" style="width:auto" type="button" data-action="export">Export backup</button>
          <button class="btn btn-ghost" style="width:auto" type="button" data-action="import">Import backup</button>
          <button class="btn btn-tiny" type="button" data-action="reset">Reset progress</button>
        </div>
      </section>
    </div>
  </div>`;
}
function defaultLogDate(){
  const t=today();
  if(t<addDays(START,-21)) return iso(START);
  if(t>addDays(END,14)) return iso(END);
  return iso(t);
}
function chartHTML(entries){
  if(entries.length<2) return '';
  const w=320,h=88,pad=8;
  const vals=entries.map(e=>e.weight);
  const min=Math.min(...vals), max=Math.max(...vals);
  const span=(max-min)||1;
  const pts=entries.map((e,i)=>{
    const x=pad+(i*(w-pad*2))/(entries.length-1);
    const y=h-pad-((e.weight-min)/span)*(h-pad*2);
    return x.toFixed(1)+','+y.toFixed(1);
  });
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Weight trend"><polyline fill="none" stroke="#7eb0ff" stroke-width="3" points="${pts.join(' ')}"/><circle cx="${pts[pts.length-1].split(',')[0]}" cy="${pts[pts.length-1].split(',')[1]}" r="4" fill="#7eb0ff"/></svg>`;
}
function monthHeats(){
  const months=[];
  plan.forEach(day=>{
    const id=day.key.slice(0,7);
    let m=months.find(x=>x.id===id);
    if(!m){m={id, label:day.d.toLocaleDateString('en-IN',{month:'long'}), days:[]}; months.push(m)}
    m.days.push(day);
  });
  const dow='<div class="heat-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>';
  return months.map(m=>{
    const first=m.days[0].d;
    const pad=(first.getDay()+6)%7;
    let cells='';
    for(let i=0;i<pad;i++) cells+='<span class="cell is-pad"></span>';
    m.days.forEach(day=>{
      const prog=progressOf(day);
      const kind=kindOf(day);
      const cls=['cell', kind, prog.done?'is-done':'', isToday(day)?'is-today':'', day.type!=='rest'&&isPast(day)&&!prog.done?'is-missed':''].filter(Boolean).join(' ');
      const label=day.type==='rest'?day.restLabel:WORKOUTS[day.type].title;
      cells+=`<button class="${cls}" type="button" data-action="goto-day" data-key="${day.key}" title="${esc(fmt(day.d)+' · '+label)}">${day.d.getDate()}</button>`;
    });
    return `<div><h3 style="margin:0 0 6px">${esc(m.label)}</h3>${dow}<div class="heat">${cells}</div></div>`;
  }).join('');
}

function toggleDay(key){
  const day=planByKey[key];
  const rec=ensure(key);
  const names=namesOf(day);
  const turningOff=progressOf(day).done;
  rec.done=!turningOff;
  rec.checks={};
  names.forEach(n=>{rec.checks[n]=rec.done});
  save();
  render(true);
}
function toggleEx(key, name){
  const day=planByKey[key];
  const names=namesOf(day);
  const rec=ensure(key);
  const map=checkMap(rec, names);
  map[name]=!map[name];
  rec.checks=map;
  rec.done=names.every(n=>map[n]);
  save();
  render(true);
}
function useWeight(key, name, value){
  ensure(key).weights[name]=value;
  save();
  render(true);
}
function fillWeights(key){
  const day=planByKey[key];
  const rec=ensure(key);
  let n=0;
  WORKOUTS[day.type].exercises.forEach(ex=>{
    if(ex.hold) return;
    if(rec.weights[ex.name] && String(rec.weights[ex.name]).trim()) return;
    const last=lastWeight(key, ex.name);
    if(last){rec.weights[ex.name]=last.value; n++}
  });
  save();
  render(true);
  toast(n?`Filled ${n} weight${n===1?'':'s'}`:'Nothing to fill');
}
function gotoDay(key){
  const day=planByKey[key];
  if(!day) return;
  weekAnchor=mondayOf(day.d);
  selectedKey=key;
  setView('week');
}
function shiftWeek(dir){
  const next=addDays(weekAnchor, dir*7);
  if(next<firstMonday || next>lastMonday) return;
  weekAnchor=next;
  selectedKey=null;
  render(false);
}
function openPlan(key){
  openKey=openKey===key?null:key;
  render(true);
  if(openKey) document.getElementById('row-'+openKey)?.scrollIntoView({block:'nearest'});
}
function refreshPlanList(){
  const list=document.getElementById('plan-list');
  if(!list){render(true); return}
  const current=renderPlan();
  const holder=document.createElement('div');
  holder.innerHTML=current;
  const next=holder.querySelector('#plan-list');
  if(next) list.innerHTML=next.innerHTML;
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.classList.toggle('active', btn.dataset.filter===filter));
}
function exportData(){
  const payload={version:2, exported:new Date().toISOString(), days:state.days, body:state.body};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='90-day-recomp-backup.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
  toast('Backup downloaded');
}
function importData(file){
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!data || typeof data!=='object' || (!data.days && !data.body)) throw new Error('bad');
      if(!confirm('Replace the progress on this device with that backup?')) return;
      state={
        days:data.days && typeof data.days==='object'?data.days:{},
        body:Array.isArray(data.body)?data.body.filter(e=>e&&e.date&&num(e.weight)!=null).map(e=>({date:e.date, weight:num(e.weight), waist:num(e.waist)})):[]
      };
      save();
      render(true);
      toast('Backup restored');
    }catch(err){toast('That file could not be read')}
  };
  reader.readAsText(file);
}
function resetProgress(){
  if(!confirm('Erase logged workouts, notes, weights, and weigh-ins on this device?')) return;
  state={days:{}, body:[]};
  save();
  render(false);
  toast('Progress cleared');
}
function saveBody(form){
  const date=form.date.value;
  const weight=num(form.weight.value);
  const waistRaw=form.waist.value.trim();
  const waist=waistRaw?num(waistRaw):null;
  const err=document.getElementById('body-error');
  if(!date || weight==null || weight<20 || weight>400){
    err.textContent='Enter a date and a weight in kilograms.';
    return;
  }
  if(waistRaw && (waist==null || waist<30 || waist>200)){
    err.textContent='Waist should be in centimeters, or leave it blank.';
    return;
  }
  state.body=state.body.filter(e=>e.date!==date);
  state.body.push({date, weight, waist});
  state.body.sort((a,b)=>a.date<b.date?-1:1);
  save();
  render(true);
  toast('Weigh-in saved');
}

document.addEventListener('click', e=>{
  const nav=e.target.closest('[data-nav]');
  if(nav){openSection(nav.dataset.nav); return}
  const t=e.target.closest('[data-action]');
  if(!t) return;
  const a=t.dataset.action;
  if(a==='back') goBack();
  else if(a==='shift-week') shiftWeek(Number(t.dataset.dir));
  else if(a==='this-week'){const day=focusDay(); weekAnchor=mondayOf(day.d); selectedKey=day.key; render(false)}
  else if(a==='select-day'){selectedKey=t.dataset.key; render(true)}
  else if(a==='goto-day') gotoDay(t.dataset.key);
  else if(a==='open-next' && chromeNextKey) gotoDay(chromeNextKey);
  else if(a==='open-plan') openPlan(t.dataset.key);
  else if(a==='toggle-day') toggleDay(t.dataset.key);
  else if(a==='use-last') useWeight(t.dataset.key, t.dataset.name, t.dataset.value);
  else if(a==='fill-weights') fillWeights(t.dataset.key);
  else if(a==='filter'){filter=t.dataset.filter; refreshPlanList()}
  else if(a==='clear-filters'){filter='all'; query=''; render(true)}
  else if(a==='jump-month') document.getElementById('month-'+t.dataset.month)?.scrollIntoView({behavior:'smooth', block:'start'});
  else if(a==='show-guide'){setView('progress'); document.getElementById('guide')?.scrollIntoView({behavior:'smooth'})}
  else if(a==='export') exportData();
  else if(a==='import') document.getElementById('import-file').click();
  else if(a==='reset') resetProgress();
  else if(a==='delete-body'){
    state.body=state.body.filter(x=>x.date!==t.dataset.date);
    save(); render(true); toast('Weigh-in removed');
  }
});
document.addEventListener('change', e=>{
  const t=e.target;
  if(t.dataset.action==='check-ex') toggleEx(t.dataset.key, t.dataset.name);
  if(t.dataset.action==='check-meal'){
    const rec=ensure(t.dataset.key);
    rec.eaten[t.dataset.slot]=t.checked;
    save();
    render(true);
  }
});
document.addEventListener('input', e=>{
  const t=e.target;
  if(t.id==='search'){
    query=t.value;
    refreshPlanList();
    return;
  }
  if(t.dataset.action==='note'){
    ensure(t.dataset.key).notes=t.value;
    save();
  }
  if(t.dataset.action==='weight'){
    ensure(t.dataset.key).weights[t.dataset.name]=t.value;
    save();
    const last=num(t.dataset.last);
    const now=num(t.value);
    let el=t.parentElement.querySelector('.delta');
    if(last==null || now==null){ if(el) el.remove(); return }
    const d=Math.round((now-last)*10)/10;
    if(!el){el=document.createElement('span'); t.parentElement.appendChild(el)}
    el.className='delta '+(d>0?'up':d<0?'down':'');
    el.textContent=d>0?`+${d} kg`:d<0?`${d} kg`:'Same weight';
  }
});
document.addEventListener('submit', e=>{
  if(e.target.id!=='body-form') return;
  e.preventDefault();
  saveBody(e.target);
});
document.getElementById('import-file').addEventListener('change', e=>{
  const file=e.target.files&&e.target.files[0];
  e.target.value='';
  if(file) importData(file);
});
document.addEventListener('keydown', e=>{
  if(view!=='week' && view!=='diet') return;
  if(e.target.matches('input, textarea')) return;
  if(e.key==='ArrowLeft') shiftWeek(-1);
  if(e.key==='ArrowRight') shiftWeek(1);
});

if(!storageOK) document.getElementById('storage-warn').hidden=false;
render(false);
