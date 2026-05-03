import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, LayoutDashboard, LogOut, LogIn, UserPlus, User, ChevronDown, UserCircle, Users, Trophy } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Синхронізація юзера
  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      if (JSON.stringify(user) !== storedUserStr) {
        setUser(JSON.parse(storedUserStr));
      }
    } else {
      if (user !== null) {
        setUser(null);
      }
    }
  }, [location, user, setUser]);

  // Закриття меню при кліку поза його межами
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null); 
    setIsDropdownOpen(false);
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => `text-sm font-medium transition-colors ${isActive(path) ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`;

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Ліва частина: Логотип */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/20">
                <Terminal size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
                Hack<span className="text-indigo-400">Face</span>
              </span>
            </Link>
          </div>

          {/* Центральна частина: Меню навігації */}
          <div className="hidden md:flex items-center justify-center gap-8 flex-1">
            <Link to="/" className={navLinkStyle('/')}>Головна</Link>
            <Link to="/hackathons" className={navLinkStyle('/hackathons')}>Усі Хакатони</Link>
            <Link to="/teams" className={navLinkStyle('/teams')}>Команди</Link>
          </div>

          {/* Права частина: Авторизація */}
          <div className="flex-1 flex justify-end items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <LayoutDashboard size={18} className="text-indigo-400" />
                  Dashboard
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
                  >
                    <User size={16} className="text-indigo-400" />
                    <span className="font-medium hidden sm:block">{user.name}</span>
                    <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 flex flex-col">
                      <div className="px-4 py-3 border-b border-slate-700 mb-1">
                        <p className="text-xs text-slate-400 mb-0.5">Увійшли як</p>
                        <p className="text-sm font-bold text-white truncate">{user.email || 'Користувач'}</p>
                      </div>

                      <Link 
                        to={`/profile/${user.id}`} 
                        onClick={() => setIsDropdownOpen(false)} // Закриваємо меню при кліку
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-indigo-400 transition-colors"
                      >
                        <UserCircle size={16} /> Мій профіль
                      </Link>
                      
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-indigo-400 transition-colors"
                      >
                        <Trophy size={16} /> Мої хакатони
                      </Link>

                      <Link 
                        to="/teams" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-indigo-400 transition-colors"
                      >
                        <Users size={16} /> Мої команди
                      </Link>

                      <div className="h-px bg-slate-700 my-1"></div>

                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left font-medium"
                      >
                        <LogOut size={16} /> Вийти з акаунту
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  <LogIn size={18} /> Увійти
                </Link>
                <Link to="/register" className="flex items-center gap-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                  <UserPlus size={18} /> Реєстрація
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;