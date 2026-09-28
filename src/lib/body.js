import { fmt, num } from './dates.js';

export function bodyRows(body){
  return [...body].filter(e=>num(e.weight)!=null).sort((a,b)=>a.date<b.date?-1:1);
}
export function bodyOn(body, date){
  return body.find(e=>e.date===date)||null;
}
export function bodyBefore(body, date){
  const rows=bodyRows(body).filter(e=>e.date<date);
  return rows.length?rows[rows.length-1]:null;
}
export function fluctuationText(weight, previous){
  if(!previous) return '';
  const d=Math.round((weight-previous.weight)*10)/10;
  const when=fmt(new Date(previous.date+'T00:00:00'));
  if(d===0) return 'Same as '+when;
  return (d>0?'+':'')+d+' kg from '+when;
}
export function weighNote(body, date){
  const cur=bodyOn(body, date);
  const prev=bodyBefore(body, date);
  if(cur && num(cur.weight)!=null) return fluctuationText(cur.weight, prev)||'Saved for this day.';
  if(prev) return `Last weigh-in ${prev.weight} kg · ${fmt(new Date(prev.date+'T00:00:00'))}`;
  return 'Type today’s weight. Progress draws the line from these numbers.';
}
export function weightChange(entries){
  const first=entries[0], last=entries[entries.length-1];
  if(first && last && entries.length>1){
    const step=Math.round((last.weight-entries[entries.length-2].weight)*10)/10;
    const overall=Math.round((last.weight-first.weight)*10)/10;
    const stepText=step===0?'same as the weigh-in before':(step>0?`up ${step} kg`:`down ${Math.abs(step)} kg`)+' from the weigh-in before';
    const overallText=overall===0?'Level with the first weigh-in.':(overall>0?`Up ${overall} kg`:`Down ${Math.abs(overall)} kg`)+' from the first weigh-in.';
    return `Latest is ${last.weight} kg, ${stepText}. ${overallText}`;
  }
  if(first) return `Latest weigh-in is ${first.weight} kg. Log one more day to see the line.`;
  return 'Log today’s weight on the workout day. The line appears after the second weigh-in.';
}
export function chartModel(entries){
  if(!entries.length) return null;
  const w=640,h=220,l=78,r=16,t=22,b=36;
  const vals=entries.map(e=>e.weight);
  const min=Math.min(...vals), max=Math.max(...vals);
  const span=(max-min)||1;
  const innerW=w-l-r, innerH=h-t-b;
  const pts=entries.map((e,i)=>{
    const x=entries.length===1 ? l+innerW/2 : l+i*innerW/(entries.length-1);
    const y=min===max ? t+innerH/2 : t+innerH-((e.weight-min)/span)*innerH;
    return {x, y, e};
  });
  const line=pts.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
  const base=t+innerH;
  const area=`${pts[0].x.toFixed(1)},${base.toFixed(1)} ${line} ${pts[pts.length-1].x.toFixed(1)},${base.toFixed(1)}`;
  return {w, h, l, r, t, base, min, max, pts, line, area, first:entries[0], last:entries[entries.length-1]};
}
export function upsertBody(body, date, weight, waist){
  const existing=bodyOn(body, date);
  let next=body.filter(e=>e.date!==date);
  if(weight!=null) next=[...next, {date, weight, waist:waist===undefined?(existing?existing.waist:null):waist}];
  next.sort((a,b)=>a.date<b.date?-1:1);
  return next;
}
