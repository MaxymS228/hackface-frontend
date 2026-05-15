import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Image as ImageIcon, Calendar, Tag, AlignLeft, Type, MapPin, Trophy, Loader2, AlertCircle, X } from 'lucide-react';

const CreateHackathon = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const bannerInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    format: 'Online',
    location: '',
    themes: '',
    prizes: ''
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const topRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    setError('');

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const deadline = new Date(formData.registrationDeadline);
    const now = new Date();
    const showError = (msg) => {
      setErrorMessage(msg);
      setIsLoading(false);
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

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      // Додаємо всі текстові поля
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      // Додаємо файл, якщо він є
      if (bannerFile) {
        submitData.append('banner', bannerFile);
      }

      const response = await fetch(`${apiUrl}/api/hackathons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        // Перенаправляємо на сторінку створеного хакатону
        navigate(`/hackathons/${data.hackathon._id}`);
      } else {
        setError(data.message || 'Помилка при створенні хакатону');
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6" ref={topRef}>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Rocket className="text-indigo-500" size={32} />
          Створити Хакатон
        </h1>
        <p className="text-slate-400 mt-2">Заповніть деталі вашого заходу, щоб залучити найкращих розробників.</p>
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

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-6 sm:p-8 rounded-3xl shadow-xl">
        
        {/* Завантаження банера */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-3">Заставка хакатону (Банер)</label>
          <div 
            onClick={() => bannerInputRef.current.click()}
            className={`relative w-full h-48 sm:h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
              bannerPreview ? 'border-slate-600' : 'border-slate-600 hover:border-indigo-500 bg-slate-900/50 hover:bg-slate-900'
            }`}
          >
            {bannerPreview ? (
              <>
                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-slate-900/80 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-md flex items-center gap-2">
                    <ImageIcon size={18} /> Змінити картинку
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <ImageIcon size={40} className="mx-auto text-slate-500 mb-3" />
                <p className="text-slate-300 font-medium">Натисніть, щоб завантажити зображення</p>
                <p className="text-slate-500 text-sm mt-1">Рекомендований розмір 1920x1080px</p>
              </div>
            )}
            <input type="file" ref={bannerInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        {/* Основна інформація */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Назва хакатону</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
                <Type size={18} className="text-slate-500" />
              </div>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="Awesome Hackathon 2026"
                maxLength={60}
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className={`text-xs font-medium ${formData.title.length >= 55 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {formData.title.length}/60
                </span>
              </div>
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
                placeholder="Детальний опис хакатону, вимоги до проектів, розклад..."
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Дати */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Початок хакатону</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
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
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
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
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
                <Calendar size={18} className="text-slate-500" />
              </div>
              <input
                type="datetime-local" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange}
                className="w-full pr-4 pl-11 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500 css-color-scheme-dark"
                style={{ width: '100%', paddingLeft: '48px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Формат та Локація */}
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
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

          {/* Теги та Призи */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Тематика (через кому)</label>
            <div className="relative" style={{ width: '100%' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
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
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)'}}>
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

        {/* Кнопка сабміту */}
        <div className="pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row sm:justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/dashboard`)}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <X size={20} /> Скасувати
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} />}
            {isLoading ? 'Створення...' : 'Запустити Хакатон'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateHackathon;