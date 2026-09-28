import { IconDiet, IconProgress, IconToday, IconTodayTab, IconWeek } from '../components/Icons.jsx';
import { SECTIONS } from '../routes.js';

const ICONS = {
  today:[IconToday, IconTodayTab],
  week:[IconWeek, IconWeek],
  diet:[IconDiet, IconDiet],
  progress:[IconProgress, IconProgress]
};

export const NAV = SECTIONS.map(section=>{
  const [Icon, TabIcon] = ICONS[section.id];
  return {...section, Icon, TabIcon};
});
