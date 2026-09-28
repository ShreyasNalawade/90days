import { useEffect, useLayoutEffect, useRef } from 'react';
import { START, WORKOUTS } from '../data/plans.js';
import { fmt } from '../lib/dates.js';
import { END, gymCount, isToday, position } from '../lib/plan.js';
import { gymStreak, loggedCount, sessionsDone } from '../lib/progress.js';
import { upcomingSession, useTracker } from '../state/Tracker.jsx';
import { IconBack, IconDiet, IconProgress, IconToday, IconTodayTab, IconWeek } from './Icons.jsx';

const TABS = [
  {id:'today', label:'Today', Icon:IconToday, TabIcon:IconTodayTab},
  {id:'week', label:'Week', Icon:IconWeek, TabIcon:IconWeek},
  {id:'diet', label:'Diet', Icon:IconDiet, TabIcon:IconDiet},
  {id:'progress', label:'Progress', Icon:IconProgress, TabIcon:IconProgress}
];

export function Shell({children}){
  const app = useTracker();
  const fileRef = useRef(null);
  const days = app.log.days;
  const pos = position();
  const logged = loggedCount(days);
  const sessions = sessionsDone(days);
  const streak = gymStreak(days);
  const pct = Math.round(logged/90*100);
  const upcoming = upcomingSession(days);
  const range = START.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' – '+END.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  const eyebrow = pos.mode==='before'
    ? (pos.days===1?'Starts tomorrow':'Starts in '+pos.days+' days')
    : pos.mode==='after'
      ? '90 days complete'
      : 'Day '+(pos.day.i+1)+' of 90 · '+pos.day.phase;

  useLayoutEffect(()=>{
    const bar=document.querySelector('.topbar');
    if(bar) document.documentElement.style.setProperty('--top-h', bar.offsetHeight+'px');
  });
  useEffect(()=>{
    function onKey(e){
      if(app.view!=='week' && app.view!=='diet') return;
      if(e.target.matches('input, textarea')) return;
      if(e.key==='ArrowLeft') app.shiftWeek(-1);
      if(e.key==='ArrowRight') app.shiftWeek(1);
    }
    document.addEventListener('keydown', onKey);
    return ()=>document.removeEventListener('keydown', onKey);
  }, [app]);

  return (
    <>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">90</div>
            <div>
              <strong>Recomp tracker</strong>
              <small id="brand-range">{range}</small>
            </div>
          </div>
          <nav className="nav" aria-label="Sections">
            {TABS.map(tab=>(
              <button key={tab.id} className={'nav-btn'+(app.view===tab.id?' active':'')} type="button" aria-current={app.view===tab.id?'page':undefined} onClick={()=>app.openSection(tab.id)}>
                <tab.Icon/><span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <button className="card side-card next-card" type="button" id="side-next" onClick={()=>upcoming && app.gotoDay(upcoming.key)}>
            {upcoming && upcoming.type!=='rest' ? (
              <>
                <span className="muted">{isToday(upcoming)?'Today’s session':'Next gym session'}</span>
                <strong>{fmt(upcoming.d)} · {WORKOUTS[upcoming.type].title}</strong>
                <span className="muted">{WORKOUTS[upcoming.type].focus}</span>
              </>
            ) : null}
          </button>
        </aside>
        <div className="main">
          <header className="topbar">
            <button className="back-btn" type="button" hidden={!(app.history.length || app.view!=='today')} aria-label="Back" onClick={app.goBack}>
              <IconBack/><span>Back</span>
            </button>
            <div className="top-copy">
              <p className="eyebrow">{eyebrow}</p>
              <h1>{TABS.find(t=>t.id===app.view)?.label || 'Today'}</h1>
              <div className="mini" aria-hidden="true"><span className="mini-fill" style={{width:pct+'%'}}></span></div>
            </div>
            <div className="top-meta">{sessions}/{gymCount} gym{streak? ' · '+streak+' streak':''}</div>
          </header>
          {!app.storageOK ? <p className="warn-banner">This browser is blocking saved data. Progress will disappear when the page closes.</p> : null}
          <div className="view"><div className="view-wrap">{children}</div></div>
        </div>
        <nav className="tabbar" aria-label="Sections">
          {TABS.map(tab=>(
            <button key={tab.id} className={'tab'+(app.view===tab.id?' active':'')} type="button" aria-current={app.view===tab.id?'page':undefined} onClick={()=>app.openSection(tab.id)}>
              <tab.TabIcon/><span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className={'toast'+(app.toast?' show':'')} role="status">{app.toast}</div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={e=>{
        const file=e.target.files&&e.target.files[0];
        e.target.value='';
        if(file) app.importData(file);
      }} id="import-file"/>
      <ImportBridge fileRef={fileRef}/>
    </>
  );
}

function ImportBridge({fileRef}){
  useEffect(()=>{
    window.__recompImport = ()=>fileRef.current?.click();
    return ()=>{ delete window.__recompImport; };
  }, [fileRef]);
  return null;
}

export function openImport(){ window.__recompImport?.(); }
