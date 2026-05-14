import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  // Дістаємо токен з URL (з маршруту /verify/:token)
  const { token } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        // Відправляємо токен на ваш бекенд
        const response = await fetch(`${apiUrl}/api/verify/${token}`, {
          method: 'GET',
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Вашу електронну адресу успішно підтверджено!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Посилання недійсне або термін його дії минув.');
        }
      } catch (error) {
        console.error('Помилка перевірки:', error);
        setStatus('error');
        setMessage('Помилка з\'єднання з сервером. Спробуйте пізніше.');
      }
    };

    // Запускаємо функцію тільки якщо є токен
    if (token) {
      verifyUserEmail();
    } else {
      setStatus('error');
      setMessage('Токен підтвердження не знайдено.');
    }
  }, [token, apiUrl]);

  return (
    <div className="flex-1 flex items-center justify-center w-full py-12 px-4">
      <div className="max-w-md w-full px-10 py-12 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-3xl shadow-2xl shadow-black/50 text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-pulse">
            <div className="bg-indigo-500/20 p-5 rounded-full border border-indigo-500/30 mb-6 shadow-inner shadow-indigo-500/20">
              <Loader2 size={48} className="text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Перевірка даних...</h2>
            <p className="text-slate-400">Зачекайте, ми підтверджуємо вашу адресу.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="bg-emerald-500/20 p-5 rounded-full border border-emerald-500/30 mb-6 shadow-inner shadow-emerald-500/20">
              <CheckCircle size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Успіх!</h2>
            <p className="text-slate-300 text-base mb-8">{message}</p>
            
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25"
            >
              Увійти в акаунт
              <ArrowRight size={20} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="bg-rose-500/20 p-5 rounded-full border border-rose-500/30 mb-6 shadow-inner shadow-rose-500/20">
              <XCircle size={48} className="text-rose-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Помилка</h2>
            <p className="text-slate-300 text-base mb-8">{message}</p>
            
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              Спробувати ще раз
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;