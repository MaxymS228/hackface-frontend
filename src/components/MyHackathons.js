import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Calendar, Loader2, MapPin, Users, Search, Filter, X } from 'lucide-react';

const MyHackathons = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',    // 'Upcoming' | 'Ongoing' | 'Completed'
    format: '',    // 'Online' | 'Offline'
    role: '',      // 'Organizer' | 'Co-organizer' | 'Mentor' | 'Jury' | 'Participant'
  });
  const apiUrl = process.env.REACT_APP_API_URL;

  const getDynamicStatus = (start, end) => {
    const now = new Date();
    if (now < new Date(start)) return 'Upcoming';
    if (now <= new Date(end)) return 'Ongoing';
    return 'Completed';
  };

  useEffect(() => {
    const fetchMyHackathons = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/hackathons/my-hackathons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) setHackathons(await response.json());
      } catch (error) {
        console.error("Помилка завантаження хакатонів", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyHackathons();
  }, [apiUrl]);

  // Скидання всіх фільтрів
  const resetFilters = () => {
    setFilters({ status: '', format: '', role: '' });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

  // Фільтрація
  const filteredHackathons = hackathons.filter(hack => {
    const status = getDynamicStatus(hack.startDate, hack.endDate);

    if (searchQuery && !hack.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.status && status !== filters.status) return false;
    if (filters.format === 'Online' && hack.format !== 'Online') return false;
    if (filters.format === 'Offline' && hack.format === 'Online') return false;
    if (filters.role && hack.userRole !== filters.role) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#020617]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 pt-8">
      <div className="max-w-7xl mx-auto p-6">

        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h3 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-indigo-400" size={32} /> Мої хакатони
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => navigate('/hackathons')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus size={20} /> Приєднатися до хакатону
            </button>
            <button
              onClick={() => navigate('/create-hackathon')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus size={20} /> Створити хакатон
            </button>
          </div>
        </div>

        {/* Пошук і фільтри */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            {/* Пошук */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Пошук за назвою..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Кнопка фільтрів */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Filter size={18} />
              Фільтри
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Панель фільтрів */}
          {showFilters && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Статус */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Статус</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '', label: 'Всі' },
                      { value: 'Upcoming', label: 'Скоро' },
                      { value: 'Ongoing', label: 'Активні' },
                      { value: 'Completed', label: 'Завершені' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilters(f => ({ ...f, status: opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          filters.status === opt.value
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Формат */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Формат</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '', label: 'Всі' },
                      { value: 'Online', label: 'Онлайн' },
                      { value: 'Offline', label: 'Офлайн' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilters(f => ({ ...f, format: opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          filters.format === opt.value
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Роль */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Моя роль</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '', label: 'Всі' },
                      { value: 'Organizer', label: 'Організатор' },
                      { value: 'Co-organizer', label: 'Співорганізатор' },
                      { value: 'Mentor', label: 'Ментор' },
                      { value: 'Jury', label: 'Журі' },
                      { value: 'Participant', label: 'Учасник' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setFilters(f => ({ ...f, role: opt.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          filters.role === opt.value
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Скинути фільтри */}
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <X size={14} /> Скинути всі фільтри
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Лічильник результатів */}
          {(searchQuery || activeFiltersCount > 0) && (
            <p className="text-sm text-slate-500">
              Знайдено: <span className="text-white font-medium">{filteredHackathons.length}</span> з {hackathons.length}
            </p>
          )}
        </div>

        {/* Сітка з картками */}
        {filteredHackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hack) => {
              const status = getDynamicStatus(hack.startDate, hack.endDate);
              return (
                <div
                  key={hack._id}
                  onClick={() => navigate(`/hackathons/${hack._id}`)}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all group flex flex-col cursor-pointer"
                >
                  <div className="h-48 overflow-hidden relative">
                    <div className={`absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold z-10 flex items-center gap-1.5 ${
                      status === 'Ongoing' ? 'text-emerald-400' : status === 'Upcoming' ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {status === 'Ongoing' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                      {status === 'Upcoming' ? 'Скоро' : status === 'Ongoing' ? 'Активний' : 'Завершено'}
                    </div>
                    <div className={`absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg border z-10 text-xs font-bold ${
                      hack.userRole === 'Organizer' || hack.userRole === 'Co-organizer' ? 'border-amber-500/30 text-amber-400' :
                      hack.userRole === 'Jury' ? 'border-purple-500/30 text-purple-400' :
                      hack.userRole === 'Mentor' ? 'border-emerald-500/30 text-emerald-400' :
                      'border-blue-500/30 text-blue-400'
                    }`}>
                      {hack.userRole === 'Organizer' ? 'Організатор' :
                       hack.userRole === 'Co-organizer' ? 'Співорганізатор' :
                       hack.userRole === 'Jury' ? 'Журі' :
                       hack.userRole === 'Mentor' ? 'Ментор' : 'Учасник'}
                    </div>
                    <img
                      src={hack.banner || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"}
                      alt={hack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{hack.title}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar size={16} className="text-indigo-400 shrink-0" />
                        <span>{new Date(hack.startDate).toLocaleDateString('uk-UA')} - {new Date(hack.endDate).toLocaleDateString('uk-UA')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin size={16} className="text-indigo-400 shrink-0" />
                        <span>{hack.format === 'Online' ? 'Онлайн' : (hack.location || 'Локація не вказана')}</span>
                      </div>
                      {hack.prizes && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Trophy size={16} className="text-yellow-500 shrink-0" />
                          <span className="text-slate-300 font-medium">{hack.prizes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                      {(hack.themes || []).slice(0, 3).map((theme, index) => (
                        <span key={index} className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                          {theme}
                        </span>
                      ))}
                    </div>
                    <div className="pt-5 border-t border-slate-800 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Users size={16} />
                        <span>Команда хакатону</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/hackathons/${hack._id}`); }}
                        className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-sm font-bold transition-all"
                      >
                        Детальніше
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-400 mb-4 text-lg">
              {activeFiltersCount > 0 ? 'За вашими фільтрами нічого не знайдено.' : 'Ви ще не берете участь у жодному хакатоні.'}
            </p>
            {activeFiltersCount > 0 ? (
              <button onClick={resetFilters} className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 mx-auto transition-colors">
                <X size={16} /> Скинути фільтри
              </button>
            ) : (
              <button onClick={() => navigate('/hackathons')} className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2 mx-auto transition-colors">
                Знайти хакатон
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHackathons;