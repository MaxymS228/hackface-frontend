import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, AlignLeft, Type, MapPin, Tag, Trophy, Save, X, Upload, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon} from 'lucide-react';


const ManageSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Стан форми
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    format: 'Online',
    location: '',
    themes: '',
    prizes: '',
  });

  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const topRef = useRef(null);

  // Завантаження даних хакатону
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/hackathons/${id}`);
        if (!response.ok) throw new Error('Не вдалося завантажити дані');
        
        const data = await response.json();
        
        const formatDateTime = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
            title: data.title || '',
            description: data.description || '',
            startDate: formatDateTime(data.startDate),
            endDate: formatDateTime(data.endDate),
            registrationDeadline: formatDateTime(data.registrationDeadline),
            format: data.format || 'Online',
            location: data.location || '',
            themes: data.themes ? data.themes.join(', ') : '',
            prizes: data.prizes || '',
        });
        
        if (data.banner) setBannerPreview(data.banner);
        
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathon();
  }, [id, apiUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setError('');
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const scrollToTop = () => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const deadline = new Date(formData.registrationDeadline);
    const now = new Date();
    const showError = (msg) => {
      setErrorMessage(msg);
      setIsSaving(false);
      scrollToTop();
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (deadline < now) {
      return showError('Дедлайн реєстрації не може бути в минулому часі!');
    }
    if (deadline > start) {
      return showError('Дедлайн реєстрації має закінчитися ДО початку хакатону!');
    }
    if (start >= end) {
      return showError('Дата завершення має бути пізніше за дату початку!');
    }

    const data = new FormData();
    // Додаємо всі текстові поля
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    // Додаємо банер, якщо він був змінений
    if (banner) {
      data.append('banner', banner);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/hackathons/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Помилка при оновленні');

      setMessage({ type: 'success', text: 'Зміни успішно збережено!' });
      scrollToTop();
      // Через 2 секунди прибираємо повідомлення про успіх
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      scrollToTop();
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Завантаження налаштувань...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl" ref={topRef}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Налаштування хакатону</h2>
          <p className="text-slate-400 text-sm">Оновіть основну інформацію про вашу подію</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle size={22} />
          <p className="text-base font-medium">{error}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Секція Банера */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300 block">Банер хакатону</label>
          <div className="relative group">
            <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center relative">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <ImageIcon size={40} className="mb-2" />
                  <p className="text-sm">Зображення не вибрано</p>
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                <Upload size={24} className="mb-2" />
                <span className="font-medium text-sm">Змінити банер</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">Рекомендований розмір: 1200x400px. Формати: JPG, PNG.</p>
          </div>
        </div>

        {/* Текстові поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Назва хакатону</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                <Type size={18} className="text-slate-500" />
              </div>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="Введіть назву..."
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Опис та правила</label>
            <div className="relative">
              <div className="absolute top-4 left-4 pointer-events-none">
                <AlignLeft size={18} className="text-slate-500" />
              </div>
              <textarea
                name="description" value={formData.description} onChange={handleChange} required rows="5"
                placeholder="Детально опишіть хакатон..."
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Початок хакатону</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                <Calendar size={18} className="text-slate-500" />
              </div>
              <input
                type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500 css-color-scheme-dark"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Кінець хакатону</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                <Calendar size={18} className="text-slate-500" />
              </div>
              <input
                type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500 css-color-scheme-dark"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Дедлайн реєстрації</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                <Calendar size={18} className="text-slate-500" />
              </div>
              <input
                type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange}
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500 css-color-scheme-dark"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Формат проведення</label>
            <select
              name="format" value={formData.format} onChange={handleChange}
              className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              <option value="Online">Online (Дистанційно)</option>
              <option value="Offline">Offline (На локації)</option>
              <option value="Hybrid">Hybrid (Змішаний)</option>
            </select>
          </div>

          {formData.format !== 'Online' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Локація / Місто</label>
              <div className="relative" style={{ width: '100%' }}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                  <MapPin size={18} className="text-slate-500" />
                </div>
                <input
                  type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="м. Київ, вул. Хрещатик, 1 (HUB)"
                  className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
                  style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Тематика (через кому)</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                <Tag size={18} className="text-slate-500" />
              </div>
              <input
                type="text" name="themes" value={formData.themes} onChange={handleChange}
                placeholder="AI, Web3, FinTech, EdTech"
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Призовий фонд / Нагороди</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '35%', transform: 'translateY(-50%)'}}>
                <Trophy size={18} className="text-slate-500" />
              </div>
              <input
                type="text" name="prizes" value={formData.prizes} onChange={handleChange}
                placeholder="$5000, Гаджети, Інтернатура..."
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Кнопки дій */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate(`/hackathons/${id}`)}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <X size={20} /> Скасувати
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageSettings;