import React, { useEffect, useState } from 'react';
import { 
  Layout, Users, Code, Award, Settings, LogOut, Terminal,
  Menu, X, Loader2, ExternalLink, Search, Trophy, Plus, Calendar, ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({ roles: [], teams: [], projects: [], hackathons: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    
    setUser(storedUser);

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });

        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error('Помилка завантаження:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, apiUrl]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const getDynamicStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Ongoing';
    return 'Completed';
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex overflow-hidden">
      
      {/* Бокова панель */}
      <aside className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:relative h-screen w-72 border-r border-slate-800/60 bg-[#0B1120] z-50 flex flex-col transition-transform duration-300
      `}>
        {/* Кнопка закриття для мобілки */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-5 right-5 text-slate-400"><X size={24}/></button>

        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Terminal size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Hack<span className="text-indigo-400">Face</span>
            </span>
          </Link>
          
          <nav className="space-y-2">
            <button 
              onClick={() => navigate('/')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Layout size={20} /> Головна
            </button>
            <button 
              onClick={() => navigate('/teams')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all"
            >
              <Users size={20} /> Команди
            </button>
            <button 
              onClick={() => navigate('/projects')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all"
            >
              <Code size={20} /> Мої Проєкти
            </button>
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-2 border-t border-slate-800/50">
          <button onClick={() => navigate(`/settings`)} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl transition-all"><Settings size={20} /> Налаштування профілю</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"><LogOut size={20} /> Вийти</button>
        </div>
      </aside>

      {/* Головний контент */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        {/* Мобільний хедер */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#0B1120] border-b border-slate-800">
             <span className="text-xl font-bold text-white">Hack<span className="text-indigo-400">Face</span></span>
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-800 rounded-lg"><Menu size={24}/></button>
        </div>

        <div className="p-6 md:p-12 max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-slate-400">Синхронізація даних...</p>
            </div>
          ) : (
            <>
              <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Вітаємо, {user.name}! 👋</h1>
                  <p className="text-slate-400">Ось що відбувається у ваших проєктах сьогодні.</p>
                </div>
                
                <div onClick={() => navigate('/profile')} className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md p-3 pr-6 rounded-2xl border border-slate-700/50 cursor-pointer hover:border-indigo-500/50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-black mt-1">
                      {dashboardData.roles && dashboardData.roles.length > 0 ? dashboardData.roles[0].role : 'Participant'}
                    </p>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Картка команди */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Users className="text-indigo-400" size={28} /> Ваша команда
                    </h3>
                  </div>

                  <div className="relative z-10">
                    {dashboardData.teams && dashboardData.teams.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dashboardData.teams.map((t) => (
                          <div key={t._id} className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group cursor-pointer">
                            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{t.teamId?.name}</h4>
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">{t.role}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Users className="text-slate-600" size={40} />
                        </div>
                        <p className="text-slate-400 mb-8 max-w-xs mx-auto">Ви ще не приєдналися до жодної команди. Час знайти однодумців!</p>
                        <button 
                          onClick={() => navigate('/hackathons')}
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 mx-auto shadow-lg shadow-indigo-600/30"
                        >
                          <Search size={18}/> Знайти команду
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Права колонка */}
                <div className="space-y-8">
                  {/* Досягнення */}
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                    <Award className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">Ваші досягнення 🏆</h3>
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-indigo-50 text-sm leading-relaxed relative z-10">
                      Поки що тут порожньо, але ваші перемоги попереду!
                    </div>
                  </div>

                  {/* Проєкти */}
                  <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Code className="text-indigo-400" size={24} /> Останні проєкти
                    </h3>
                    
                    {dashboardData.projects && dashboardData.projects.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.projects.map((p) => (
                          <div key={p._id} className="p-5 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:bg-slate-800/50 transition-all">
                            <h4 className="font-bold text-white mb-1">{p.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mb-3">{p.description}</p>
                            <a href={p.githubLink} className="text-xs text-indigo-400 flex items-center gap-1 hover:underline"><ExternalLink size={12}/> Repo</a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 border border-slate-800 border-dashed rounded-2xl text-center">
                        <p className="text-sm text-slate-600 font-medium">Проєктів поки немає</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Мої хакатони */}
              <div className="mt-8 bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Trophy className="text-indigo-400" size={28} /> Мої хакатони
                  </h3>
                  
                  <button 
                    onClick={() => navigate('/create-hackathon')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <Plus size={18} /> Створити хакатон
                  </button>
                </div>

                {dashboardData.hackathons && dashboardData.hackathons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardData.hackathons.map((hack) => (
                      <div key={hack._id} onClick={() => navigate(`/hackathons/${hack._id}`)} className="group bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1">
                        
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                            hack.userRole === 'Organizer' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            hack.userRole === 'Judge' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            hack.userRole === 'Mentor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          }`}>
                            {hack.userRole === 'Organizer' ? 'Організатор' :
                             hack.userRole === 'Judge' ? 'Журі' :
                             hack.userRole === 'Mentor' ? 'Ментор' : 'Учасник'}
                          </span>
                          
                          <span className="text-xs font-medium text-slate-500 px-2 py-1 bg-slate-800 rounded-lg">
                            {getDynamicStatus(hack.startDate, hack.endDate) === 'Upcoming' ? 'Скоро' : getDynamicStatus(hack.startDate, hack.endDate) === 'Ongoing' ? 'Активний' : 'Завершено'}
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {hack.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                          <Calendar size={14} />
                          <span>{new Date(hack.startDate).toLocaleDateString('uk-UA')}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm font-medium text-indigo-400 group-hover:text-indigo-300">
                          <span>Перейти до хакатону</span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-400 mb-6">Ви ще не берете участь у жодному хакатоні.</p>
                    <button 
                      onClick={() => navigate('/hackathons')}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 mx-auto transition-colors"
                    >
                      Переглянути доступні хакатони <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;