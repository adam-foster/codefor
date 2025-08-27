import { StrictMode } from 'react'
import './hunt.css'
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Location from './pages/location';
import Location2 from './pages/location2'
import LockBox from './pages/lockBox';
import Activity from './pages/activity';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <main className="mx-auto bg-gray-50 sm:max-w-xl sm:my-10 sm:border sm:rounded-2xl sm:overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/location" element={<Location />} />
          <Route path="/location/2" element={<Location2 />} />
          <Route path="/lock-box" element={<LockBox />} />
          <Route path="/activity" element={<Activity />} />
        </Routes>
      </main>
    </HashRouter>
  </StrictMode>
);