import { WORKOUTS } from '../data/plans.js';
import { START } from '../data/plans.js';
import { addDays, fmt, iso, startOfDay, today } from '../lib/dates.js';
import { firstMonday, isPast, isToday, kindOf, lastMonday, planByKey, resolvedKey, weekDays } from '../lib/plan.js';
import { defaultAnchor } from '../lib/plan.js';
import { progressOf } from '../lib/progress.js';
import { useTracker } from '../state/Tracker.jsx';
import { DietEmbed, Hero, Session, SideFacts } from './Session.jsx';

export function Week(){
  const app = useTracker();
  const days=weekDays(app.weekAnchor);
  const selectedKey=resolvedKey(app.weekAnchor, app.selectedKey);
  const selected=planByKey[selectedKey];
  const gym=days.map(d=>planByKey[iso(d)]).filter(d=>d&&d.type!=='rest');
  const gymDone=gym.filter(d=>progressOf(d, app.log.days).done).length;
  const atStart=iso(app.weekAnchor)===iso(firstMonday);
  const atEnd=iso(app.weekAnchor)===iso(lastMonday);
  const onDefault=iso(app.weekAnchor)===iso(defaultAnchor());
  return (
    <div className="stack">
      <div className="card">
        <div className="week-bar">
          <button className="icon-btn" type="button" disabled={atStart} aria-label="Previous week" onClick={()=>app.shiftWeek(-1)}>‹</button>
          <div>
            <h2>{fmt(app.weekAnchor)} – {fmt(addDays(app.weekAnchor,6))}</h2>
            <p className="muted" style={{margin:'4px 0 0'}}>{gymDone} of {gym.length} gym days logged this week</p>
          </div>
          <button className="icon-btn" type="button" disabled={atEnd} aria-label="Next week" onClick={()=>app.shiftWeek(1)}>›</button>
        </div>
        {onDefault ? null : <p style={{margin:'10px 0 0'}}><button className="linkish" type="button" onClick={app.thisWeek}>{today()<START?'Show opening week':'Jump to this week'}</button></p>}
      </div>
      <div className="week-strip">
        {days.map(d=>{
          const key=iso(d);
          const day=planByKey[key];
          if(!day){
            const tag=startOfDay(d)<START?'Before':'After';
            return <button className="week-day is-out" type="button" disabled key={key}><small>{d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>{d.getDate()}</b><em>{tag}</em></button>;
          }
          const prog=progressOf(day, app.log.days);
          const kind=kindOf(day);
          const label=day.type==='rest'?(day.holiday?'Off':'Rest'):WORKOUTS[day.type].title;
          const cls=['week-day', kind, key===selectedKey?'is-selected':'', isToday(day)?'is-today':'', prog.done?'is-done':'', isPast(day)&&!prog.done&&day.type!=='rest'?'is-missed':''].filter(Boolean).join(' ');
          return <button className={cls} type="button" key={key} onClick={()=>app.selectDay(key)}><small>{d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>{d.getDate()}</b><em>{label}</em></button>;
        })}
      </div>
      {selected ? (
        <div className="day-page">
          <div className="stack session">
            <Hero day={selected}/>
            <Session day={selected}/>
          </div>
          <SideFacts day={selected}/>
          <DietEmbed day={selected}/>
        </div>
      ) : null}
    </div>
  );
}
