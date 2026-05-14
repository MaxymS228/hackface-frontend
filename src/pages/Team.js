import React, { useState, useEffect } from 'react';
import { Users, Plus, LogIn, Code, Hash, Copy, CheckCircle2, User, ShieldAlert } from 'lucide-react';

const Team = () => {
  const [teamName, setTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const [teamCreated, setTeamCreated] = useState(false);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [team, setTeam] = useState(null);
  const [copied, setCopied] = useState(false);

  // Обережно парсимо юзера, щоб уникнути помилок, якщо localStorage порожній
  const user = JSON.parse(localStorage.getItem('user')) || { id: 'test-id', name: 'Гість' };

  // Завантажити доступні хакатони
  useEffect(() => {
    fetch('http://localhost:5000/api/hackathons')
      .then(res => res.json())
      .then(data => setHackathons(data))
      .catch(err => console.error('Помилка отримання хакатонів:', err));
  }, []);

  // + Створити команду
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          hackathonId: selectedHackathon,
          userId: user.id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTeamCreated(true);
        setTeam(data.team);
      } else {
        alert(data.message || 'Помилка створення команди');
      }
    } catch (err) {
      console.error(err);
      alert('Сервер недоступний');
    }
  };

  // + Приєднатись до команди
  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: joinTeamId,
          userId: user.id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTeamCreated(true);
        // Мок-дані для відображення, якщо бекенд не повертає повну команду при приєднанні
        setTeam(data.team || { _id: joinTeamId, name: 'Ваша команда', members: [{ name: user.name }] });
      } else {
        alert(data.message || 'Не вдалося приєднатися');
      }
    } catch (err) {
      console.error(err);
      alert('Сервер недоступний');
    }
  };

  // Копіювання ID команди
  const handleCopyId = () => {
    if (team?._id) {
      navigator.clipboard.writeText(team._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Заголовок */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4">
            <Users size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Командна робота</h2>
          <p className="text-slate-400 max-w-2xl">
            Створи свою власну команду мрії або приєднайся до існуючої, щоб разом змагатися у найкращих хакатонах.
          </p>
        </div>

        {!teamCreated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Блок: Створити команду */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                  <Plus size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Створити команду</h3>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-5 flex-1 flex flex-col">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Назва команди</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Введіть круту назву..."
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Оберіть хакатон</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Code size={18} className="text-slate-500" />
                    </div>
                    <select
                      value={selectedHackathon}
                      onChange={(e) => setSelectedHackathon(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white appearance-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="" disabled className="text-slate-500">Виберіть зі списку</option>
                      {hackathons.map((hack) => (
                        <option key={hack._id} value={hack._id}>
                          {hack.name || hack.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="mt-auto w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Створити нову команду
                </button>
              </form>
            </div>

            {/* Блок: Приєднатися до команди */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-700"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                  <LogIn size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Приєднатися до команди</h3>
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-5 flex-1 flex flex-col">
                <div className="mb-auto">
                  <label className="block text-sm font-semibold text-slate-400 mb-2">ID команди</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Вставте унікальний ID..."
                      value={joinTeamId}
                      onChange={(e) => setJoinTeamId(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> 
                    Отримайте ID у капітана вашої команди
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={20} /> Приєднатися
                </button>
              </form>
            </div>

          </div>
        ) : (
          
          /* Стан: Команду створено/приєднано */
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
            <div className="bg-emerald-500/10 p-8 text-center border-b border-slate-800">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 text-emerald-400 rounded-full mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{team?.name || 'Ваша команда'}</h3>
              <p className="text-emerald-400/80 font-medium">Ви успішно увійшли до складу команди!</p>
            </div>

            <div className="p-8">
              <div className="mb-8 bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wider">ID Команди (для запрошення)</p>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-indigo-400 font-mono text-lg">{team?._id || 'ID_не_знайдено'}</code>
                  <button 
                    onClick={handleCopyId}
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    title="Копіювати ID"
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-slate-400" />
                  Учасники команди
                </h4>
                <ul className="space-y-3">
                  {team?.members && team.members.length > 0 ? (
                    team.members.map((member, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <User size={16} />
                        </div>
                        <span className="text-white font-medium">{member.name || member}</span>
                        {idx === 0 && <span className="ml-auto text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Капітан</span>}
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <User size={16} />
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                        <span className="ml-auto text-xs bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">Ви</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;