import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import MainLayout from './layouts/MainLayout';
import GameLayout from './layouts/GameLayout';

// Pages
import GamesDashboard from './pages/GamesDashboard';
import Overview from './pages/Overview';
import Releases from './pages/Releases';
import Environments from './pages/Environments';
import Links from './pages/Links';
import AdsConfig from './pages/AdsConfig';
import BuildChecklist from './pages/BuildChecklist';
import StoreListing from './pages/StoreListing';
import ClosedTestReports from './pages/ClosedTestReports';
import FirestoreRules from './pages/FirestoreRules';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Team from './pages/Team';
import QABug from './pages/QABug';
import PrivateRoute from './components/PrivateRoute';

// Simple Settings placeholder component
function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Settings</h1>
      <p className="text-zinc-400 text-sm">Account and application settings coming soon.</p>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" closeButton />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            {/* Main Dashboard - List of Games */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/games" replace />} />
              <Route path="games" element={<GamesDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Specific Game View */}
            <Route path="/games/:slug" element={<GameLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="releases" element={<Releases />} />
              <Route path="environments" element={<Environments />} />
              <Route path="links" element={<Links />} />
              <Route path="ads" element={<AdsConfig />} />
              <Route path="checklist" element={<BuildChecklist />} />
              <Route path="store" element={<StoreListing />} />
              <Route path="closed-test" element={<ClosedTestReports />} />
              <Route path="firestore-rules" element={<FirestoreRules />} />
              <Route path="qa-bug" element={<QABug />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

