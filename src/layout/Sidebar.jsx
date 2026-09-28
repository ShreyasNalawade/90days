import { NavLink } from 'react-router-dom';
import { START, WORKOUTS } from '../data/plans.js';
import { fmt } from '../lib/dates.js';
import { END, isToday } from '../lib/plan.js';
import { upcomingSession, useTracker } from '../state/Tracker.jsx';
import { NAV } from './sections.js';

export function Sidebar(){
  const {log, gotoDay, prepareSection} = useTracker();
  const upcoming = upcomingSession(log.days);
  const range = START.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' – '+END.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">90</div>
        <div>
          <strong>Recomp tracker</strong>
          <small id="brand-range">{range}</small>
        </div>
      </div>
      <nav className="nav" aria-label="Sections">
        {NAV.map(tab=>(
          <NavLink key={tab.id} to={tab.path} end={tab.path==='/'} className={({isActive})=>'nav-btn'+(isActive?' active':'')} onClick={()=>prepareSection(tab.id)}>
            <tab.Icon/><span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="card side-card next-card" type="button" id="side-next" onClick={()=>upcoming && gotoDay(upcoming.key)}>
        {upcoming && upcoming.type!=='rest' ? (
          <>
            <span className="muted">{isToday(upcoming)?'Today’s session':'Next gym session'}</span>
            <strong>{fmt(upcoming.d)} · {WORKOUTS[upcoming.type].title}</strong>
            <span className="muted">{WORKOUTS[upcoming.type].focus}</span>
          </>
        ) : null}
      </button>
    </aside>
  );
}
