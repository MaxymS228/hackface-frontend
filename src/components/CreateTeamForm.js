import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus, X, Loader2, AlertCircle, ChevronDown } from 'lucide-react';

const ROLES = ['Frontend', 'Backend', 'Design', 'ML', 'Mobile', 'DevOps', 'Other'];

const CreateTeamForm = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectIdea: '',
    lookingFor: [],
    primaryRole: 'Other', // Роль самого капітана
  });

  // Завантажуємо дані хакатону для відображення лімітів
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/api/hackathons/${hackathonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setHackathon(await res.json());
      } catch (err) {
        console.error('Помилка завантаження хакатону:', err);
      }
    };
    fetchHackathon();
  }, [hackathonId, apiUrl]);

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(role)
        ? prev.lookingFor.filter(r => r !== role)
        : [...prev.lookingFor, role]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Назва команди обов\'язкова');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hackathonId,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Помилка створення команди');
        return;
      }

      // Переходимо до кабінету команди
      navigate(`/hackathons/${hackathonId}/teams/${data.team._id}`);
    } catch (err) {
      setError('Помилка сервера. Спробуй ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 pt-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Хедер */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/hackathons/${hackathonId}/teams`)}
            className="text-slate-300 hover:text-slate-300 text-base flex items-center gap-1 mb-4 transition-colors"
          >
            ← Назад до команд
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Plus size={24} className="text-white" />
            </div>
            Створити команду
          </h1>
          {hackathon && (
            <p className="text-slate-400 mt-2">
              {hackathon.title} · {hackathon.minTeamSize}–{hackathon.maxTeamSize} учасників
            </p>
          )}
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Назва команди */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-indigo-400" /> Основна інформація
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Назва команди <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Наприклад: Team Rocket"
                    maxLength={40}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors pr-16"
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium ${formData.name.length >= 35 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {formData.name.length}/40
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Опис команди</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Розкажи про команду — хто ви, ваш підхід до роботи..."
                  rows={3}
                  maxLength={300}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
                <p className="text-xs text-slate-600 mt-1 text-right">{formData.description.length}/300</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ідея проєкту</label>
                <textarea
                  value={formData.projectIdea}
                  onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
                  placeholder="Що плануєте розробити? Яку проблему вирішує ваш проєкт?"
                  rows={3}
                  maxLength={500}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
                <p className="text-xs text-slate-600 mt-1 text-right">{formData.projectIdea.length}/500</p>
              </div>
            </div>
          </div>

          {/* Твоя роль */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-1">Твоя роль у команді</h3>
            <p className="text-slate-500 text-sm mb-4">Яку роль ти виконуватимеш як капітан?</p>
            <div className="relative">
              <select
                value={formData.primaryRole}
                onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Кого шукають */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-1">Кого шукаєте?</h3>
            <p className="text-slate-500 text-sm mb-4">Обери ролі які потрібні вашій команді</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => {
                const isSelected = formData.lookingFor.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {isSelected && <X size={12} className="inline mr-1" />}
                    {role}
                  </button>
                );
              })}
            </div>
            {formData.lookingFor.length > 0 && (
              <p className="text-xs text-indigo-400 mt-3">
                Шукаєте: {formData.lookingFor.join(', ')}
              </p>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/hackathons/${hackathonId}/teams`)}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 className="animate-spin" size={20} /> Створення...</>
                : <><Plus size={20} /> Створити команду</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamForm;