import { useEffect, useRef } from 'react';
import { useTracker } from '../state/Tracker.jsx';

export function ImportFile(){
  const {importData} = useTracker();
  const fileRef = useRef(null);
  useEffect(()=>{
    window.__recompImport = ()=>fileRef.current?.click();
    return ()=>{ delete window.__recompImport; };
  }, []);
  return (
    <input ref={fileRef} type="file" accept="application/json" hidden onChange={e=>{
      const file=e.target.files && e.target.files[0];
      e.target.value='';
      if(file) importData(file);
    }} id="import-file"/>
  );
}

export function openImport(){ window.__recompImport?.(); }
