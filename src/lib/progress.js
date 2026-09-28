import { DAYS, PHASES, WORKOUTS } from '../data/plans.js';
import { iso, today } from './dates.js';
import { isPast, isToday, namesOf, plan, sessionParts } from './plan.js';

export function checkMap(rec, names){
  const explicit=rec.checks && Object.keys(rec.checks).length>0;
  const map={};
  names.forEach(n=>{map[n]=explicit?!!rec.checks[n]:!!rec.done});
  return map;
}
export function progressOf(day, days){
  const rec=(days&&days[day.key])||{done:false, notes:'', weights:{}, checks:{}};
  const names=namesOf(day);
  const map=checkMap(rec, names);
  const checked=names.filter(n=>map[n]).length;
  return {done:!!rec.done||(names.length>0 && checked===names.length), checked, total:names.length, map};
}
export function lastWeight(key, name, days){
  const idx=plan.findIndex(d=>d.key===key);
  for(let i=idx-1;i>=0;i--){
    const v=days[plan[i].key]?.weights?.[name];
    if(v!=null && String(v).trim()!=='') return {value:String(v), date:plan[i].d};
  }
  return null;
}
export function gymStreak(days){
  const rows=plan.filter(d=>{
    if(d.type==='rest') return false;
    if(isPast(d)) return true;
    return isToday(d) && progressOf(d, days).done;
  });
  let n=0;
  for(let i=rows.length-1;i>=0;i--){
    if(progressOf(rows[i], days).done) n++;
    else break;
  }
  return n;
}
export function loggedCount(days){return plan.filter(d=>progressOf(d, days).done).length}
export function sessionsDone(days){return plan.filter(d=>d.type!=='rest' && progressOf(d, days).done).length}
export function nextOpenGym(afterKey, days){
  let i=0;
  if(afterKey) i=plan.findIndex(d=>d.key===afterKey)+1;
  else {
    i=plan.findIndex(d=>d.key>=iso(today()));
    if(i<0) i=0;
  }
  for(;i<plan.length;i++){
    if(plan[i].type!=='rest' && !progressOf(plan[i], days).done) return plan[i];
  }
  return null;
}
export function counted(items, map){return items.filter(item=>map[item.name]).length}
export function boardTone(day, prog){
  if(day.holiday) return {cls:'is-holiday', style:undefined};
  if(!isPast(day) && !isToday(day)) return {cls:'is-ahead', style:undefined};
  const ratio=prog.total?(prog.done?1:prog.checked/prog.total):(prog.done?1:0);
  if(ratio>=1){
    return {cls:'is-complete', style:{background:'#0f6b3c', color:'#f3fff7'}};
  }
  const light=Math.round(58-ratio*22);
  const color=light<46?'#fff7f6':'#3a1212';
  return {cls:'is-open', style:{background:`hsl(4 72% ${light}%)`, color}};
}
export function monthBoards(days){
  const months=[];
  plan.forEach(day=>{
    const id=day.key.slice(0,7);
    let m=months.find(x=>x.id===id);
    if(!m){m={id, label:day.d.toLocaleDateString('en-IN',{month:'long'}), days:[]}; months.push(m)}
    m.days.push(day);
  });
  return months.map(m=>{
    const first=m.days[0].d;
    const pad=(first.getDay()+6)%7;
    const cells=m.days.map(day=>{
      const prog=progressOf(day, days);
      const tone=boardTone(day, prog);
      const label=day.type==='rest'?day.restLabel:WORKOUTS[day.type].title;
      const ratio=prog.total?(prog.done?prog.total:prog.checked):0;
      const detail=day.holiday?'Holiday':(tone.cls==='is-ahead'?'Ahead':`${ratio} of ${prog.total} done`);
      return {day, prog, tone, label, detail};
    });
    return {id:m.id, label:m.label, pad, cells};
  });
}
export function phaseStats(days, activePhase){
  return PHASES.map(p=>{
    const slice=plan.slice(p.from, p.to);
    const done=slice.filter(d=>progressOf(d, days).done).length;
    const width=Math.round(done/slice.length*100);
    return {phase:p, done, width, total:slice.length, active:p.name===activePhase};
  });
}
export const dayTotal=DAYS;
