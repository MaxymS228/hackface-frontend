import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { Settings, ShieldCheck, Users, ChevronLeft, Loader2, BarChart3 } from 'lucide-react';

const HackathonManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathonTitle, setHackathonTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Отримуємо базові дані хакатону (наприклад, тільки назву для хедера)
  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/hackathons/${id}`);
        if (response.ok) {
          const data = await response.json();
          setHackathonTitle(data.title);
        }
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBasicInfo();
  }, [id, apiUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { 
      path: '.', // Точка означає базовий шлях /hackathons/:id/manage
      icon: <BarChart3 size={20} />, 
      label: 'Огляд' 
    },
    { 
      path: 'settings',
      icon: <Settings size={20} />, 
      label: 'Налаштування хакатону' 
    },
    { 
      path: 'team', 
      icon: <ShieldCheck size={20} />, 
      label: 'Команда хакатону' 
    },
    { 
      path: 'participants', 
      icon: <Users size={20} />, 
      label: 'Учасники' 
    },
    { 
      path: 'submissions',
      icon: <Settings size={20} />, 
      label: 'Управління проєктами' 
    },
    { 
      path: 'mailling',
      icon: <Settings size={20} />, 
      label: 'Комунікація' 
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col">
      {/* Верхній міні-хедер для зручності */}
      <div className="border-b border-slate-800 bg-slate-900/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(`/hackathons/${id}`)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Управління хакатоном</p>
            <h1 className="text-xl font-bold text-white truncate max-w-xl">
              {hackathonTitle || 'Завантаження...'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-6 p-4 py-8">
        
        {/* Бокове меню (Sidebar) */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '.'} // end потрібен, щоб базовий шлях не підсвічувався завжди
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }
              `}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Динамічна область контенту */}
        <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm min-h-[500px]">
          {/* Outlet - це місце, куди React Router буде підставляти потрібний компонент (Налаштування, Команду або Учасників) */}
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default HackathonManage;