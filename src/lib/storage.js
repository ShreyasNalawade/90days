import { num } from './dates.js';

export const STORAGE = 'shreyas_90_day_recomp_v2';
export const OLD = 'shreyas_90_day_recomp_v1';

export function storageAvailable(){
  try{localStorage.setItem('__recomp','1'); localStorage.removeItem('__recomp'); return true}
  catch(e){return false}
}
export function load(){
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
export function save(state){
  try{localStorage.setItem(STORAGE, JSON.stringify(state)); return true}
  catch(e){return false}
}
export function emptyLog(){return {days:{}, body:[]}}
export function readBackup(data){
  if(!data || typeof data!=='object' || (!data.days && !data.body)) throw new Error('bad');
  return {
    days:data.days && typeof data.days==='object'?data.days:{},
    body:Array.isArray(data.body)?data.body.filter(e=>e&&e.date&&num(e.weight)!=null).map(e=>({date:e.date, weight:num(e.weight), waist:num(e.waist)})):[]
  };
}
export function initialView(){
  try{
    const saved=sessionStorage.getItem('recomp-view');
    if(saved==='plan') return 'week';
    if(['today','week','diet','progress'].includes(saved)) return saved;
  }catch(e){}
  return 'today';
}
export function rememberView(view){
  try{sessionStorage.setItem('recomp-view', view)}catch(e){}
}
