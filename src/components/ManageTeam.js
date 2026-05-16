import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserPlus, Mail, Shield, Award, Clock, CheckCircle2, AlertCircle, XCircle, Loader2, Trash2, ChevronDown, AlertTriangle } from 'lucide-react';

const ManageTeam = () => {
  const { id } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [team, setTeam] = useState([]); 
  const [invitations, setInvitations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [hackathonOrganizerId, setHackathonOrganizerId] = useState(null);
  
  const [inviteData, setInviteData] = useState({ email: '', role: 'Mentor' });
  const [removeModal, setRemoveModal] = useState({ isOpen: false, memberId: null, userName: '', type: 'member' });

  // ID поточного юзера з токена
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded._id;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  const fetchTeamData = useCallback (async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/hackathons/${id}`);
      const data = await response.json();
      //console.log("ДАНІ З БЕКЕНДУ:", data.members);

      if (data.organizerId) setHackathonOrganizerId(data.organizerId);

      if (data.members) {
        setTeam(data.members.filter(m => m.status === 'Accepted' & m.role !== 'Participant'));
        setInvitations(data.members.filter(m => m.status === 'Pending' || m.status === 'Rejected'));
      }
    } catch (err) {
      setError('Помилка при завантаженні команди');
    } finally {
      setIsLoading(false);
    }
  }, [id, apiUrl]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Роль поточного користувача
  const currentUserMember = team.find(m => m.user?._id === currentUserId);
  const isMainOrganizer = hackathonOrganizerId === currentUserId;
  const isOrganizer = currentUserMember?.role === 'Organizer' || isMainOrganizer;

  // Перевірка чи може поточний юзер видалити конкретного члена
  const canRemove = (member) => {
    // Ніхто не може видалити головного організатора
    if (member.user?._id === hackathonOrganizerId) return false;
    // Не можна видалити себе
    if (member.user?._id === currentUserId) return false;
    // Головний організатор може видаляти всіх
    if (isMainOrganizer) return true;
    // Звичайний організатор може видаляти тільки Jury/Mentor
    if (isOrganizer && (member.role === 'Jury' || member.role === 'Mentor')) return true;
    return false;
  };

  // const copyPublicLink = (role) => {
  //   const link = `${window.location.origin}/join-hackathon/${id}`;
  //   navigator.clipboard.writeText(link);
  //   alert(`Посилання для ролі ${role} скопійовано!`);
  // };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const roleToSend = inviteData.role === 'Organizer' ? 'Co-organizer' : inviteData.role;
      const response = await fetch(`${apiUrl}/api/hackathons/${id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...inviteData, role: roleToSend})
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Помилка');
      fetchTeamData();
      setInviteData({ email: '', role: 'Mentor' });
    } catch (err) {
      setError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/${id}/members/${removeModal.memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Не вдалося видалити');
      
      setRemoveModal({ isOpen: false, memberId: null, userName: '', type: 'member', userId: null });
      fetchTeamData();
    } catch (err) {
      alert(err.message);
    }
  };

  const roleConfig = {
    'Organizer': { label: 'Організатор', icon: <Shield size={14} />, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    'Co-organizer': { label: 'Со-організатор', icon: <Shield size={14} />, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
    'Mentor': { label: 'Ментор', icon: <Award size={14} />, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    'Jury': { label: 'Журі', icon: <CheckCircle2 size={14} />, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

  return (
    <div className="space-y-10">
      {/* Форма запрошення */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <UserPlus className="text-indigo-400" /> Запросити в команду
        </h3>
        {error && <div className="mt-2 mb-4 text-rose-500 text-sm font-medium flex items-center gap-1"><AlertCircle size={20} /> {error}</div>}
        <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative" style={{ width: '100%' }}>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" style={{ top: '70%', transform: 'translateY(-50%)'}} size={18} />
            <input
              type="email" required placeholder="Email користувача..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
              value={inviteData.email}
              onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
              style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
            />
          </div>
          <div className="relative min-w-[180px]">
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-indigo-500 cursor-pointer"
              value={inviteData.role}
              onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
            >
              <option value="Mentor">Ментор</option>
              <option value="Jury">Журі</option>
              {isMainOrganizer && <option value="Organizer">Со-організатор</option>}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          </div>
          <button type="submit" disabled={inviteLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {inviteLoading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />} Надіслати
          </button>
        </form>

        {/* <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
          <span className="text-slate-500 text-xs w-full mb-1">Швидкі посилання для реєстрації (публічні):</span>
          {['Mentor', 'Jury'].map(r => (
            <button key={r} onClick={() => copyPublicLink(r)} className="text-[10px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <LinkIcon size={12} /> {r}
            </button>
          ))}
        </div> */}
      </section>

      {/* Табличка 1: Команда */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Поточна команда</h3>
          <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full font-bold">{team.length} осіб</span>
        </div>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/20 text-slate-500">
            <tr>
              <th className="px-6 py-4">Користувач</th>
              <th className="px-6 py-4">Роль</th>
              <th className="px-6 py-4 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {team.map((m) => (
              <tr key={m._id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  {m.user ? (
                    <Link to={`/profile/${m.user._id}`} className="flex items-center gap-3 hover:opacity-80">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                        {m.user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">
                          {m.user.name}
                          {m.user._id === hackathonOrganizerId && (
                            <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded font-bold">ГОЛОВНИЙ</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{m.user.email}</div>
                      </div>
                    </Link>
                  ) : (
                    <span className="text-slate-400">{m.email}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border inline-flex items-center gap-1.5 ${roleConfig[m.role]?.color}`}>
                    {roleConfig[m.role]?.icon} {roleConfig[m.role]?.label}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {canRemove(m) && (
                    <button 
                      onClick={() => setRemoveModal({ isOpen: true, memberId: m._id, userName: m.user?.name || m.email, type: 'member', userId: m.user?._id })} 
                      className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Табличка 2: Очікування */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden opacity-90">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Статус запрошень</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/20 text-slate-500 text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Отримувач</th>
                <th className="px-6 py-4 font-medium">Роль</th>
                <th className="px-6 py-4 font-medium">Статус</th>
                <th className="px-6 py-4 font-medium text-right">Дія</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invitations.map((invite) => (
                <tr key={invite._id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-6 py-4 text-slate-300">{invite.email || invite.user?.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-xs font-bold border border-slate-700 px-2 py-0.5 rounded">{invite.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    {invite.status === 'Pending' ? (
                      <span className="flex items-center gap-1.5 text-amber-500/80 text-xs font-medium">
                        <Clock size={14} className="animate-pulse" /> Очікує
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-500/80 text-xs font-medium">
                        <XCircle size={14} /> Відхилено
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isOrganizer && (
                      <button 
                        onClick={() => setRemoveModal({ isOpen: true, memberId: invite._id, userName: invite.email, type: 'invite', userId: null })}
                        className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Універсальна Модалка */}
      {removeModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Видалити?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Видалити запис <span className="text-rose-400 font-semibold">{removeModal.userName}</span> з команди?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveModal({ isOpen: false, memberId: null, userName: '', userId: null })} className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors">Скасувати</button>
              <button onClick={handleRemoveMember} className="flex-1 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors">Видалити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeam;