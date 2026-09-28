import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Diet } from './components/Diet.jsx';
import { Progress } from './components/Progress.jsx';
import { Today } from './components/Today.jsx';
import { Week } from './components/Week.jsx';
import { AppLayout } from './layout/AppLayout.jsx';
import { TrackerProvider } from './state/Tracker.jsx';

export default function App(){
  return (
    <BrowserRouter>
      <TrackerProvider>
        <Routes>
          <Route element={<AppLayout/>}>
            <Route index element={<Today/>}/>
            <Route path="week" element={<Week/>}/>
            <Route path="diet" element={<Diet/>}/>
            <Route path="progress" element={<Progress/>}/>
            <Route path="*" element={<Navigate to="/" replace/>}/>
          </Route>
        </Routes>
      </TrackerProvider>
    </BrowserRouter>
  );
}
