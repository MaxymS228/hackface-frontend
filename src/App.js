import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Submit from './pages/Submit';
import Evaluation from './pages/Evaluation';
import Results from './pages/Results';
import Admin from './pages/Admin';
import VerifyEmail from './components/VerifyEmail';
import PublicProfile from './pages/PublicProfile';
import ProfileSettings from './pages/ProfileSettings';



const ConditionalNavbar = ({ user, setUser }) => {
    const location = useLocation();
    // Перевіряємо, чи починається поточний шлях з /dashboard
    const isDashboard = location.pathname.startsWith('/dashboard');
    
    // Якщо це дашборд - нічого не малюємо (null), інакше - малюємо Navbar
    return !isDashboard ? <Navbar user={user} setUser={setUser} /> : null;
};

function App() {
  //const [user, setUser] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Перевірка авторизації при завантаженні сайту
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-200">
        
        {/* Navbar залишається на горі */}
        <ConditionalNavbar user={user} setUser={setUser} />
        
        {/* Контейнер для сторінок. */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/submit" element={
              <ProtectedRoute>
                <Submit />
              </ProtectedRoute>
            } />
            <Route path="/evaluation" element={
              <ProtectedRoute>
                <Evaluation />
              </ProtectedRoute>
            } />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <PublicProfile currentUser={user} />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <ProfileSettings user={user} setUser={setUser} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;