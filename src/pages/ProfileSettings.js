import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, User, Briefcase, Globe, FileText, AlertCircle, CheckCircle2, Wrench, Camera, Lock, Key, X } from 'lucide-react';

const ProfileSettings = ({ user, setUser }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    bio: '',
    skills: '',
    githubLink: ''
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [bannerPreview, setBannerPreview] = useState(user?.banner || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passMessage, setPassMessage] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
          setFormData({
            name: data.name || '',
            specialization: data.specialization || '',
            bio: data.bio || '',
            skills: data.skills ? data.skills.join(', ') : '',
            githubLink: data.githubLink || ''
          });
          if (data.avatar) setAvatarPreview(data.avatar);
          if (data.banner) setBannerPreview(data.banner);
        } else {
          setFormData(prev => ({ ...prev, name: user?.name || '' }));
          setMessage({ type: 'error', text: data.message || 'Не вдалося завантажити дані' });
        }
      } catch (err) {
        console.error('Помилка завантаження даних', err);
        setFormData(prev => ({ ...prev, name: user?.name || '' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProfile();
  }, [apiUrl, user?.name]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarPreview(imageUrl);
      setAvatarFile(file); 
    } else {
      setBannerPreview(imageUrl);
      setBannerFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('specialization', formData.specialization);
      submitData.append('bio', formData.bio);
      submitData.append('skills', formData.skills);
      submitData.append('githubLink', formData.githubLink);
      if (avatarFile) submitData.append('avatar', avatarFile);
      if (bannerFile) submitData.append('banner', bannerFile);

      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Профіль успішно оновлено!' });
        
        if (typeof setUser === 'function') {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        const targetId = data.user._id || data.user.id;

        setTimeout(() => {
          navigate(`/profile/${targetId}`);
        }, 1500);

      } else {
        setMessage({ type: 'error', text: data.message || 'Помилка оновлення' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Помилка з\'єднання з сервером' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMessage(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPassMessage({ type: 'error', text: 'Нові паролі не співпадають' });
    }
    if (passwords.newPassword.length < 6) {
      return setPassMessage({ type: 'error', text: 'Пароль має містити щонайменше 6 символів' });
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPassMessage({ type: 'success', text: 'Пароль успішно змінено!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPassMessage({ type: 'error', text: data.message || 'Помилка зміни пароля' });
      }
    } catch (error) {
      setPassMessage({ type: 'error', text: 'Помилка з\'єднання з сервером' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Налаштування профілю</h1>
        <p className="text-slate-400 mt-2">Оновіть свою публічну інформацію, аватар та навички.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          <p className="text-base font-medium">{message.text}</p>
        </div>
      )}

      {/* Секція Зображень */}
      <div className="mb-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
        {/* Заставка */}
        <div className="relative h-40 w-full group">
          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button type="button" onClick={() => bannerInputRef.current.click()} className="bg-slate-900/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-md border border-slate-600">
              <Camera size={18} /> Змінити заставку
            </button>
            <input type="file" ref={bannerInputRef} onChange={(e) => handleImageChange(e, 'banner')} accept="image/*" className="hidden" />
          </div>
        </div>

        {/* Аватарка (накладається на заставку) */}
        <div className="px-8 pb-6 relative">
          <div className="relative -mt-12 w-24 h-24 rounded-2xl bg-indigo-600 border-4 border-slate-800 shadow-lg group overflow-hidden flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => avatarInputRef.current.click()}>
              <Camera size={24} className="text-white" />
            </div>
            <input type="file" ref={avatarInputRef} onChange={(e) => handleImageChange(e, 'avatar')} accept="image/*" className="hidden" />
          </div>
        </div>
      </div>

      {/* ФОРМА ПРОФІЛЮ */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl">
        
        {/* Ім'я */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Повне ім'я</label>
          <div className="relative" style={{ width: '100%' }}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
              <User size={18} className="text-slate-500" />
            </div>
            <input
              type="text"
              name="name"
              placeholder='Іван Іванов'
              value={formData.name}
              onChange={handleChange}
              required
              className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
              style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Спеціалізація */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Спеціалізація</label>
          <div className="relative" style={{ width: '100%' }}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
              <Briefcase size={18} className="text-slate-500" />
            </div>
            <input
              type="text"
              name="specialization"
              placeholder="Напр: Frontend Developer, UI/UX Designer"
              value={formData.specialization}
              onChange={handleChange}
              className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
              style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Про себе (Bio) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Про себе</label>
            <span className={`text-xs ${formData.bio.length >= 255 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
              {formData.bio.length}/255
            </span>
          </div>
          <div className="relative" style={{ width: '100%' }}>
            <div className="absolute top-3 left-4 pointer-events-none" style={{paddingTop: '30px', transform: 'translateY(-50%)'}}>
              <FileText size={18} className="text-slate-500" />
            </div>
            <textarea
              name="bio"
              rows="4"
              maxLength={255}
              placeholder="Розкажіть трохи про свій досвід..."
              value={formData.bio}
              onChange={handleChange}
              className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
              style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Навички */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Навички (через кому)</label>
          <div className="relative" style={{ width: '100%' }}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
              <Wrench size={18} className="text-slate-500" />
            </div>
            <input
              type="text"
              name="skills"
              placeholder="React, Node.js, Figma, Python"
              value={formData.skills}
              onChange={handleChange}
              className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
              style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Посилання на GitHub / Портфоліо</label>
          <div className="relative" style={{ width: '100%' }}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
              <Globe size={18} className="text-slate-500" />
            </div>
            <input
              type="url"
              name="githubLink"
              placeholder="https://github.com/username"
              value={formData.githubLink}
              onChange={handleChange}
              className="pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner shadow-black/20 m-0"
              style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row sm:justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/profile/${user._id || user.id}`)}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <X size={20} /> Скасувати
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex sm:w-auto items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Зберегти профіль
          </button>
        </div>

      </form>

      {/* Блок: Безпека та зміна пароля */}
      <div className="mt-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock size={24} className="text-indigo-500" />
          Безпека акаунта
        </h3>

        {user?.authProvider !== 'google' ? (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            
            {passMessage && (
              <div className={`p-4 rounded-xl text-sm font-medium border ${
                passMessage.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {passMessage.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Поточний пароль</label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
                  <Key size={18} className="text-slate-500" />
                </div>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner shadow-black/20"
                  placeholder="Введіть поточний пароль"
                  required
                  style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Новий пароль</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner shadow-black/20"
                  placeholder="Мінімум 6 символів"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Підтвердіть новий пароль</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner shadow-black/20"
                  placeholder="Повторіть новий пароль"
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-700/50 mt-6">
              <button
                type="submit"
                disabled={isChangingPassword || !passwords.currentPassword || !passwords.newPassword}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
              >
                {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                {isChangingPassword ? 'Оновлення...' : 'Змінити пароль'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-4 bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl">
            <div className="mt-0.5 bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Керування через Google</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ви авторизовані за допомогою Google-акаунта. Зміна пароля та управління безпекою здійснюється безпосередньо в налаштуваннях вашого облікового запису Google.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfileSettings;