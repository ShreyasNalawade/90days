export function iso(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
export function startOfDay(d){return new Date(d.getFullYear(), d.getMonth(), d.getDate())}
export function addDays(date, n){const d=new Date(date); d.setDate(d.getDate()+n); return d}
export function mondayOf(d){
  const x=startOfDay(d);
  return addDays(x, -((x.getDay()+6)%7));
}
export function fmt(d, withYear){
  return d.toLocaleDateString('en-IN', withYear
    ? {weekday:'short', day:'numeric', month:'short', year:'numeric'}
    : {weekday:'short', day:'numeric', month:'short'});
}
export function fmtLong(d){
  return d.toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long'});
}
export function num(v){
  const n=parseFloat(String(v??'').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
export function phaseName(i){return i<30?'Foundation':i<60?'Progression':'Intensification'}
export function today(){return startOfDay(new Date())}
export function parseIso(key){
  const parts=key.split('-').map(Number);
  return new Date(parts[0], parts[1]-1, parts[2]);
}
