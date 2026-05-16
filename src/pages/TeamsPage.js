import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Loader2, Trophy, Lock, UserCheck, Shield, ArrowRight, Info } from 'lucide-react';

const TeamsPage = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [hackathon, setHackathon] = useState(null);
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState(null);

  // Отримуємо ID з токена
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded._id;
    } catch { return null; }
  };
  const currentUserId = getCurrentUserId();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [hackRes, teamsRes] = await Promise.all([
        fetch(`${apiUrl}/api/hackathons/${hackathonId}`, { headers }),
        fetch(`${apiUrl}/api/teams/hackathon/${hackathonId}`, { headers }),
      ]);

      //if (hackRes.ok) setHackathon(await hackRes.json());
      const hackathonData = hackRes.ok ? await hackRes.json() : null;
      if (hackathonData) {
        setHackathon(hackathonData);
        // Шукаємо учасника з вже збережених даних
        const member = hackathonData.members?.find(
            m => m.user?._id === currentUserId && m.role === 'Participant' && m.status === 'Accepted'
        );
        setMemberInfo(member || null);
      }
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);

        // Знаходимо команду поточного юзера
        const myT = teamsData.find(team =>
          team.members?.some(m => m.user?._id === currentUserId)
        );
        setMyTeam(myT || null);
      }
    } catch (err) {
      console.error('Помилка завантаження:', err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, apiUrl, currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < new Date(start)) return 'Upcoming';
    if (now <= new Date(end)) return 'Ongoing';
    return 'Completed';
  };

  const hackathonStatus = hackathon ? getStatus(hackathon.startDate, hackathon.endDate) : null;
  const isParticipant = !!memberInfo;
  const isCaptain = myTeam?.captainId === currentUserId || myTeam?.captainId?._id === currentUserId;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Хедер */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/hackathons/${hackathonId}`)}
            className="text-slate-300 hover:text-slate-300 text-base flex items-center gap-1 mb-4 transition-colors"
          >
            ← Назад до хакатону
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="text-indigo-400" size={32} /> Команди
              </h1>
              <p className="text-slate-400 mt-1">{hackathon?.title}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
              <Users size={16} className="text-indigo-400" />
              <span>Розмір команди: <span className="text-white font-medium">{hackathon?.minTeamSize}–{hackathon?.maxTeamSize} осіб</span></span>
            </div>
          </div>
        </div>

        {/* Якщо юзер НЕ є учасником хакатону */}
        {!isParticipant && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <Info className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-300 font-semibold mb-1">Ви не є учасником цього хакатону</p>
              <p className="text-amber-400/70 text-sm">Щоб приєднатися до команди або створити власну — спочатку зареєструйтесь як учасник хакатону.</p>
              <button
                onClick={() => navigate(`/hackathons/${hackathonId}`)}
                className="mt-3 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-sm font-medium transition-colors"
              >
                Перейти до реєстрації
              </button>
            </div>
          </div>
        )}

        {/* Якщо юзер вже в команді */}
        {myTeam && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Shield className="text-indigo-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">
                    {isCaptain ? 'Ви капітан команди' : 'Ви учасник команди'}
                  </p>
                  <h3 className="text-xl font-bold text-white">{myTeam.name}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{myTeam.members?.length || 0} / {hackathon?.maxTeamSize} учасників</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/hackathons/${hackathonId}/teams/${myTeam._id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
              >
                Кабінет команди <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Дії — тільки якщо учасник і ще не в команді */}
        {isParticipant && !myTeam && hackathonStatus !== 'Completed' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {/* Створити команду */}
            <button
              onClick={() => navigate(`/hackathons/${hackathonId}/teams/create`)}
              className="group bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 hover:border-indigo-500/50 rounded-2xl p-6 text-left transition-all"
            >
              <div className="p-3 bg-indigo-500/20 rounded-xl inline-flex mb-4 group-hover:bg-indigo-500/30 transition-colors">
                <Plus className="text-indigo-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Створити команду</h3>
              <p className="text-slate-400 text-sm">Стань капітаном, задай назву та опис проєкту, запрошуй людей.</p>
              <div className="flex items-center gap-2 mt-4 text-indigo-400 text-sm font-medium">
                Розпочати <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Знайти команду */}
            <button
              onClick={() => navigate(`/hackathons/${hackathonId}/teams/find`)}
              className="group bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all"
            >
              <div className="p-3 bg-emerald-500/20 rounded-xl inline-flex mb-4 group-hover:bg-emerald-500/30 transition-colors">
                <Search className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Знайти команду</h3>
              <p className="text-slate-400 text-sm">Переглядай команди які шукають учасників і подай заявку.</p>
              <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-medium">
                Переглянути <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Соло — якщо дозволено */}
            {hackathon?.allowSolo && (
              <div className="sm:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-800 rounded-xl">
                    <UserCheck className="text-slate-400" size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Йти соло</p>
                    <p className="text-slate-500 text-xs mt-0.5">Брати участь самостійно без команди</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                  Дозволено організатором
                </span>
              </div>
            )}
          </div>
        )}

        {/* Список всіх команд */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-amber-400" size={18} />
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Всі команди ({teams.length})
            </h2>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map((team) => {
                const isMyTeam = team._id === myTeam?._id;
                const isFull = team.members?.length >= hackathon?.maxTeamSize;
                const isLocked = team.lockedAt && new Date() >= new Date(team.lockedAt);

                return (
                  <div
                    key={team._id}
                    onClick={() => isMyTeam && navigate(`/hackathons/${hackathonId}/teams/${team._id}`)}
                    className={`bg-slate-900 border rounded-2xl p-5 transition-all flex flex-col ${
                      isMyTeam
                        ? 'border-indigo-500/40 cursor-pointer hover:border-indigo-500/70'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Шапка картки */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white truncate">{team.name}</h3>
                          {isMyTeam && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0">Моя</span>
                          )}
                          {team.isAutoGenerated && (
                            <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full shrink-0">Авто</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Капітан: {team.captainId?.name || 'Невідомо'}
                        </p>
                      </div>

                      {/* Статус */}
                      {isLocked ? (
                        <div className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg shrink-0">
                          <Lock size={10} /> Закрита
                        </div>
                      ) : isFull ? (
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg shrink-0">Повна</span>
                      ) : (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg shrink-0">Відкрита</span>
                      )}
                    </div>

                    {/* Опис */}
                    {team.description && (
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{team.description}</p>
                    )}

                    {/* Учасники */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-500">Учасники</span>
                        <span className="text-xs font-medium text-slate-300">
                          {team.members?.length || 0} / {hackathon?.maxTeamSize}
                        </span>
                      </div>

                      {/* Прогрес-бар */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(((team.members?.length || 0) / (hackathon?.maxTeamSize || 1)) * 100, 100)}%` }}
                        />
                      </div>

                      {/* Аватари учасників */}
                      <div className="flex -space-x-2">
                        {(team.members || []).slice(0, 5).map((m, i) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                          >
                            {m.user?.name?.substring(0, 1).toUpperCase() || '?'}
                          </div>
                        ))}
                        {(team.members?.length || 0) > 5 && (
                          <div className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">
                            +{team.members.length - 5}
                          </div>
                        )}
                      </div>

                      {/* Що шукають */}
                      {team.lookingFor?.length > 0 && !isFull && !isLocked && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-slate-500">Шукають:</span>
                          {team.lookingFor.map((role, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-md">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl">
              <Users className="mx-auto text-slate-700 mb-4" size={48} />
              <p className="text-slate-400 text-lg font-medium mb-1">Команд ще немає</p>
              <p className="text-slate-600 text-sm">Будь першим хто створить команду для цього хакатону</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsPage;