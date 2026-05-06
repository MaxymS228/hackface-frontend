import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, AlertTriangle, Search, Mail, Trash2, Loader2, UserMinus, AlertCircle } from 'lucide-react';

const ManageParticipants = () => {
  const { id } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  //const [isRemoving, setIsRemoving] = useState(null);
  const [removeModal, setRemoveModal] = useState({ 
    isOpen: false, 
    userId: null, 
    userName: '' 
  });
  const [isActionLoading, setIsActionLoading] = useState(false); 

  // Завантаження учасників
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/hackathons/${id}`);
        if (!response.ok) throw new Error('Не вдалося завантажити дані');
        
        const data = await response.json();
        
        // Фільтруємо тільки звичайних учасників
        if (data.members) {
          const onlyParticipants = data.members.filter(
            member => member.role === 'Participant'
          );
          setParticipants(onlyParticipants);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [id, apiUrl]);

  // Відкриття модалки
  const openRemoveModal = (userId, userName) => {
    setRemoveModal({
      isOpen: true,
      userId,
      userName
    });
  };

  // Логіка підтвердження видалення учасника
  const handleRemoveConfirm = async () => {
    const { userId } = removeModal;
    if (!userId) return;

    setIsActionLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/${id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Не вдалося видалити учасника');
      }

      // Оновлюємо список локально
      setParticipants(prev => prev.filter(member => member.user._id !== userId));
      setRemoveModal({ isOpen: false, userId: null, userName: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Фільтрація учасників за пошуком
  const filteredParticipants = participants.filter(member => {
    const term = searchQuery.toLowerCase();
    const name = member.user?.name?.toLowerCase() || '';
    const email = member.user?.email?.toLowerCase() || '';
    return name.includes(term) || email.includes(term);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Завантаження списку учасників...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Хедер секції */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Users size={24} className="text-indigo-400" />
            Учасники хакатону
          </h2>
          <p className="text-slate-400 text-sm">
            Загальна кількість: <span className="text-white font-medium">{participants.length}</span>
          </p>
        </div>

        {/* Пошук */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" style={{ top: '40%', transform: 'translateY(-50%)'}} />
          </div>
          <input
            type="text"
            placeholder="Пошук за ім'ям або email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Таблиця учасників */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex-1">
        {filteredParticipants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Користувач</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Дата реєстрації</th>
                  <th className="px-6 py-4 font-medium text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredParticipants.map((member) => (
                  <tr key={member.user._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={member.user.avatarUrl} alt={member.user.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <span className="font-medium text-slate-200">
                          {member.user.name || 'Невідомий користувач'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-500" />
                        {member.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('uk-UA') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openRemoveModal(member.user._id, member.user.name)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        title="Видалити учасника"
                      >

                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center px-4">
            <UserMinus size={48} className="mb-4 text-slate-700" />
            <p className="text-lg font-medium text-slate-300 mb-1">
              {searchQuery ? 'За вашим запитом нікого не знайдено' : 'Учасників ще немає'}
            </p>
            <p className="text-sm">
              {searchQuery ? 'Спробуйте змінити критерії пошуку.' : 'Щойно хтось зареєструється, він з\'явиться у цьому списку.'}
            </p>
          </div>
        )}
      </div>
      {/* Модальне вікно видалення учасника */}
    {removeModal.isOpen && (
    <div 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity"
        onClick={() => !isActionLoading && setRemoveModal({ ...removeModal, isOpen: false })}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 overflow-hidden shadow-2xl shadow-rose-900/20 text-center transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
            Видалити учасника?
        </h3>
        <p className="text-slate-400 text-sm mb-6">
            Ви впевнені, що хочете видалити користувача <span className="text-rose-400 font-semibold">{removeModal.userName}</span> з хакатону? Він втратить доступ до команд та матеріалів.
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setRemoveModal({ isOpen: false, userId: null, userName: '' })}
            disabled={isActionLoading}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          > Скасувати </button>
          <button 
            onClick={handleRemoveConfirm}
            disabled={isActionLoading}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-600/20"
          >
            {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            Видалити
          </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ManageParticipants;