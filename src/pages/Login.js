import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  //const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Невірний email або пароль');
      }
    } catch (err) {
      setError('Сервер тимчасово недоступний. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.access_token }),
      });

      const data = await response.json();

      if (response.ok) {
        // Зберігаємо юзера і перекидаємо на головну/дашборд
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Помилка авторизації через Google');
      }
    } catch (err) {
      setError('Не вдалося з\'єднатися з сервером Google-авторизації');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => setError('Вхід через Google скасовано або стався збій'),
  });

  return (
    <div className="flex-1 flex items-center justify-center w-full py-12 px-4">
      <div className="max-w-lg w-full px-10 py-12 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-3xl shadow-2xl shadow-black/50">
        
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/30 mb-5 shadow-inner shadow-indigo-500/20">
            <Terminal size={36} className="text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">З поверненням</h2>
          <p className="text-slate-400 text-base mt-2">Увійдіть, щоб продовжити роботу</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle size={22} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="text-base text-rose-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Поле Email */}
          <div style={{ width: '100%' }}>
            <label className="block text-base font-semibold text-slate-300 mb-2.5">Пошта</label>
            <div className="relative" style={{ width: '100%' }}>
              <div 
                className="absolute pointer-events-none"
                style={{ top: '40%', transform: 'translateY(-50%)', left: '16px' }}
              >
                <Mail size={20} className="text-slate-500" />
              </div>
              <input
                type="email"
                placeholder="qwe123@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          {/* Поле Пароль */}
          <div style={{ width: '100%' }}>
            <label className="block text-base font-semibold text-slate-300 mb-2.5">Пароль</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute pointer-events-none" style={{ top: '40%', transform: 'translateY(-50%)', left: '16px' }} >
                <Lock size={20} className="text-slate-500" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="shrink-0" style={{ display: 'grid', placeItems: 'center', width: '20px', height: '20px'}}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none m-0 border border-slate-600 rounded bg-slate-900 checked:bg-indigo-600 checked:border-indigo-600 transition-colors cursor-pointer"
                    style={{ width: '80%', height: '70%', gridArea: '1 / 1' 
                    }}/>
                  <svg className="text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="100 0 20 20" fill="currentColor"style={{ width: '14px', height: '14px', gridArea: '1 / 1'}}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors select-none"style={{ lineHeight: '20px' }}>
                  Запам'ятати мене
                </span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Забули пароль?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-70 mt-6"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Увійти до системи
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Або</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        {/* Кнопка Goohle */}
        <button
          type="button"
          onClick={() => loginWithGoogle()}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 text-white text-base font-semibold py-3.5 rounded-xl transition-all shadow-inner shadow-black/20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Увійти через Google
        </button>

        <p className="mt-8 text-center text-base text-slate-400">
          Не маєте акаунту?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;