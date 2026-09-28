import { useEffect, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTracker } from '../state/Tracker.jsx';
import { Footer } from './Footer.jsx';
import { Header } from './Header.jsx';
import { ImportFile } from './ImportFile.jsx';
import { Sidebar } from './Sidebar.jsx';

export function AppLayout(){
  const app = useTracker();
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
        <Sidebar/>
        <div className="main">
          <Header/>
          {!app.storageOK ? <p className="warn-banner">This browser is blocking saved data. Progress will disappear when the page closes.</p> : null}
          <div className="view"><div className="view-wrap"><Outlet/></div></div>
        </div>
        <Footer/>
      </div>
      <div className={'toast'+(app.toast?' show':'')} role="status">{app.toast}</div>
      <ImportFile/>
    </>
  );
}
