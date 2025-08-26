import { StrictMode } from 'react'
import './hunt.css'
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/location">Location clue</Link>
      <Link to="/lock-box">LockBox clue</Link>
      <Link to="/activity">Activity</Link>
    </div>
  );
}

function Location() {
  return (
    <div>
      <h1>Location</h1>
      <Link to="/">Back Home</Link>
    </div>
  );
}

function LockBox() {
  return (
    <div>
      <h1>LockBox</h1>
      <Link to="/">Back Home</Link>
    </div>
  );
}

function Activity() {
  return (
    <div>
      <h1>Activity</h1>
      <Link to="/">Back Home</Link>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/location" element={<Location />} />
        <Route path="/lock-box" element={<LockBox />} />
        <Route path="/activity" element={<Activity />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);