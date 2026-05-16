import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Users, Loader2, AlertCircle, Filter, X, ChevronRight, UserPlus, Briefcase } from 'lucide-react';

const ROLES = ['Frontend', 'Backend', 'Design', 'ML', 'Mobile', 'DevOps', 'Other'];

const TeamMatchmaking = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [teams, setTeams] = useState([]);
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyingTeamId, setApplyingTeamId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [applyModal, setApplyModal] = useState({
    isOpen: false,
    teamId: null,
    teamName: '',
  });
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    primaryRole: 'Other',
  });
  const [applySuccess, setApplySuccess] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const params = new URLSearchParams();
      if (filterRole) params.append('role', filterRole);

      const [hackRes, teamsRes] = await Promise.all([
        fetch(`${apiUrl}/api/hackathons/${hackathonId}`, { headers }),
        fetch(`${apiUrl}/api/teams/hackathon/${hackathonId}/looking?${params}`, { headers }),
      ]);

      if (hackRes.ok) setHackathon(await hackRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
    } catch (err) {
      console.error('Помилка завантаження:', err);
    } finally {
      setLoading(false);
    }
  }, [hackathonId, apiUrl, filterRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Фільтрація по пошуку на фронті
  const filteredTeams = teams.filter(team => {
    if (!searchQuery) return true;
    return (
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.projectIdea?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openApplyModal = (team) => {
    setApplyModal({ isOpen: true, teamId: team._id, teamName: team.name });
    setApplyForm({ coverLetter: '', primaryRole: 'Other' });
    setError('');
    setApplySuccess('');
  };

  const handleApply = async () => {
    if (!applyForm.coverLetter.trim()) {
      setError('Напиши супровідний текст');
      return;
    }
    setApplyingTeamId(applyModal.teamId);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/teams/${applyModal.teamId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(applyForm)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Помилка подачі заявки');
        return;
      }

      setApplySuccess('Заявку успішно подано! Очікуй відповіді від капітана.');
      setTimeout(() => {
        setApplyModal({ isOpen: false, teamId: null, teamName: '' });
        setApplySuccess('');
      }, 2500);
    } catch (err) {
      setError('Помилка сервера. Спробуй ще раз.');
    } finally {
      setApplyingTeamId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Хедер */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/hackathons/${hackathonId}/teams`)}
            className="text-slate-300 hover:text-slate-300 text-base flex items-center gap-1 mb-4 transition-colors"
          >
            ← Назад до команд
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Search size={24} className="text-white" />
            </div>
            Знайти команду
          </h1>
          <p className="text-slate-400 mt-2">
            {hackathon?.title} · Команди що шукають учасників
          </p>
        </div>

        {/* Пошук і фільтр */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Пошук за назвою або описом..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Фільтр за роллю */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-3 text-slate-300 appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">Всі ролі</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Лічильник */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            Знайдено: <span className="text-white font-medium">{filteredTeams.length}</span> команд
          </p>
          {filterRole && (
            <button
              onClick={() => setFilterRole('')}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <X size={12} /> Скинути фільтр
            </button>
          )}
        </div>

        {/* Список команд */}
        {filteredTeams.length > 0 ? (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <div
                key={team._id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4">

                  {/* Інфо про команду */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-0.5">{team.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Users size={12} /> Капітан: {team.captainId?.name || 'Невідомо'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-lg shrink-0">
                        <Users size={12} />
                        {team.membersCount} / {hackathon?.maxTeamSize}
                        <span className="text-emerald-600">·</span>
                        {team.spotsLeft} місць
                      </div>
                    </div>

                    {/* Опис */}
                    {team.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{team.description}</p>
                    )}

                    {/* Ідея проєкту */}
                    {team.projectIdea && (
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-3">
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Briefcase size={11} /> Ідея проєкту
                        </p>
                        <p className="text-sm text-slate-300 line-clamp-2">{team.projectIdea}</p>
                      </div>
                    )}

                    {/* Кого шукають */}
                    {team.lookingFor?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-xs text-slate-500">Шукають:</span>
                        {team.lookingFor.map((role, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                              filterRole === role
                                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Кнопка подати заявку */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => openApplyModal(team)}
                      className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-sm whitespace-nowrap"
                    >
                      <UserPlus size={16} /> Подати заявку
                    </button>
                    <button
                      onClick={() => navigate(`/hackathons/${hackathonId}/teams/${team._id}`)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Детальніше <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <Search className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-400 text-lg font-medium mb-1">
              {searchQuery || filterRole ? 'Нічого не знайдено' : 'Немає команд що шукають учасників'}
            </p>
            <p className="text-slate-600 text-sm mb-6">
              {searchQuery || filterRole ? 'Спробуй змінити параметри пошуку' : 'Можливо всі команди вже укомплектовані'}
            </p>
            {(searchQuery || filterRole) && (
              <button
                onClick={() => { setSearchQuery(''); setFilterRole(''); }}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors text-sm"
              >
                Скинути фільтри
              </button>
            )}
          </div>
        )}
      </div>

      {/* Модалка подачі заявки */}
      {applyModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !applyingTeamId && setApplyModal({ isOpen: false, teamId: null, teamName: '' })}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Подати заявку</h3>
                <p className="text-slate-400 text-sm mt-0.5">до команди <span className="text-indigo-400 font-semibold">{applyModal.teamName}</span></p>
              </div>
              <button
                onClick={() => setApplyModal({ isOpen: false, teamId: null, teamName: '' })}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {applySuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="text-emerald-400" size={32} />
                </div>
                <p className="text-emerald-400 font-semibold text-lg">{applySuccess}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </div>
                )}

                {/* Роль */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Твоя роль</label>
                  <select
                    value={applyForm.primaryRole}
                    onChange={(e) => setApplyForm({ ...applyForm, primaryRole: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Супровідний текст */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Супровідний текст <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={applyForm.coverLetter}
                    onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    placeholder="Розкажи про себе, свій досвід і чому хочеш приєднатись до цієї команди..."
                    rows={4}
                    maxLength={500}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-slate-600 mt-1 text-right">{applyForm.coverLetter.length}/500</p>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setApplyModal({ isOpen: false, teamId: null, teamName: '' })}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!!applyingTeamId || !applyForm.coverLetter.trim()}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {applyingTeamId
                      ? <><Loader2 className="animate-spin" size={18} /> Надсилання...</>
                      : <><UserPlus size={18} /> Подати</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMatchmaking;