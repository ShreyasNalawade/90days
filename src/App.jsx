import { Diet } from './components/Diet.jsx';
import { Progress } from './components/Progress.jsx';
import { Shell } from './components/Shell.jsx';
import { Today } from './components/Today.jsx';
import { Week } from './components/Week.jsx';
import { TrackerProvider, useTracker } from './state/Tracker.jsx';

function Screen(){
  const {view} = useTracker();
  if(view==='week') return <Week/>;
  if(view==='diet') return <Diet/>;
  if(view==='progress') return <Progress/>;
  return <Today/>;
}

export default function App(){
  return (
    <TrackerProvider>
      <Shell>
        <Screen/>
      </Shell>
    </TrackerProvider>
  );
}
