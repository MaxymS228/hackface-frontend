import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Users, Loader2, AlertCircle, Check, X, Edit3, Lock, Unlock, Copy, CheckCheck, Trash2, AlertTriangle, Crown, Briefcase } from 'lucide-react'; // ChevronDown

const ROLES = ['Frontend', 'Backend', 'Design', 'ML', 'Mobile', 'DevOps', 'Other'];

const TeamWorkspace = () => {
  const { id: hackathonId, teamId } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'applications'
  const [actionLoading, setActionLoading] = useState(null);
  const [removeModal, setRemoveModal] = useState({ isOpen: false, memberId: null, userName: '' });

  // Режим редагування
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    projectIdea: '',
    lookingFor: [],
    isOpen: true,
  });

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

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        setError('Не вдалося завантажити дані команди');
        return;
      }

      const teamData = await res.json();
      setData(teamData);
      setEditForm({
        name: teamData.team.name,
        description: teamData.team.description || '',
        projectIdea: teamData.team.projectIdea || '',
        lookingFor: teamData.team.lookingFor || [],
        isOpen: teamData.team.isOpen,
      });
    } catch (err) {
      setError('Помилка сервера');
    } finally {
      setLoading(false);
    }
  }, [teamId, apiUrl]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Копіювання інвайт-коду
  const handleCopyCode = () => {
    navigator.clipboard.writeText(data?.team?.inviteCode || '');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Оновлення інфо команди
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return;
    setActionLoading('edit');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        setIsEditing(false);
        fetchTeamData();
      } else {
        const d = await res.json();
        setError(d.message || 'Помилка оновлення');
      }
    } catch {
      setError('Помилка сервера');
    } finally {
      setActionLoading(null);
    }
  };

  // Прийняти/відхилити заявку
  const handleApplication = async (applicationId, action) => {
    setActionLoading(applicationId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/teams/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) fetchTeamData();
      else {
        const d = await res.json();
        setError(d.message || 'Помилка');
      }
    } catch {
      setError('Помилка сервера');
    } finally {
      setActionLoading(null);
    }
  };

  // Видалити учасника
  const handleRemoveMember = async () => {
    setActionLoading('remove');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/teams/${teamId}/members/${removeModal.memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setRemoveModal({ isOpen: false, memberId: null, userName: '' });
        fetchTeamData();
      } else {
        const d = await res.json();
        setError(d.message || 'Помилка видалення');
      }
    } catch {
      setError('Помилка сервера');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleLookingFor = (role) => {
    setEditForm(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(role)
        ? prev.lookingFor.filter(r => r !== role)
        : [...prev.lookingFor, role]
    }));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
  );

  if (error && !data) return (
    <div className="max-w-2xl mx-auto px-4 pt-12 text-center">
      <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
      <p className="text-rose-400 text-lg font-medium">{error}</p>
      <button onClick={() => navigate(`/hackathons/${hackathonId}/teams`)} className="mt-4 px-6 py-2.5 bg-slate-800 text-white rounded-xl">
        Назад до команд
      </button>
    </div>
  );

  const { team, members, applications, isCaptain, isLocked } = data;
  const pendingApplications = applications?.filter(a => a.status === 'Pending') || [];

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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/20 rounded-2xl">
                <Shield className="text-indigo-400" size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                  {team.isAutoGenerated && (
                    <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">Авто</span>
                  )}
                  {isLocked ? (
                    <span className="flex items-center gap-1 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                      <Lock size={10} /> Заблокована
                    </span>
                  ) : team.isOpen ? (
                    <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Unlock size={10} /> Відкрита
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">Закрита</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-0.5">
                  {isCaptain ? 'Ти капітан цієї команди' : 'Ти учасник цієї команди'} · {members?.length || 0} учасників
                </p>
              </div>
            </div>

            {/* Кнопка редагування — тільки капітан і не заблоковано */}
            {isCaptain && !isLocked && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  isEditing
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isEditing ? <><X size={16} /> Скасувати</> : <><Edit3 size={16} /> Редагувати</>}
              </button>
            )}
          </div>
        </div>

        {/* Повідомлення про блокування */}
        {isLocked && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Lock className="text-rose-400 shrink-0" size={18} />
            <p className="text-rose-300 text-sm">
              Команда заблокована — хакатон скоро починається. Зміни складу команди більше неможливі.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm mb-6">
            <AlertCircle size={18} className="shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
          </div>
        )}

        {/* Форма редагування */}
        {isEditing && (
          <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="text-base font-semibold text-white mb-2">Редагування команди</h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Назва команди</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                maxLength={40}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Опис</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                maxLength={300}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ідея проєкту</label>
              <textarea
                value={editForm.projectIdea}
                onChange={(e) => setEditForm({ ...editForm, projectIdea: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Кого шукаєте</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(role => {
                  const selected = editForm.lookingFor.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleLookingFor(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Відкрита/закрита */}
            <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div>
                <p className="text-white text-sm font-medium">Приймати нових учасників</p>
                <p className="text-slate-500 text-xs mt-0.5">Якщо вимкнути — заявки більше не надходитимуть</p>
              </div>
              <button
                onClick={() => setEditForm(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${editForm.isOpen ? 'bg-indigo-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.isOpen ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading === 'edit' || !editForm.name.trim()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'edit'
                  ? <><Loader2 className="animate-spin" size={18} /> Збереження...</>
                  : <><Check size={18} /> Зберегти</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Таби — тільки для капітана */}
        {isCaptain && (
          <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'team'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Users size={16} className="inline mr-2" /> Команда
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all relative ${
                activeTab === 'applications'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Briefcase size={16} className="inline mr-2" /> Заявки
              {pendingApplications.length > 0 && (
                <span className="absolute top-1.5 right-4 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingApplications.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Вкладка Команда */}
        {activeTab === 'team' && (
          <div className="space-y-4">

            {/* Інвайт-код — тільки капітан */}
            {isCaptain && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Інвайт-код</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 font-mono text-lg font-bold text-white tracking-widest text-center">
                    {team.inviteCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
                  >
                    {copiedCode ? <CheckCheck size={20} className="text-emerald-400" /> : <Copy size={20} />}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2">Поділись кодом щоб запросити людей напряму</p>
              </div>
            )}

            {/* Список учасників */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Учасники ({members?.length || 0})
                </h3>
              </div>

              <div className="divide-y divide-slate-800">
                {members?.map((member) => {
                  const isMe = member.user?._id === currentUserId;
                  const isMemberCaptain = member.teamRole === 'Captain';

                  return (
                    <div key={member._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition-colors">
                      {/* Аватар */}
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {member.user?.name?.substring(0, 2).toUpperCase() || '??'}
                      </div>

                      {/* Інфо */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">
                            {member.user?.name || 'Невідомо'}
                          </span>
                          {isMe && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">Ти</span>
                          )}
                          {isMemberCaptain && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                              <Crown size={9} /> Капітан
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{member.user?.email}</span>
                          {member.primaryRole && (
                            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{member.primaryRole}</span>
                          )}
                        </div>
                      </div>

                      {/* Кнопка видалення — капітан, не себе, не заблоковано */}
                      {isCaptain && !isMe && !isMemberCaptain && !isLocked && (
                        <button
                          onClick={() => setRemoveModal({ isOpen: true, memberId: member._id, userName: member.user?.name || '' })}
                          className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Інфо про проєкт */}
            {(team.description || team.projectIdea) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Про команду</h3>
                {team.description && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Опис</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{team.description}</p>
                  </div>
                )}
                {team.projectIdea && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ідея проєкту</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{team.projectIdea}</p>
                  </div>
                )}
                {team.lookingFor?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Шукаємо</p>
                    <div className="flex flex-wrap gap-1.5">
                      {team.lookingFor.map((role, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg">{role}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Вкладка Заявки — тільки капітан */}
        {activeTab === 'applications' && isCaptain && (
          <div className="space-y-4">
            {pendingApplications.length > 0 ? (
              pendingApplications.map((app) => (
                <div key={app._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                      {app.applicantId?.name?.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white">{app.applicantId?.name}</span>
                        {app.primaryRole && (
                          <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">{app.primaryRole}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{app.applicantId?.email}</p>
                      {app.coverLetter && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4">
                          <p className="text-xs text-slate-500 mb-1">Супровідний текст</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{app.coverLetter}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplication(app._id, 'reject')}
                          disabled={actionLoading === app._id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        >
                          <X size={15} /> Відхилити
                        </button>
                        <button
                          onClick={() => handleApplication(app._id, 'accept')}
                          disabled={actionLoading === app._id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {actionLoading === app._id
                            ? <Loader2 className="animate-spin" size={15} />
                            : <Check size={15} />
                          }
                          Прийняти
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl">
                <Briefcase className="mx-auto text-slate-700 mb-4" size={40} />
                <p className="text-slate-400 font-medium">Нових заявок немає</p>
                <p className="text-slate-600 text-sm mt-1">Заявки від учасників з'являться тут</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Модалка видалення учасника */}
      {removeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Видалити учасника?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Видалити <span className="text-rose-400 font-semibold">{removeModal.userName}</span> з команди?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveModal({ isOpen: false, memberId: null, userName: '' })}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={actionLoading === 'remove'}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === 'remove'
                  ? <Loader2 className="animate-spin" size={18} />
                  : <Trash2 size={18} />
                }
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;