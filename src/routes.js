export const SECTIONS = [
  {id:'today', path:'/', label:'Today'},
  {id:'week', path:'/week', label:'Week'},
  {id:'diet', path:'/diet', label:'Diet'},
  {id:'progress', path:'/progress', label:'Progress'}
];

export function pathFor(id){
  if(id==='plan') return '/week';
  return SECTIONS.find(section=>section.id===id)?.path || '/';
}

export function viewFromPath(pathname){
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  return SECTIONS.find(section=>section.path===path)?.id || 'today';
}
