import { DAYS, START } from '../data/plans.js';
import { addDays, fmt, iso, startOfDay, today } from '../lib/dates.js';
import { defaultAnchor, firstMonday, focusDay, lastMonday, menuFor, plan, planByKey, resolvedKey, weekDays } from '../lib/plan.js';
import { isToday } from '../lib/plan.js';
import { useTracker } from '../state/Tracker.jsx';
import { DietCard } from './Session.jsx';

export function Diet(){
  const app = useTracker();
  const days=weekDays(app.weekAnchor);
  const selectedKey=resolvedKey(app.weekAnchor, app.selectedKey);
  const selected=planByKey[selectedKey]||focusDay();
  const start=Math.min(selected.i, DAYS-3);
  const trio=[plan[start], plan[start+1], plan[start+2]];
  const atStart=iso(app.weekAnchor)===iso(firstMonday);
  const atEnd=iso(app.weekAnchor)===iso(lastMonday);
  const onDefault=iso(app.weekAnchor)===iso(defaultAnchor());
  return (
    <div className="stack">
      <section className="card">
        <h2>Maharashtrian plate</h2>
        <p className="muted" style={{marginTop:0}}>Normal home food for seven days, then it repeats. No egg, chicken, fish, meat, or protein powder. Every lunch has one bhakri. Dahi is at lunch only.</p>
        <div className="pills">
          <span className="pill">1,650–1,800 kcal</span>
          <span className="pill">115–125 g protein</span>
          <span className="pill">Paneer · 1 day</span>
          <span className="pill">Soya · 1 day</span>
        </div>
        <p className="muted" style={{margin:'10px 0 0'}}>Protein comes from dal, besan, sprouts, skimmed milk, and low-fat dahi at lunch. Paneer is one lunch in the cycle. Soya chunks are one dinner. Use about ½ teaspoon of oil in a cooked dish. Full-cream milk will push the day over 1,800 kcal.</p>
      </section>
      <div className="card">
        <div className="week-bar">
          <button className="icon-btn" type="button" disabled={atStart} aria-label="Previous week" onClick={()=>app.shiftWeek(-1)}>‹</button>
          <div>
            <h2>{fmt(app.weekAnchor)} – {fmt(addDays(app.weekAnchor,6))}</h2>
            <p className="muted" style={{margin:'4px 0 0'}}>Pick a day. The three cards are that day and the next two.</p>
          </div>
          <button className="icon-btn" type="button" disabled={atEnd} aria-label="Next week" onClick={()=>app.shiftWeek(1)}>›</button>
        </div>
        {onDefault ? null : <p style={{margin:'10px 0 0'}}><button className="linkish" type="button" onClick={app.thisWeek}>{today()<START?'Show opening week':'Jump to this week'}</button></p>}
      </div>
      <div className="week-strip is-static">
        {days.map(d=>{
          const key=iso(d);
          const day=planByKey[key];
          if(!day){
            const tag=startOfDay(d)<START?'Before':'After';
            return <button className="week-day is-out" type="button" disabled key={key}><small>{d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>{d.getDate()}</b><em>{tag}</em></button>;
          }
          const plate=menuFor(day);
          const label=plate.paneer?'Paneer':plate.soy?'Soya':plate.short;
          const cls=['week-day', key===selectedKey?'is-selected':'', isToday(day)?'is-today':''].filter(Boolean).join(' ');
          return <button className={cls} type="button" key={key} onClick={()=>app.selectDay(key)}><small>{d.toLocaleDateString('en-IN',{weekday:'short'})}</small><b>{d.getDate()}</b><em>{label}</em></button>;
        })}
      </div>
      {start!==selected.i ? <p className="rule">These are the last three days of the plan.</p> : null}
      <div className="diet-cols">
        {trio.map(day=><DietCard key={day.key} day={day} on={day.key===selected.key}/>)}
      </div>
      <p className="muted">Tick a meal after you eat it. The figures are kitchen estimates, rounded, and the day total is the sum of the three meals. Water is free. Tea or coffee without sugar can be extra.</p>
    </div>
  );
}
