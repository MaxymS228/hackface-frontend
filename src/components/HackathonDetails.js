import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Users, Clock, Tag, ChevronLeft, ExternalLink, Loader2, PlayCircle, LogOut, AlertTriangle, LayoutDashboard } from 'lucide-react';

const HackathonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamTab, setTeamTab] = useState('Organizer'); 
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchHackathon = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/hackathons/${id}`);
      if (!response.ok) throw new Error('Хакатон не знайдено');
      const data = await response.json();
      setHackathon(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, apiUrl]);

  useEffect(() => {
    fetchHackathon();
  }, [fetchHackathon]);

  useEffect(() => {
    // Якщо даних про хакатон ще немає, нічого не робимо
    if (!hackathon?.registrationDeadline) return;

    // Функція перевірки часу
    const checkStatus = () => {
      const now = new Date();
      const deadline = new Date(hackathon.registrationDeadline);
      setIsRegistrationOpen(now < deadline);
    };

    // Перевіряємо одразу під час рендеру
    checkStatus();

    // Запускаємо перевірку кожну секунду (1000 мілісекунд)
    const intervalId = setInterval(checkStatus, 1000);

    // Обов'язково очищаємо таймер, коли користувач йде зі сторінки
    return () => clearInterval(intervalId);
  }, [hackathon?.registrationDeadline]);

  const handleJoin = async () => {
    if (!user) {
      // Якщо юзер не авторизований, кидаємо на логін
      navigate('/login');
      return;
    }

    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не вдалося приєднатися');
      }

      // Оновлюємо дані хакатону після успішного приєднання
      await fetchHackathon();
    } catch (err) {
      alert(`Помилка: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/${id}/leave`, {
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не вдалося покинути хакатон');
      }

      // Закриваємо модалку і оновлюємо дані
      setIsLeaveModalOpen(false);
      await fetchHackathon();
    } catch (err) {
      alert(`Помилка: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400">Завантаження даних хакатону...</p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ой! Щось пішло не так 😕</h2>
        <p className="text-slate-400 mb-8">{error || 'Хакатон не знайдено'}</p>
        <button onClick={() => navigate('/hackathons')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all">
          Повернутися до списку
        </button>
      </div>
    );
  }

  // Перевірка прав і статусів
  const currentUserId = user?._id || user?.id;
  const isOrganizer = user && (hackathon.organizerId === currentUserId);
  
  // Перевіряємо, чи є поточний користувач учасником
  const isParticipant = user && (hackathon.members || []).some(
    member => member.role === 'Participant' && 
    (member.user?._id === currentUserId || member.user === currentUserId)
  );

  //const isRegistrationOpen = new Date() <= new Date(hackathon.registrationDeadline);

  const formatDateWithTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }); // , timeZone: 'UTC'
    const formattedTime = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }); // , timeZone: 'UTC'
    return `${formattedDate}, ${formattedTime}`;
  };
  
  const getDynamicStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Ongoing';
    return 'Completed';
  };

  const statusLabels = { 'Upcoming': 'Скоро', 'Ongoing': 'Активний', 'Completed': 'Завершено' };
  const formatLabels = { 'Online': 'Онлайн', 'Offline': 'Офлайн', 'Hybrid': 'Гібрид' };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20">
      
      {/* Верхня панель */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
          <ChevronLeft size={20} /> На Дашборд
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Банер */}
        <div className="w-full h-64 sm:h-80 md:h-[400px] rounded-[2rem] overflow-hidden mb-8 relative border border-slate-800 bg-slate-900 group">
          {hackathon.banner ? (
            <img src={hackathon.banner} alt="Hackathon Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
              <PlayCircle size={64} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-900/60 text-white text-sm font-bold rounded-full border border-indigo-700 backdrop-blur-md">
                {statusLabels[getDynamicStatus(hackathon.startDate, hackathon.endDate)]}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-100 text-sm font-medium rounded-full border border-slate-700 backdrop-blur-md">
                {formatLabels[hackathon.format]}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              {hackathon.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Ліва колонка */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6">Про хакатон</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {hackathon.description}
              </p>
            </div>

            {hackathon.themes && hackathon.themes.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Tag className="text-indigo-400" size={24}/> Тематика
                </h2>
                <div className="flex flex-wrap gap-2">
                  {hackathon.themes.map((theme, idx) => (
                    <span key={idx} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium border border-slate-700">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users size={24} className="text-indigo-400" />
                Команда хакатону
              </h3>

              <div className="flex w-full gap-2 p-1 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-6">
                {[
                  { id: 'Organizer', label: 'Організатори' },
                  { id: 'Jury', label: 'Журі' },
                  { id: 'Mentor', label: 'Ментори' }
                ].map((tab) => {
                  const isActive = teamTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTeamTab(tab.id)}
                      className={`flex-1 text-center py-2.5 text-sm font-bold transition-all duration-300 rounded-lg ${
                        isActive 
                          ? '!bg-blue-600 !text-white shadow-md shadow-blue-500/25' 
                          : '!bg-transparent text-slate-400 hover:text-slate-200 hover:!bg-slate-700/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(hackathon.members || [])
                  .filter(member => member.role === teamTab)
                  .map(member => (
                    <div
                      key={member._id}
                      onClick={() => navigate(`/profile/${member.user._id}`)}
                      className="group flex flex-col items-center p-4 bg-slate-900/50 rounded-xl hover:bg-slate-700/50 transition-all cursor-pointer border border-transparent hover:border-slate-600 hover:-translate-y-1 shadow-lg shadow-transparent hover:shadow-black/20"
                    >
                      <img 
                        src={member.user.avatarUrl} 
                        alt={member.user.name} 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 object-cover border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors" 
                      />
                      <p className="text-white font-medium text-center text-sm group-hover:text-indigo-300 transition-colors">
                        {member.user.name}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {member.role === 'Organizer' ? 'Організатор' : member.role === 'Jury' ? 'Журі' : 'Ментор'}
                      </p>
                    </div>
                ))}

                {(hackathon.members || []).filter(member => member.role === teamTab).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <p className="text-slate-500 text-sm">У цій категорії ще немає користувачів.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Права колонка */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-sm sticky top-24">
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Calendar size={24} /></div>
                  <div className="flex flex-col">
                    <p className="text-sm text-slate-500 font-medium mb-2">Дати проведення</p>
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-center">
                        <span className="text-slate-500 text-sm">Початок:</span>
                        <span className="text-white font-semibold">{formatDateWithTime(hackathon.startDate)}</span>
                        <span className="text-slate-500 text-sm">Кінець:</span>
                        <span className="text-white font-semibold">{formatDateWithTime(hackathon.endDate)}</span>
                      </div>
                  </div>
                </div>

                {hackathon.registrationDeadline && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><Clock size={24} /></div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Дедлайн реєстрації</p>
                      <p className="text-white font-semibold">
                        {formatDateWithTime(hackathon.registrationDeadline)}
                      </p>
                    </div>
                  </div>
                )}

                {hackathon.location && hackathon.format !== 'Online' && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><MapPin size={24} /></div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Локація</p>
                      <p className="text-white font-semibold">{hackathon.location}</p>
                    </div>
                  </div>
                )}

                {hackathon.prizes && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Trophy size={24} /></div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Призовий фонд</p>
                      <p className="text-white font-semibold">{hackathon.prizes}</p>
                    </div>
                  </div>
                )}

                {(() => {
                  const participantsList = (hackathon.members || []).filter(m => m.role === 'Participant');
                  const participantsCount = participantsList.length;

                  return (
                    <div 
                      onClick={() => setIsParticipantsModalOpen(true)}
                      className="flex items-center gap-4 p-2 -ml-2 rounded-xl cursor-pointer hover:bg-slate-800/60 transition-all group"
                    >
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
                        <Users size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium mb-1 group-hover:text-slate-400 transition-colors">
                          Учасників
                        </p>
                        <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                          {participantsCount}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity pr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Кнопки дій */}
              {isOrganizer ? (
                <button 
                  onClick={() => navigate(`/hackathons/${hackathon._id}/manage`)}
                  className="w-full py-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-600 shadow-lg"
                >
                  <LayoutDashboard size={20} /> Панель управління
                </button>
              ) : isParticipant ? (
                <button 
                  onClick={() => setIsLeaveModalOpen(true)}
                  disabled={isActionLoading}
                  className="w-full py-4 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-xl transition-all border border-rose-500/20 disabled:opacity-50"
                >
                  {isActionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />} 
                  Покинути хакатон
                </button>
              ) : isRegistrationOpen ? (
                <button 
                  onClick={handleJoin}
                  disabled={isActionLoading}
                  className="w-full py-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {isActionLoading ? <Loader2 className="animate-spin" size={20} /> : <ExternalLink size={20} />} 
                  Взяти участь
                </button>
              ) : (
                <button 
                  disabled 
                  className="w-full py-4 flex items-center justify-center gap-2 bg-slate-800/50 text-slate-500 font-bold rounded-xl cursor-not-allowed border border-slate-700/50"
                >
                  Реєстрацію закрито
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальне вікно учасників */}
      {isParticipantsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => setIsParticipantsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/50 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
              <h3 className="text-lg font-bold text-white">
                Учасники хакатону ({(hackathon.members || []).filter(m => m.role === 'Participant').length})
              </h3>
              <button 
                onClick={() => setIsParticipantsModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {(hackathon.members || [])
                .filter(m => m.role === 'Participant')
                .map((participant) => (
                <div
                  key={participant._id}
                  onClick={() => {
                    setIsParticipantsModalOpen(false);
                    navigate(`/profile/${participant.user._id}`);
                  }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors group"
                >
                  <img 
                    src={participant.user.avatarUrl} 
                    alt={participant.user.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700 group-hover:border-blue-500/50 transition-colors"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                      {participant.user.name}
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {participant.user.specialization || 'Учасник'}
                    </p>
                  </div>
                  <div className="text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-blue-400 transition-all -translate-x-2 group-hover:translate-x-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              ))}
              {(hackathon.members || []).filter(m => m.role === 'Participant').length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">Поки що немає зареєстрованих учасників.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно: Підтвердження виходу */}
      {isLeaveModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity"
          onClick={() => !isActionLoading && setIsLeaveModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl shadow-rose-900/20 text-center transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Покинути хакатон?
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Ви впевнені, що хочете скасувати свою участь? Ви зможете приєднатися знову, доки реєстрація відкрита.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={isActionLoading}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Скасувати
              </button>
              <button 
                onClick={handleLeave}
                disabled={isActionLoading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                Так, покинути
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HackathonDetails;