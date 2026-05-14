import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Check, X, Info } from 'lucide-react';

const JoinHackathon = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [fetching, setFetching] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;

  // Функція завантаження деталей запрошення
  const fetchInviteDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/members/${id}/details`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setInviteInfo(data);
      }
    } catch (err) {
      console.error("Failed to fetch details");
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('pendingInviteId', id);
      navigate('/register');
      return;
    }
    fetchInviteDetails();
  }, [navigate, id, fetchInviteDetails]);

  const handleResponse = async (status) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/hackathons/members/${id}/respond`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      navigate('/dashboard'); 
    } catch (error) {
      alert('Помилка при обробці запиту');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <div className="bg-slate-900 p-8 rounded-3xl max-w-md w-full text-center border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Info className="text-indigo-500" size={32} />
        </div>

        <h2 className="text-2xl font-bold mb-2">Запрошення</h2>
        
        {inviteInfo ? (
          <div className="mb-8">
            <p className="text-slate-400">
              <span className="text-indigo-400 font-semibold">{inviteInfo.inviter}</span> запрошує вас до хакатону
            </p>
            <h3 className="text-xl font-black text-white my-3">"{inviteInfo.hackathonTitle}"</h3>
            <div className="inline-block px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
               <span className="text-xs uppercase tracking-widest font-bold text-slate-300">На роль: {inviteInfo.role}</span>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 mb-8">Організатор запрошує вас приєднатися до хакатону.</p>
        )}
        
        <div className="flex gap-4">
          <button 
            onClick={() => handleResponse('Rejected')} 
            disabled={loading}
            className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-700 hover:border-rose-900 flex justify-center items-center gap-2"
          >
            <X size={18} /> Відхилити
          </button>
          <button 
            onClick={() => handleResponse('Accepted')} 
            disabled={loading}
            className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} Прийняти
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinHackathon;