import { useEffect } from 'react';

export function GuideModal({open, kicker, title, note, steps, href, linkLabel, onClose}){
  useEffect(()=>{
    if(!open) return undefined;
    function onKey(e){ if(e.key==='Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return ()=>{
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if(!open) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={e=>e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <p className="kicker">{kicker}</p>
            <h2 id="guide-title">{title}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {note ? <p className="muted" style={{margin:'8px 0 0'}}>{note}</p> : null}
        <ol className="recipe-steps">
          {(steps||[]).map(step=><li key={step}>{step}</li>)}
        </ol>
        <a className="btn btn-primary recipe-link" href={href} target="_blank" rel="noreferrer">{linkLabel}</a>
      </div>
    </div>
  );
}
