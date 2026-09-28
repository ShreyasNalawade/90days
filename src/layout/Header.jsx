import { gymCount, position } from '../lib/plan.js';
import { gymStreak, loggedCount, sessionsDone } from '../lib/progress.js';
import { useTracker } from '../state/Tracker.jsx';
import { IconBack } from '../components/Icons.jsx';
import { NAV } from './sections.js';

export function Header(){
  const {log, view, showBack, goBack} = useTracker();
  const pos = position();
  const logged = loggedCount(log.days);
  const sessions = sessionsDone(log.days);
  const streak = gymStreak(log.days);
  const pct = Math.round(logged/90*100);
  const eyebrow = pos.mode==='before'
    ? (pos.days===1?'Starts tomorrow':'Starts in '+pos.days+' days')
    : pos.mode==='after'
      ? '90 days complete'
      : 'Day '+(pos.day.i+1)+' of 90 · '+pos.day.phase;
  const title = NAV.find(tab=>tab.id===view)?.label || 'Today';
  return (
    <header className="topbar">
      <button className="back-btn" type="button" hidden={!showBack} aria-label="Back" onClick={goBack}>
        <IconBack/><span>Back</span>
      </button>
      <div className="top-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="mini" aria-hidden="true"><span className="mini-fill" style={{width:pct+'%'}}></span></div>
      </div>
      <div className="top-meta">{sessions}/{gymCount} gym{streak? ' · '+streak+' streak':''}</div>
    </header>
  );
}
