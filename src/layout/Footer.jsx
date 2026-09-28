import { NavLink } from 'react-router-dom';
import { useTracker } from '../state/Tracker.jsx';
import { NAV } from './sections.js';

export function Footer(){
  const {prepareSection} = useTracker();
  return (
    <nav className="tabbar" aria-label="Sections">
      {NAV.map(tab=>(
        <NavLink key={tab.id} to={tab.path} end={tab.path==='/'} className={({isActive})=>'tab'+(isActive?' active':'')} onClick={()=>prepareSection(tab.id)}>
          <tab.TabIcon/><span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
