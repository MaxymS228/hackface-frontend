import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Trophy, Users, ArrowRight, Code, Globe, Zap, Shield, Star, ChevronRight, Play, Flag, UserPlus } from 'lucide-react'; //Calendar, MapPin

const Home = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState({ totalHackathons: 0, totalParticipants: 0 });
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Перевірка чи залогінений користувач
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hackRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/api/hackathons?sort=newest`),
          fetch(`${apiUrl}/api/hackathons/stats`)
        ]);
        if (hackRes.ok) {
          const data = await hackRes.json();
          setHackathons(data.slice(0, 3)); // Беремо тільки 3 для головної
        }
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (error) {
        console.error('Помилка завантаження:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < new Date(start)) return 'Upcoming';
    if (now <= new Date(end)) return 'Ongoing';
    return 'Completed';
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const formatDateTime = (date) => new Date(date).toLocaleDateString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">

      {/* Hero */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-sm font-medium mb-8">
            <Rocket size={16} />
            <span>Платформа нового покоління</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
            Організовуй та перемагай у <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              найкращих хакатонах
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Шукай команду, подавай інноваційні проєкти, змагайся за призові фонди та отримуй визнання від провідних IT-компаній.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              // Якщо залогінений
              <>
                <button
                  onClick={() => navigate('/hackathons')}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  Знайти хакатон <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2"
                >
                  Мій дашборд
                </button>
              </>
            ) : (
              // Якщо НЕ залогінений
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  Розпочати зараз <ArrowRight size={20} />
                </Link>
                <Link
                  to="/hackathons"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2"
                >
                  <Code size={20} /> Знайти хакатон
                </Link>
              </>
            )}
          </div>

          {/* Статистика */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.totalHackathons}+</div>
              <div className="text-slate-500 text-sm mt-1">Хакатонів</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.totalParticipants > 1000
                  ? `${(stats.totalParticipants / 1000).toFixed(1)}k`
                  : stats.totalParticipants}+
              </div>
              <div className="text-slate-500 text-sm mt-1">Учасників</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-slate-500 text-sm mt-1">Безкоштовно</div>
            </div>
          </div>
        </div>
      </main>

      {/* Як це працює */}
      <section className="py-20 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Як це працює</h2>
            <p className="text-slate-400">Три простих кроки до першої перемоги</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <UserPlus size={28} className="text-indigo-400" />, step: '01', title: 'Зареєструйся', desc: 'Створи акаунт за хвилину — безкоштовно та без зайвих кроків.' },
              { icon: <Code size={28} className="text-emerald-400" />, step: '02', title: 'Обери хакатон', desc: 'Переглядай актуальні події, фільтруй за темою, форматом або датою.' },
              { icon: <Trophy size={28} className="text-amber-400" />, step: '03', title: 'Змагайся та вигравай', desc: 'Подавай проєкт, отримуй фідбек від журі та борись за призи.' },
            ].map((item) => (
              <div key={item.step} className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-8 group hover:border-indigo-500/30 transition-all">
                <div className="absolute top-6 right-6 text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors select-none">
                  {item.step}
                </div>
                <div className="p-3 bg-slate-800 rounded-xl inline-flex mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Переваги */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Чому Hackathon Face?</h2>
            <p className="text-slate-400">Все що потрібно для організації та участі в хакатоні</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={22} className="text-indigo-400" />, title: 'Швидкий старт', desc: 'Від реєстрації до участі — менше 5 хвилин.' },
              { icon: <Shield size={22} className="text-emerald-400" />, title: 'Безпечно', desc: 'Дані захищені, авторизація через JWT токени.' },
              { icon: <Users size={22} className="text-blue-400" />, title: 'Команди', desc: 'Запрошуй менторів, журі та співорганізаторів.' },
              { icon: <Star size={22} className="text-amber-400" />, title: 'Аналітика', desc: 'Детальна статистика реєстрацій і учасників.' },
              { icon: <Globe size={22} className="text-purple-400" />, title: 'Онлайн і офлайн', desc: 'Підтримка будь-якого формату проведення.' },
              { icon: <Rocket size={22} className="text-rose-400" />, title: 'Для організаторів', desc: 'Повний інструментарій для керування хакатоном.' },
            ].map((item) => (
              <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
                <div className="p-2.5 bg-slate-800 rounded-lg inline-flex mb-4">{item.icon}</div>
                <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Актуальні хакатони */}
      <section className="py-20 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Актуальні хакатони</h2>
              <p className="text-slate-400">Приєднуйся до подій, які змінять твоє майбутнє</p>
            </div>
            <Link to="/hackathons" className="hidden md:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Всі хакатони <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
          ) : hackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((hackathon) => {
                const status = getStatus(hackathon.startDate, hackathon.endDate);
                return (
                  <div
                    key={hackathon._id}
                    onClick={() => navigate(`/hackathons/${hackathon._id}`)}
                    className="bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-indigo-950/40 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group flex flex-col cursor-pointer"
                  >
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
                      <h3 title={hackathon.title} className="text-base font-bold text-white mb-4 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {hackathon.title}
                      </h3>

                      <div className="space-y-2 text-xs text-slate-400 mb-4">
                        {hackathon.registrationDeadline && status !== 'Completed' && (
                          <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
                            <span className="flex items-center gap-1.5 text-slate-500"><UserPlus size={12} /> Реєстрація до</span>
                            <span className={`font-medium ${new Date(hackathon.registrationDeadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'text-rose-400' : 'text-slate-300'}`}>
                              {formatDateTime(hackathon.registrationDeadline)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
                          <span className="flex items-center gap-1.5 text-slate-500"><Play size={12} /> Початок</span>
                          <span className="font-medium text-slate-300">{formatDate(hackathon.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700/50">
                          <span className="flex items-center gap-1.5 text-slate-500"><Flag size={12} /> Кінець</span>
                          <span className="font-medium text-slate-300">{formatDate(hackathon.endDate)}</span>
                        </div>
                      </div>

                      {hackathon.themes?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {hackathon.themes.slice(0, 3).map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-400 border border-slate-700/50">{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between mt-auto">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users size={12} /> {hackathon.participantsCount || 0} учасників
                        </span>
                        <span className="text-xs font-medium text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                          Детальніше <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">Хакатонів поки що немає</div>
          )}

          <Link to="/hackathons" className="md:hidden mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium">
            Всі хакатони <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* CTA банер */}
      {!isLoggedIn && (
        <section className="py-20 border-t border-slate-800/60">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Готовий до змагань?</h2>
                <p className="text-slate-400 mb-8 text-lg">Зареєструйся безкоштовно і знайди свій перший хакатон вже сьогодні.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    Створити акаунт <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    Увійти
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;