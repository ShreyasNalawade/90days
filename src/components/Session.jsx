import { useEffect, useState } from 'react';
import { IconRecipe } from './Icons.jsx';
import { MoveModal } from './MoveModal.jsx';
import { RecipeModal } from './RecipeModal.jsx';
import { DAYS, WORKOUTS } from '../data/plans.js';
import { bodyBefore, bodyOn, fluctuationText, weighNote } from '../lib/body.js';
import { addDays, fmt, fmtLong, num, today } from '../lib/dates.js';
import { gymCount, isPast, isToday, kindOf, menuFor, nextGym, plateNote, portionLine, prescription, sessionParts } from '../lib/plan.js';
import { counted, gymStreak, lastWeight, loggedCount, progressOf, sessionsDone } from '../lib/progress.js';
import { useTracker } from '../state/Tracker.jsx';

export function Hero({day}){
  const {log} = useTracker();
  const kind=kindOf(day);
  const prog=progressOf(day, log.days);
  const plate=menuFor(day);
  const w=day.type==='rest'?null:WORKOUTS[day.type];
  const label=day.type==='rest'?(day.holiday?'Holiday':'Rest'):w.title;
  const when=prog.done?'Logged':isToday(day)?'Today':day.key===isoTomorrow()?'Tomorrow':isPast(day)?'Not logged':'Ahead';
  return (
    <section className={'hero '+kind}>
      <p className="kicker">Day {day.i+1} of 90 · {day.phase}</p>
      <h2 className="hero-title">{fmtLong(day.d)}</h2>
      <p className="hero-sub">{day.type==='rest'?day.restLabel:w.focus}</p>
      <div className="pills">
        <span className={'badge '+kind}>{label.toUpperCase()}</span>
        {day.type!=='rest' ? <span className="pill">Warm-up · lifts · stretch</span> : null}
        <span className="pill">{when}</span>
        <span className="pill">{plate.totals.kcal.toLocaleString('en-IN')} kcal · {plate.totals.p} g protein</span>
      </div>
    </section>
  );
}
function isoTomorrow(){
  const d=addDays(today(),1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

export function NextCard({day}){
  const {gotoDay} = useTracker();
  const w=WORKOUTS[day.type];
  return (
    <button className="card next-card" type="button" onClick={()=>gotoDay(day.key)}>
      <span className="muted">Next gym session</span>
      <strong>{fmtLong(day.d)} · {w.title}</strong>
      <span className="muted">{w.focus} · {day.phase}</span>
    </button>
  );
}

export function SideFacts({day}){
  const {log, showGuide} = useTracker();
  const logged=loggedCount(log.days);
  const sessions=sessionsDone(log.days);
  const streak=gymStreak(log.days);
  const nxt=day?nextGym(day.key):null;
  const showNext=!day || day.type!=='rest';
  return (
    <div className="stack side">
      <div className="card">
        <h3>At a glance</h3>
        <div className="stat-row">
          <div className="stat"><b>{sessions}</b><span>Gym done</span></div>
          <div className="stat"><b>{gymCount-sessions}</b><span>Gym left</span></div>
          <div className="stat"><b>{streak}</b><span>Streak</span></div>
        </div>
        <div className="track" aria-hidden="true"><i style={{width:Math.round(logged/DAYS*100)+'%'}}></i></div>
        <p className="muted" style={{margin:'8px 0 0'}}>{logged} of {DAYS} days logged</p>
      </div>
      {showNext && nxt ? <NextCard day={nxt}/> : null}
      <div className="card">
        <h3>How a session works</h3>
        <p className="muted" style={{margin:0}}>Warm up first, tick each lift and log the weight, then stretch. Progress stays on this device.</p>
        <p style={{margin:'10px 0 0'}}><button className="linkish" type="button" onClick={showGuide}>Read the phase rules</button></p>
      </div>
    </div>
  );
}

function GuideButton({name, onOpen}){
  return (
    <button className="recipe-btn" type="button" aria-label={'How to do '+name} onClick={()=>onOpen(name)}>
      <IconRecipe/>
    </button>
  );
}

function StepRow({day, item, on, onOpen}){
  const {toggleEx} = useTracker();
  return (
    <div className={'ex'+(on?' done':'')}>
      <div className="ex-top">
        <label className="ex-hit">
          <input type="checkbox" checked={on} onChange={()=>toggleEx(day.key, item.name)}/>
          <span>
            <span className="ex-name">{item.name}</span>
            <span className="ex-rx"><span className="rest-tag">{item.how}</span></span>
          </span>
        </label>
        <GuideButton name={item.name} onOpen={onOpen}/>
      </div>
    </div>
  );
}

function LiftRow({day, ex, on, onOpen}){
  const {log, toggleEx, setLiftWeight} = useTracker();
  const rx=prescription(ex, day.phase);
  const last=lastWeight(day.key, ex.name, log.days);
  const cur=log.days[day.key]?.weights?.[ex.name]??'';
  const lastNum=last?num(last.value):null;
  const nowNum=num(cur);
  let delta=null;
  if(lastNum!=null && nowNum!=null){
    const d=Math.round((nowNum-lastNum)*10)/10;
    const cls=d>0?'up':d<0?'down':'';
    const txt=d>0?`+${d} kg`:d<0?`${d} kg`:'Same weight';
    delta=<span className={'delta '+cls}>{txt}</span>;
  }
  return (
    <div className={'ex'+(on?' done':'')}>
      <div className="ex-top">
        <label className="ex-hit">
          <input type="checkbox" checked={on} onChange={()=>toggleEx(day.key, ex.name)}/>
          <span>
            <span className="ex-name">{ex.name}</span>
            <span className="ex-rx"><span className="rx">{rx.text}</span><span className="rest-tag">Rest {ex.rest}</span></span>
          </span>
        </label>
        <GuideButton name={ex.name} onOpen={onOpen}/>
      </div>
      {ex.hold ? null : (
        <div className="ex-log">
          <input className="wt" inputMode="decimal" autoComplete="off" placeholder="kg" aria-label={'Weight for '+ex.name} value={cur} onChange={e=>setLiftWeight(day.key, ex.name, e.target.value)}/>
          {last ? <span className="last">Last {last.value} kg · {fmt(last.date)}</span> : null}
          {delta}
          {last && String(cur).trim()!==last.value ? <button className="btn-tiny" type="button" onClick={()=>setLiftWeight(day.key, ex.name, last.value)}>Use {last.value}</button> : null}
        </div>
      )}
    </div>
  );
}

export function WeighIn({day}){
  const {log, setBodyWeight} = useTracker();
  const saved=bodyOn(log.body, day.key);
  const savedText=saved && num(saved.weight)!=null ? String(saved.weight) : '';
  const [raw, setRaw] = useState(savedText);
  const [note, setNote] = useState(()=>weighNote(log.body, day.key));
  useEffect(()=>{
    setRaw(savedText);
    setNote(weighNote(log.body, day.key));
  }, [day.key, savedText, log.body]);
  function onInput(value){
    setRaw(value);
    const text=value.trim();
    if(!text){
      setBodyWeight(day.key, null);
      const prev=bodyBefore(log.body.filter(e=>e.date!==day.key), day.key);
      setNote(prev?`Last weigh-in ${prev.weight} kg · ${fmt(new Date(prev.date+'T00:00:00'))}`:'Log it once for this day. Progress draws the line from these numbers.');
      return;
    }
    const weight=num(text);
    if(weight==null || weight<20 || weight>400){
      if(!/^\d{0,2}\.?$/.test(text) && !/^\d{1,3}\.$/.test(text)) setNote('Enter a weight in kilograms.');
      return;
    }
    setBodyWeight(day.key, weight);
    const prev=bodyBefore(log.body, day.key);
    setNote(fluctuationText(weight, prev)||'Saved for this day.');
  }
  return (
    <section className="card weigh-in">
      <h3>Body weight</h3>
      <p className="muted" style={{margin:'0 0 8px'}}>After stretching, enter this day’s weight.</p>
      <label className="field">Weight (kg)
        <span className="weigh-box">
          <input type="number" inputMode="decimal" step="0.1" min="20" max="400" autoComplete="off" placeholder="78.5" aria-label="Body weight in kilograms" value={raw} onChange={e=>onInput(e.target.value)}/>
          <span className="unit">kg</span>
        </span>
      </label>
      <p className="muted" style={{margin:'8px 0 0'}}>{note}</p>
    </section>
  );
}

export function Exercise({day}){
  const {log, toggleDay, fillWeights, setNote} = useTracker();
  const [guide, setGuide] = useState(null);
  const w=WORKOUTS[day.type];
  const parts=sessionParts(day);
  const rec=log.days[day.key]||{weights:{}, notes:''};
  const prog=progressOf(day, log.days);
  const canFill=parts.lifts.some(ex=>{
    if(ex.hold) return false;
    const last=lastWeight(day.key, ex.name, log.days);
    const cur=rec.weights?.[ex.name];
    return last && !(cur && String(cur).trim());
  });
  const warmDone=counted(parts.warmup, prog.map);
  const liftDone=counted(parts.lifts, prog.map);
  const stretchDone=counted(parts.stretch, prog.map);
  const label=prog.done?'Session logged · tap to undo':prog.checked?`Finish session · ${prog.checked}/${prog.total}`:'Mark session complete';
  return (
    <div className="stack">
      <ol className="flow">
        <li><b>1 · Warm-up</b><span>{warmDone}/{parts.warmup.length} · about 5 min</span></li>
        <li><b>2 · Lifts</b><span>{liftDone}/{parts.lifts.length} ticked</span></li>
        <li><b>3 · Stretch</b><span>{stretchDone}/{parts.stretch.length} · about 5 min</span></li>
      </ol>
      <div className="session-label"><h3>Before · warm-up</h3><span className="muted">{warmDone}/{parts.warmup.length}</span></div>
      <p className="muted block-note" style={{margin:0}}>Do this before the first heavy set. Keep every move easy, especially around the shoulder.</p>
      {parts.warmup.map(item=><StepRow key={item.name} day={day} item={item} on={!!prog.map[item.name]} onOpen={setGuide}/>)}
      <div className="session-label"><h3>Workout</h3><span className="muted">{liftDone}/{parts.lifts.length}</span></div>
      {canFill ? <button className="btn btn-ghost" type="button" onClick={()=>fillWeights(day.key)}>Fill empty weights from last time</button> : null}
      {parts.lifts.map(ex=><LiftRow key={ex.name} day={day} ex={ex} on={!!prog.map[ex.name]} onOpen={setGuide}/>)}
      <p className="rule with-guide">
        <span>After the lifts: {w.cardio}. Then stretch.</span>
        <GuideButton name={w.cardio} onOpen={setGuide}/>
      </p>
      <div className="session-label"><h3>After · stretching</h3><span className="muted">{stretchDone}/{parts.stretch.length}</span></div>
      <p className="muted" style={{margin:0}}>Hold each stretch. Do not bounce. Stop if a shoulder pinches, slips, or feels unstable.</p>
      {parts.stretch.map(item=><StepRow key={item.name} day={day} item={item} on={!!prog.map[item.name]} onOpen={setGuide}/>)}
      <MoveModal name={guide} onClose={()=>setGuide(null)}/>
      <WeighIn day={day}/>
      <label className="field">Session note
        <textarea className="notes" placeholder="Sleep, energy, a sore spot, or the weight you want next time." value={rec.notes||''} onChange={e=>setNote(day.key, e.target.value)}/>
      </label>
      <button className={'btn '+(prog.done?'btn-done':'btn-primary')} type="button" onClick={()=>toggleDay(day.key)}>{label}</button>
      <p className="rule">When every set reaches the top of the rep range with clean form, add the smallest weight next time.</p>
    </div>
  );
}

export function Rest({day}){
  const {log, toggleDay, setNote} = useTracker();
  const [guide, setGuide] = useState(null);
  const prog=progressOf(day, log.days);
  const parts=sessionParts(day);
  const nxt=nextGym(day.key);
  const done=counted(parts.stretch, prog.map);
  return (
    <div className="stack">
      <div className="card">
        <h2>Recovery</h2>
        <p className="muted" style={{margin:0}}>No gym session. Sleep, food, and water come first. An easy walk and these stretches are recovery, not a workout.</p>
      </div>
      <div className="session-label"><h3>Easy mobility</h3><span className="muted">{done}/{parts.stretch.length}</span></div>
      {parts.stretch.map(item=><StepRow key={item.name} day={day} item={item} on={!!prog.map[item.name]} onOpen={setGuide}/>)}
      <MoveModal name={guide} onClose={()=>setGuide(null)}/>
      <WeighIn day={day}/>
      <label className="field">Note
        <textarea className="notes" placeholder="How recovery felt." value={log.days[day.key]?.notes||''} onChange={e=>setNote(day.key, e.target.value)}/>
      </label>
      <button className={'btn '+(prog.done?'btn-done':'btn-primary')} type="button" onClick={()=>toggleDay(day.key)}>{prog.done?'Recovery logged · tap to undo':'Log this recovery day'}</button>
      {nxt ? <NextCard day={nxt}/> : null}
    </div>
  );
}

export function Session({day}){
  return day.type==='rest' ? <Rest day={day}/> : <Exercise day={day}/>;
}

export function MacroGrid({m}){
  return (
    <div className="macro-grid">
      <div className="macro"><b>{m.kcal.toLocaleString('en-IN')}</b><span>kcal</span></div>
      <div className="macro"><b>{m.p} g</b><span>protein</span></div>
      <div className="macro"><b>{m.f} g</b><span>fiber</span></div>
    </div>
  );
}

export function DietCard({day, on}){
  const {log, toggleMeal} = useTracker();
  const [recipeMeal, setRecipeMeal] = useState(null);
  const plate=menuFor(day);
  return (
    <article className={'card diet-card'+(on?' is-on':'')}>
      <p className="kicker">Meal day {plate.cycle+1} of 7 · {plate.name}</p>
      <h2>{fmt(day.d, true)}</h2>
      <p className="muted" style={{margin:'6px 0 0'}}>{plateNote(plate)}</p>
      <MacroGrid m={plate.totals}/>
      <div className="stack" style={{marginTop:12}}>
        {plate.meals.map((meal,i)=>{
          const eaten=!!(log.days[day.key] && log.days[day.key].eaten && log.days[day.key].eaten[meal.id]);
          return (
            <div className={'meal'+(eaten?' done':'')} key={meal.id}>
              <div className="meal-head">
                <div>
                  <label className="ex-hit">
                    <input type="checkbox" checked={eaten} aria-label={'Mark '+meal.title+' eaten'} onChange={e=>toggleMeal(day.key, meal.id, e.target.checked)}/>
                    <span>
                      <span className="ex-name">{meal.title}</span>
                      <span className="dish">{meal.dish}</span>
                    </span>
                  </label>
                  {meal.note ? <p className="muted" style={{margin:'8px 0 0'}}>{meal.note}</p> : null}
                </div>
                <button className="recipe-btn" type="button" aria-label={'How to make '+meal.dish} onClick={()=>setRecipeMeal(meal)}>
                  <IconRecipe/>
                </button>
              </div>
              <ul className="portions">{meal.items.map((it,n)=><li key={n}>{portionLine(it)}</li>)}</ul>
              <MacroGrid m={plate.macros[i]}/>
            </div>
          );
        })}
      </div>
      <RecipeModal meal={recipeMeal} onClose={()=>setRecipeMeal(null)}/>
    </article>
  );
}

export function DietEmbed({day}){
  return <div className="stack diet-wide" id="meals"><DietCard day={day} on/></div>;
}
