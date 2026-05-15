import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Trophy, Calendar, MapPin, Users, Loader2, Globe, X, ChevronDown, Play, Flag, UserPlus } from 'lucide-react';

const AllHackathons = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filters, setFilters] = useState({ status: '', format: '' });
  const [sort, setSort] = useState('oldest');
  const apiUrl = process.env.REACT_APP_API_URL;
  const [globalStats, setGlobalStats] = useState({ totalHackathons: 0, totalParticipants: 0 });

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < new Date(start)) return 'Upcoming';
    if (now <= new Date(end)) return 'Ongoing';
    return 'Completed';
  };

  // Запит з параметрами на бекенд
  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.format) params.append('format', filters.format);
      if (filters.status) params.append('status', filters.status);
      if (sort) params.append('sort', sort);

      const response = await fetch(`${apiUrl}/api/hackathons?${params.toString()}`);
      if (response.ok) setHackathons(await response.json());
    } catch (error) {
      console.error("Помилка завантаження хакатонів:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, searchQuery, filters, sort]);

  // Debounce для пошуку — не відправляємо запит на кожну букву
  useEffect(() => {
    const timer = setTimeout(() => fetchHackathons(), 400);
    return () => clearTimeout(timer);
  }, [fetchHackathons]);

  useEffect(() => {
    const fetchStats = async () => {
        try {
        const res = await fetch(`${apiUrl}/api/hackathons/stats`);
        if (res.ok) setGlobalStats(await res.json());
        } catch (e) {}
    };
    fetchStats();
    }, [apiUrl]);

  const resetFilters = () => setFilters({ status: '', format: '' });
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Розбиваємо на секції вже на фронті
  const ongoingHackathons = hackathons.filter(h => getStatus(h.startDate, h.endDate) === 'Ongoing');
  const upcomingHackathons = hackathons.filter(h => getStatus(h.startDate, h.endDate) === 'Upcoming');
  const completedHackathons = hackathons.filter(h => getStatus(h.startDate, h.endDate) === 'Completed');
  const offlineHackathons = hackathons.filter(h => h.format !== 'Online' && getStatus(h.startDate, h.endDate) !== 'Completed');
  const featuredHackathon = ongoingHackathons[0] || upcomingHackathons[0];

  const stats = {
    active: hackathons.filter(h => getStatus(h.startDate, h.endDate) === 'Ongoing').length,
    upcoming: hackathons.filter(h => getStatus(h.startDate, h.endDate) === 'Upcoming').length,
    total: hackathons.length,
  };

  const sortLabels = {
    oldest: 'За датою початку',
    newest: 'Найновіші',
    views: 'За популярністю',
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[#020617]">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-24 pt-8">
      <div className="max-w-7xl mx-auto p-6">

        {/* Шапка */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Всі хакатони</h1>
            <p className="text-slate-400">Знайди свій наступний хакатон та приєднуйся до спільноти</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">{stats.active}</div>
              <div className="text-sm text-slate-500">Активних</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{stats.upcoming}</div>
              <div className="text-sm text-slate-500">Скоро</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                  {globalStats.totalParticipants > 1000
                    ? `${(globalStats.totalParticipants / 1000).toFixed(1)}k`
                    : globalStats.totalParticipants}
              </div>
              <div className="text-sm text-slate-500">Учасників</div>
            </div>
          </div>
        </div>

        {/* ПОШУК + ФІЛЬТРИ + СОРТУВАННЯ */}
        <div className="space-y-3 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Пошук за назвою або містом..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Фільтри */}
            <button
              onClick={() => { setShowFilters(!showFilters); setShowSort(false); }}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={18} /> Фільтри
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Сортування */}
            <div className="relative">
              <button
                onClick={() => { setShowSort(!showSort); setShowFilters(false); }}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all font-medium"
              >
                <ArrowUpDown size={18} />
                <span className="hidden sm:inline">{sortLabels[sort]}</span>
                <ChevronDown size={16} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-14 z-50 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl w-52">
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setSort(key); setShowSort(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        sort === key ? 'text-indigo-400 bg-indigo-600/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Панель фільтрів */}
          {showFilters && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Формат</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: '', label: 'Всі' },
                      { value: 'Online', label: 'Онлайн' },
                      { value: 'Offline', label: 'Офлайн' },
                      { value: 'Hybrid', label: 'Гібрид' },
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
              </div>
              {activeFiltersCount > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <button onClick={resetFilters} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors">
                    <X size={14} /> Скинути фільтри
                  </button>
                </div>
              )}
            </div>
          )}

          {hackathons.length > 0 && (searchQuery || activeFiltersCount > 0) && (
            <p className="text-sm text-slate-500">Знайдено: <span className="text-white font-medium">{hackathons.length}</span> хакатонів</p>
          )}
        </div>

        {/* FEATURED */}
        {featuredHackathon && !filters.status && !filters.format && !searchQuery && (
          <div className="mb-14">
            <SectionTitle icon={<Trophy className="text-amber-500" size={18} />} label="Вибір редакції" />
            <div
              onClick={() => navigate(`/hackathons/${featuredHackathon._id}`)}
              className="bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 cursor-pointer hover:border-indigo-500/40 transition-all"
            >
              <div className="w-full md:w-48 h-40 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                {featuredHackathon.banner
                  ? <img src={featuredHackathon.banner} alt="" className="w-full h-full object-cover" />
                  : <Trophy size={48} className="text-indigo-500/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold mb-3">Рекомендовано</span>
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1">{featuredHackathon.title}</h3>
                <p className="text-slate-400 mb-4 line-clamp-2">{featuredHackathon.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(featuredHackathon.startDate).toLocaleDateString('uk-UA')}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {featuredHackathon.format === 'Online' ? 'Онлайн' : featuredHackathon.location}</span>
                  <span className="flex items-center gap-1.5"><Users size={14} /> {featuredHackathon.participantsCount || 0} учасників</span>
                </div>
              </div>
              <button className="shrink-0 px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-colors">
                Детальніше
              </button>
            </div>
          </div>
        )}

        {/* СЕКЦІЇ */}
        <HackathonSection title="Зараз відбуваються" icon={<LiveDot />} hackathons={ongoingHackathons} navigate={navigate} getStatus={getStatus} />
        <HackathonSection title="Скоро починаються" icon={<Calendar className="text-blue-400" size={18} />} hackathons={upcomingHackathons} navigate={navigate} getStatus={getStatus} />
        <HackathonSection title="Офлайн івенти" icon={<MapPin className="text-purple-400" size={18} />} hackathons={offlineHackathons} navigate={navigate} getStatus={getStatus} />
        <HackathonSection title="Завершені" icon={<Globe className="text-slate-500" size={18} />} hackathons={completedHackathons} navigate={navigate} getStatus={getStatus} dimmed />

        {hackathons.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            <Search className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Хакатонів не знайдено</h3>
            <p className="text-slate-400 mb-6">Спробуй змінити параметри пошуку або обрати інший фільтр.</p>
            <button
              onClick={() => { setSearchQuery(''); resetFilters(); }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
            >
              Скинути фільтри
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Допоміжні компоненти
const SectionTitle = ({ icon, label }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase">{label}</h2>
    <div className="h-px bg-slate-800 flex-1" />
  </div>
);

const LiveDot = () => (
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
  </span>
);

const HackathonSection = ({ title, icon, hackathons, navigate, getStatus, dimmed }) => {
  if (hackathons.length === 0) return null;
  return (
    <div className={`mb-14 ${dimmed ? 'opacity-60' : ''}`}>
      <SectionTitle icon={icon} label={title} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map(hack => <HackathonCard key={hack._id} hackathon={hack} status={getStatus(hack.startDate, hack.endDate)} navigate={navigate} />)}
      </div>
    </div>
  );
};

const HackathonCard = ({ hackathon, status, navigate }) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const formatDateTime = (date) => new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div
      onClick={() => navigate(`/hackathons/${hackathon._id}`)}
      className="bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-indigo-950/40 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group flex flex-col cursor-pointer"
    >
      {/* Картинка */}
      <div className="h-44 overflow-hidden relative rounded-t-2xl bg-slate-800/50">
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-700 ${
          status === 'Ongoing' ? 'text-emerald-400' : status === 'Upcoming' ? 'text-blue-400' : 'text-slate-500'
        }`}>
          {status === 'Ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {status === 'Ongoing' ? 'Активний' : status === 'Upcoming' ? 'Скоро' : 'Завершено'}
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-400 z-10">
          {hackathon.format === 'Online' ? 'Онлайн' : hackathon.format === 'Hybrid' ? 'Гібрид' : 'Офлайн'}
        </div>
        {hackathon.banner
          ? <img src={hackathon.banner} alt={hackathon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Globe size={40} className="text-slate-700" /></div>
        }
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Назва */}
        <h3 title={hackathon.title} className="text-base font-bold text-white mb-4 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
          {hackathon.title}
        </h3>

        {/* Дати */}
        <div className="space-y-2 text-xs text-slate-400 mb-4">
          
          {/* Реєстрація — тільки якщо є поле і хакатон ще не завершено */}
          {hackathon.registrationDeadline && status !== 'Completed' && (
            <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
              <span className="flex items-center gap-1.5 text-slate-500">
                <UserPlus size={12} /> Реєстрація до
              </span>
              <span className={`font-medium ${
                new Date(hackathon.registrationDeadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                  ? 'text-rose-400' // червоним якщо менше 3 днів
                  : 'text-slate-300'
              }`}>
                {formatDateTime(hackathon.registrationDeadline)}
              </span>
            </div>
          )}

          {/* Початок */}
          <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Play size={12} /> Початок
            </span>
            <span className="font-medium text-slate-300">{formatDate(hackathon.startDate)}</span>
          </div>

          {/* Кінець */}
          <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Flag size={12} /> Кінець
            </span>
            <span className="font-medium text-slate-300">{formatDate(hackathon.endDate)}</span>
          </div>
        </div>

        {/* Теги */}
        {hackathon.themes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hackathon.themes.slice(0, 3).map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-400 border border-slate-700/50">{t}</span>
            ))}
          </div>
        )}

        {/* Футер */}
        <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={12} /> {hackathon.participantsCount || 0} учасників
          </span>
          <span className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
            Детальніше <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AllHackathons;