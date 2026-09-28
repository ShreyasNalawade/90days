import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WORKOUTS } from '../data/plans.js';
import { upsertBody } from '../lib/body.js';
import { iso, mondayOf } from '../lib/dates.js';
import { defaultAnchor, firstMonday, focusDay, lastMonday, namesOf, plan, planByKey, position } from '../lib/plan.js';
import { checkMap, lastWeight, nextOpenGym, progressOf } from '../lib/progress.js';
import { emptyLog, initialView, load, readBackup, rememberView, save, storageAvailable } from '../lib/storage.js';

const TrackerContext = createContext(null);
export function useTracker(){ return useContext(TrackerContext); }

function freshRec(rec){
  const base=rec||{};
  return {
    done:!!base.done,
    notes:base.notes||'',
    weights:{...(base.weights||{})},
    checks:{...(base.checks||{})},
    eaten:{...(base.eaten||{})}
  };
}

export function TrackerProvider({children}){
  const [log, setLog] = useState(load);
  const [storageOK, setStorageOK] = useState(storageAvailable);
  const [view, setView] = useState(initialView);
  const [weekAnchor, setWeekAnchor] = useState(defaultAnchor);
  const [selectedKey, setSelectedKey] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState('');
  const [guideTick, setGuideTick] = useState(0);
  const toastTimer = useRef(0);
  const pendingScroll = useRef(null);
  const logRef = useRef(log);
  const viewRef = useRef(view);
  const weekRef = useRef(weekAnchor);
  const keyRef = useRef(selectedKey);
  const historyRef = useRef(history);
  logRef.current = log;
  viewRef.current = view;
  weekRef.current = weekAnchor;
  keyRef.current = selectedKey;
  historyRef.current = history;

  function ping(msg){
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(''), 2200);
  }
  function commit(next, keepScroll){
    if(!save(next)) setStorageOK(false);
    setLog(next);
    if(!keepScroll) pendingScroll.current = 0;
  }
  function patchDay(key, fn, keepScroll){
    const prev = logRef.current;
    const rec = fn(freshRec(prev.days[key]), prev);
    commit({...prev, days:{...prev.days, [key]:rec}}, keepScroll);
  }
  function remember(){
    const row={view:viewRef.current, weekAnchor:iso(weekRef.current), selectedKey:keyRef.current, scroll:window.scrollY};
    setHistory(h=>{
      const next=[...h, row];
      return next.length>40 ? next.slice(next.length-40) : next;
    });
  }
  function applyView(next){
    setView(next);
    rememberView(next);
    pendingScroll.current = 0;
  }

  function openSection(name){
    if(name==='plan') name='week';
    if(name==='today' || name==='week' || name==='diet'){
      const day=focusDay();
      setWeekAnchor(mondayOf(day.d));
      setSelectedKey(day.key);
    }
    if(viewRef.current!==name){
      remember();
      applyView(name);
    }else pendingScroll.current = 0;
  }
  function goBack(){
    const stack=historyRef.current;
    const prev=stack[stack.length-1];
    if(!prev){
      if(viewRef.current!=='today') applyView('today');
      return;
    }
    setHistory(stack.slice(0, -1));
    const nextView=prev.view==='plan'?'week':prev.view;
    const parts=prev.weekAnchor.split('-').map(Number);
    setWeekAnchor(new Date(parts[0], parts[1]-1, parts[2]));
    setSelectedKey(prev.selectedKey);
    pendingScroll.current = prev.scroll||0;
    setView(nextView);
    rememberView(nextView);
  }
  function shiftWeek(dir){
    const next=new Date(weekRef.current);
    next.setDate(next.getDate()+dir*7);
    if(next<firstMonday || next>lastMonday) return;
    setWeekAnchor(next);
    setSelectedKey(null);
    pendingScroll.current = 0;
  }
  function thisWeek(){
    const day=focusDay();
    setWeekAnchor(mondayOf(day.d));
    setSelectedKey(day.key);
    pendingScroll.current = 0;
  }
  function selectDay(key){ setSelectedKey(key); }
  function gotoDay(key){
    const day=planByKey[key];
    if(!day) return;
    if(viewRef.current!=='week') remember();
    setWeekAnchor(mondayOf(day.d));
    setSelectedKey(key);
    applyView('week');
  }
  function showGuide(){
    if(viewRef.current!=='progress') remember();
    applyView('progress');
    setGuideTick(n=>n+1);
  }
  function toggleDay(key){
    const day=planByKey[key];
    const names=namesOf(day);
    patchDay(key, (rec, prev)=>{
      const turningOff=progressOf(day, prev.days).done;
      rec.done=!turningOff;
      rec.checks={};
      names.forEach(n=>{rec.checks[n]=rec.done});
      return rec;
    }, true);
  }
  function toggleEx(key, name){
    const day=planByKey[key];
    const names=namesOf(day);
    patchDay(key, rec=>{
      const map=checkMap(rec, names);
      map[name]=!map[name];
      rec.checks=map;
      rec.done=names.every(n=>map[n]);
      return rec;
    }, true);
  }
  function setNote(key, notes){
    patchDay(key, rec=>{rec.notes=notes; return rec}, true);
  }
  function setLiftWeight(key, name, value){
    patchDay(key, rec=>{rec.weights[name]=value; return rec}, true);
  }
  function fillWeights(key){
    const day=planByKey[key];
    let n=0;
    patchDay(key, (rec, prev)=>{
      WORKOUTS[day.type].exercises.forEach(ex=>{
        if(ex.hold) return;
        if(rec.weights[ex.name] && String(rec.weights[ex.name]).trim()) return;
        const last=lastWeight(key, ex.name, prev.days);
        if(last){rec.weights[ex.name]=last.value; n++}
      });
      return rec;
    }, true);
    ping(n?`Filled ${n} weight${n===1?'':'s'}`:'Nothing to fill');
  }
  function setBodyWeight(date, weight){
    const prev=logRef.current;
    commit({...prev, body:upsertBody(prev.body, date, weight)}, true);
  }
  function saveBodyForm(date, weight, waist){
    const prev=logRef.current;
    commit({...prev, body:upsertBody(prev.body, date, weight, waist)}, true);
    ping('Weigh-in saved');
  }
  function deleteBody(date){
    const prev=logRef.current;
    commit({...prev, body:prev.body.filter(x=>x.date!==date)}, true);
    ping('Weigh-in removed');
  }
  function toggleMeal(key, slot, checked){
    patchDay(key, rec=>{rec.eaten[slot]=checked; return rec}, true);
  }
  function exportData(){
    const payload={version:2, exported:new Date().toISOString(), days:logRef.current.days, body:logRef.current.body};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='90-day-recomp-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
    ping('Backup downloaded');
  }
  function importData(file){
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=readBackup(JSON.parse(reader.result));
        if(!confirm('Replace the progress on this device with that backup?')) return;
        commit(data, true);
        ping('Backup restored');
      }catch(err){ping('That file could not be read')}
    };
    reader.readAsText(file);
  }
  function resetProgress(){
    if(!confirm('Erase logged workouts, notes, weights, and weigh-ins on this device?')) return;
    commit(emptyLog(), false);
    ping('Progress cleared');
  }

  useLayoutEffect(()=>{
    if(pendingScroll.current==null) return;
    const y=pendingScroll.current;
    pendingScroll.current=null;
    window.scrollTo(0, y);
  });
  useEffect(()=>{
    if(!guideTick) return;
    document.getElementById('guide')?.scrollIntoView({behavior:'smooth'});
  }, [guideTick]);

  const value={
    log, storageOK, view, weekAnchor, selectedKey, toast, history,
    openSection, goBack, shiftWeek, thisWeek, selectDay, gotoDay, showGuide,
    toggleDay, toggleEx, setNote, setLiftWeight, fillWeights,
    setBodyWeight, saveBodyForm, deleteBody, toggleMeal, exportData, importData, resetProgress
  };
  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function upcomingSession(days){
  const pos=position();
  return (pos.mode==='during' && pos.day.type!=='rest' && !progressOf(pos.day, days).done
    ? pos.day
    : nextOpenGym(pos.mode==='during'?pos.day.key:null, days) || plan.filter(d=>d.type!=='rest').at(-1)) || null;
}
