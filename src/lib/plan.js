import { DAYS, FOOD, HOLIDAYS, MENUS, PREP, REST_MOBILITY, START, WORKOUTS } from '../data/plans.js';
import { addDays, iso, mondayOf, phaseName, startOfDay, today } from './dates.js';

export function buildDays(){
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

export const plan=buildDays();
export const planByKey=Object.fromEntries(plan.map(d=>[d.key, d]));
export const END=plan[plan.length-1].d;
export const firstMonday=mondayOf(START);
export const lastMonday=mondayOf(END);
export const gymCount=plan.filter(d=>d.type!=='rest').length;

export function focusDay(){
  const key=iso(today());
  if(planByKey[key]) return planByKey[key];
  if(today()<START) return plan[0];
  return plan[plan.length-1];
}
export function defaultAnchor(){
  return mondayOf(focusDay().d);
}
export function position(){
  const t=today();
  if(t<START) return {mode:'before', days:Math.round((START-t)/86400000)};
  if(t>END) return {mode:'after'};
  const day=planByKey[iso(t)];
  return {mode:'during', day};
}
export function isPast(day){return startOfDay(day.d)<today()}
export function isToday(day){return day.key===iso(today())}
export function kindOf(day){
  if(day.type==='rest') return day.holiday?'holiday':'rest';
  return day.type;
}
export function sessionParts(day){
  if(day.type==='rest') return {warmup:[], lifts:[], stretch:REST_MOBILITY};
  const prep=PREP[day.type];
  return {warmup:prep.warmup, lifts:WORKOUTS[day.type].exercises, stretch:prep.stretch};
}
export function namesOf(day){
  const parts=sessionParts(day);
  return [...parts.warmup, ...parts.lifts, ...parts.stretch].map(item=>item.name);
}
export function prescription(ex, phase){
  let sets=ex.sets, reps=ex.reps;
  if(phase==='Progression'){
    if(sets===3 && reps==='8–12') reps='8–10';
    else if(sets===2 && reps==='8–12'){sets=3; reps='8–10'}
  }else if(phase==='Intensification'){
    if(sets===3 && reps==='8–12') reps='6–10';
  }
  return {sets, reps, text:sets+' × '+reps};
}
export function macrosOf(items){
  let k=0, p=0, f=0;
  items.forEach(it=>{
    const food=FOOD[it.id];
    k+=food.kcal*it.g; p+=food.p*it.g; f+=food.f*it.g;
  });
  return {kcal:Math.round(k), p:Math.round(p), f:Math.round(f)};
}
export function menuFor(day){
  const src=MENUS[day.i%7];
  const meals=src.meals.map(m=>({
    id:m.id, title:m.title, dish:m.dish, note:m.note||'',
    items:m.items.map(it=>({id:it.id, g:it.g, label:it.label}))
  }));
  const macros=meals.map(m=>macrosOf(m.items));
  const totals=macros.reduce((a,m)=>({kcal:a.kcal+m.kcal, p:a.p+m.p, f:a.f+m.f}), {kcal:0, p:0, f:0});
  const ids=meals.flatMap(m=>m.items.map(it=>it.id));
  return {cycle:day.i%7, name:src.name, short:src.short, paneer:ids.includes('paneer'), soy:ids.includes('soya'), meals, macros, totals};
}
export function portionLine(it){
  if(it.id==='oil') return '½ teaspoon oil';
  if(it.id==='milk' || it.id==='taak') return it.g+' ml '+it.label;
  return it.g+' g '+it.label;
}
export function plateNote(plate){
  if(plate.paneer) return 'Paneer day. This is the only paneer meal in the 7-day cycle.';
  if(plate.soy) return 'Soya day. This is the only soya meal in the 7-day cycle.';
  return 'No paneer or soya today.';
}
export function nextGym(fromKey){
  const start=fromKey?plan.findIndex(d=>d.key===fromKey)+1:0;
  const t=iso(today());
  const from=fromKey?start:plan.findIndex(d=>d.key>=t);
  const slice=plan.slice(Math.max(0, from));
  return slice.find(d=>d.type!=='rest')||null;
}
export function defaultLogDate(){
  const t=today();
  if(t<addDays(START,-21)) return iso(START);
  if(t>addDays(END,14)) return iso(END);
  return iso(t);
}
export function weekDays(anchor){
  return [0,1,2,3,4,5,6].map(i=>addDays(anchor, i));
}
export function resolvedKey(anchor, selectedKey){
  const days=weekDays(anchor);
  if(days.some(d=>iso(d)===selectedKey)) return selectedKey;
  const t=iso(today());
  return days.some(d=>iso(d)===t && planByKey[t]) ? t : iso(days.find(d=>planByKey[iso(d)])||days[0]);
}
