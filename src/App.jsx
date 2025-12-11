import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HeadOfficeDashboard from './pages/HeadOfficeDashboard';
import LocalOfficeDashboard from './pages/LocalOfficeDashboard';
import TreasuryDashboard from './pages/TreasuryDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

 return (
  <>
   

    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/head"
        element={
          user
            ? user.role === 'head'
              ? <HeadOfficeDashboard />
              : <Navigate to="/login" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/local"
        element={
          user
            ? user.role === 'local'
              ? <LocalOfficeDashboard />
              : <Navigate to="/login" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/treasury"
        element={
          user
            ? user.role === 'treasury'
              ? <TreasuryDashboard />
              : <Navigate to="/login" />
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/candidate"
        element={
          user
            ? user.role === 'candidate'
              ? <CandidateDashboard />
              : <Navigate to="/login" />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  </>
);

}

export default App;
