import { useState } from 'react';
import { bodyRows, chartModel, weightChange } from '../lib/body.js';
import { fmt, num } from '../lib/dates.js';
import { defaultLogDate, gymCount, isPast, isToday, plan, position } from '../lib/plan.js';
import { dayTotal, gymStreak, loggedCount, monthBoards, phaseStats, progressOf, sessionsDone } from '../lib/progress.js';
import { useTracker } from '../state/Tracker.jsx';
import { openImport } from '../layout/ImportFile.jsx';

export function Progress(){
  const app = useTracker();
  const days = app.log.days;
  const logged = loggedCount(days);
  const sessions = sessionsDone(days);
  const streak = gymStreak(days);
  const pct = Math.round(logged/dayTotal*100);
  const gaps = monthGaps(days);
  const pos = position();
  const activePhase = pos.mode==='during'?pos.day.phase:pos.mode==='after'?'Intensification':'Foundation';
  const entries = bodyRows(app.log.body);
  const phases = phaseStats(days, activePhase);
  const months = monthBoards(days);
  return (
    <div className="stack">
      <section className="card">
        <h2>Body weight</h2>
        <p className="muted" style={{marginTop:0}}>{weightChange(entries)}</p>
        <WeightChart entries={entries}/>
      </section>
      <section className="metrics">
        <div className="metric"><b>{pct}%</b><span>Days logged</span></div>
        <div className="metric"><b>{sessions}<span style={{fontSize:16,color:'var(--muted)'}}>/{gymCount}</span></b><span>Gym sessions</span></div>
        <div className="metric"><b>{streak}</b><span>Gym streak</span></div>
        <div className="metric"><b>{gaps}</b><span>Past days not logged</span></div>
      </section>
      <section className="card">
        <h2>Phases</h2>
        <div className="phase">
          {phases.map(({phase, done, width, total, active})=>(
            <div className={'phase-card'+(active?' active':'')} key={phase.name}>
              <div className="phase-top"><strong>{phase.name}</strong><span className="muted">Days {phase.from+1}–{phase.to}</span></div>
              <p className="muted" style={{margin:'6px 0'}}>{phase.text}</p>
              <div className="track"><i style={{width:width+'%'}}></i></div>
              <p className="muted" style={{margin:'6px 0 0'}}>{done} of {total} days logged</p>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>90-day board</h2>
        <p className="muted" style={{marginTop:0}}>Green means every exercise that day is done. A darker green or red means more of that day is finished. Gray is a holiday. Tap a day to open that week.</p>
        <div className="legend" style={{marginBottom:12}}>
          <span><i className="swatch" style={{background:'#157a45'}}></i>All done</span>
          <span><i className="swatch" style={{background:'#c4474a'}}></i>Not finished</span>
          <span><i className="swatch" style={{background:'#8d93a8'}}></i>Holiday</span>
          <span><i className="swatch" style={{background:'#2a2750'}}></i>Ahead</span>
        </div>
        <div className="months-heat">
          {months.map(m=>(
            <div key={m.id}>
              <h3 style={{margin:'0 0 6px'}}>{m.label}</h3>
              <div className="heat-dow"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
              <div className="heat">
                {Array.from({length:m.pad}, (_,i)=><span className="cell is-pad" key={'p'+i}></span>)}
                {m.cells.map(({day, tone, label, detail})=>{
                  const title=fmt(day.d)+' · '+label+' · '+detail;
                  const cls=['cell', tone.cls, isToday(day)?'is-today':''].filter(Boolean).join(' ');
                  return <button className={cls} type="button" key={day.key} style={tone.style} title={title} onClick={()=>app.gotoDay(day.key)}>{day.d.getDate()}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="split">
        <BodyForm/>
        <section className="card" id="guide">
          <h2>Plan rules</h2>
          <div className="guide-grid">
            <div><h3>Training</h3><p className="muted">Follow the card for that day. Sets and reps already include the phase change, so you do not recalculate them.</p></div>
            <div><h3>Progress</h3><p className="muted">Top of the rep range, clean form, then the smallest weight jump. Log the load so the next session shows it.</p></div>
            <div><h3>Rest</h3><p className="muted">Sundays are closed. Public holidays in this plan are rest days too. Festival dates that are not public holidays stay as training days.</p></div>
            <div><h3>Shoulder</h3><p className="muted">Do not push through shoulder pain. Comfortable range only. Get clinician or physio clearance if a movement causes pain, instability, numbness, or a slipping feeling.</p></div>
            <div><h3>Food</h3><p className="muted">Three Maharashtrian meals a day, with bhakri at lunch. Open Diet for the plate, the portions, and the calories, protein, and fiber.</p></div>
          </div>
          <h3 style={{marginTop:16}}>Your data</h3>
          <p className="muted">Workouts, notes, weights, and weigh-ins are saved on this phone or computer only. Export a backup before you switch devices.</p>
          <div className="pills">
            <button className="btn btn-ghost" style={{width:'auto'}} type="button" onClick={app.exportData}>Export backup</button>
            <button className="btn btn-ghost" style={{width:'auto'}} type="button" onClick={openImport}>Import backup</button>
            <button className="btn btn-tiny" type="button" onClick={app.resetProgress}>Reset progress</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function monthGaps(days){
  return plan.filter(d=>d.type!=='rest' && isPast(d) && !progressOf(d, days).done).length;
}

function WeightChart({entries}){
  const model=chartModel(entries);
  if(!model) return null;
  const {w,h,l,t,base,min,max,pts,line,area,first,last}=model;
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Body weight over time">
      <text x="4" y="16" fill="#a3abcc" fontSize="13" fontWeight="700">{max} kg</text>
      <text x="4" y={base-4} fill="#a3abcc" fontSize="13" fontWeight="700">{min} kg</text>
      <line x1={l} y1={t} x2={l} y2={base} stroke="rgba(176,190,255,.28)"/>
      <line x1={l} y1={base} x2={w-16} y2={base} stroke="rgba(176,190,255,.28)"/>
      <polygon points={area} fill="rgba(126,176,255,.18)"/>
      <polyline fill="none" stroke="#7eb0ff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={line}/>
      {pts.map(p=><circle key={p.e.date} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4.5" fill="#7eb0ff" stroke="#0c0a22" strokeWidth="1.5"><title>{fmt(new Date(p.e.date+'T00:00:00'), true)} · {p.e.weight} kg</title></circle>)}
      <text x={pts[0].x} y={h-10} fill="#a3abcc" fontSize="13" fontWeight="700" textAnchor={entries.length===1?'middle':'start'}>{fmt(new Date(first.date+'T00:00:00'))}</text>
      {entries.length>1 ? <text x={pts[pts.length-1].x} y={h-10} fill="#a3abcc" fontSize="13" fontWeight="700" textAnchor="end">{fmt(new Date(last.date+'T00:00:00'))}</text> : null}
    </svg>
  );
}

function BodyForm(){
  const {log, saveBodyForm, deleteBody} = useTracker();
  const entries=bodyRows(log.body);
  const [error, setError] = useState('');
  function onSubmit(e){
    e.preventDefault();
    const form=e.target;
    const date=form.date.value;
    const weight=num(form.weight.value);
    const waistRaw=form.waist.value.trim();
    const waist=waistRaw?num(waistRaw):null;
    if(!date || weight==null || weight<20 || weight>400){
      setError('Enter a date and a weight in kilograms.');
      return;
    }
    if(waistRaw && (waist==null || waist<30 || waist>200)){
      setError('Waist should be in centimeters, or leave it blank.');
      return;
    }
    setError('');
    saveBodyForm(date, weight, waist);
  }
  return (
    <section className="card">
      <h2>Edit a weigh-in</h2>
      <form className="body-form" id="body-form" key={entries.map(e=>e.date+':'+e.weight+':'+e.waist).join('|')} onSubmit={onSubmit}>
        <div className="form-row">
          <label className="field">Date<input type="date" name="date" required defaultValue={defaultLogDate()}/></label>
          <label className="field">Weight (kg)<input name="weight" inputMode="decimal" required placeholder="78.5" autoComplete="off"/></label>
        </div>
        <label className="field">Waist (cm, optional)<input name="waist" inputMode="decimal" placeholder="86" autoComplete="off"/></label>
        <p className="err">{error}</p>
        <button className="btn btn-primary" type="submit">Save weigh-in</button>
      </form>
      <div style={{marginTop:8}}>
        {entries.slice().reverse().map(e=>(
          <div className="log-row" key={e.date}>
            <span><strong>{e.weight} kg</strong> <span className="muted">{fmt(new Date(e.date+'T00:00:00'), true)}{e.waist? ' · waist '+e.waist+' cm':''}</span></span>
            <button className="btn-tiny" type="button" onClick={()=>deleteBody(e.date)}>Remove</button>
          </div>
        ))}
        {entries.length ? null : <p className="muted">No weigh-ins yet.</p>}
      </div>
    </section>
  );
}
