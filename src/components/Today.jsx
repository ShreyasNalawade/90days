import { START } from '../data/plans.js';
import { fmtLong, today } from '../lib/dates.js';
import { END, focusDay, gymCount, plan } from '../lib/plan.js';
import { sessionsDone } from '../lib/progress.js';
import { useTracker } from '../state/Tracker.jsx';
import { DietEmbed, Hero, Session, SideFacts } from './Session.jsx';

export function Today(){
  const {log, openSection} = useTracker();
  if(today()>END){
    return (
      <div className="layout">
        <div className="stack">
          <section className="hero">
            <p className="kicker">{fmtLong(END)}</p>
            <h2 className="hero-title">The 90 days are complete</h2>
            <p className="hero-sub">{sessionsDone(log.days)} of {gymCount} gym sessions logged.</p>
            <div className="pills"><button className="btn btn-primary" style={{width:'auto'}} type="button" onClick={()=>openSection('progress')}>Open progress</button></div>
          </section>
        </div>
        <SideFacts day={plan[plan.length-1]}/>
      </div>
    );
  }
  const day=focusDay();
  const startsLater=today()<START;
  return (
    <div className="day-page">
      <div className="stack session">
        {startsLater ? <p className="rule">The plan starts tomorrow, {fmtLong(day.d)}. This is that day’s session.</p> : null}
        <Hero day={day}/>
        <Session day={day}/>
      </div>
      <SideFacts day={day}/>
      <DietEmbed day={day}/>
    </div>
  );
}
