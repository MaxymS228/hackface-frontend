import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User as UserIcon, Briefcase, Globe, Calendar, Code, Edit3, Loader2 } from 'lucide-react';

const PublicProfile = ({ currentUser }) => {
  const { id } = useParams(); // Отримуємо ID користувача з URL
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users/${id}`);
        const data = await response.json();

        if (response.ok) {
          setProfile(data);
        } else {
          setError(data.message || 'Профіль не знайдено');
        }
      } catch (err) {
        setError('Помилка з\'єднання з сервером');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, apiUrl]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-rose-400 text-xl font-semibold bg-rose-500/10 px-6 py-4 rounded-2xl border border-rose-500/20">
          {error}
        </div>
      </div>
    );
  }

  //const isOwnProfile = currentUser && currentUser.id === id;
  const isOwnProfile = currentUser && (currentUser.id === id || currentUser._id === id);
  const userInitial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Заставка та Аватар */}
      <div className="relative w-full h-48 sm:h-64 rounded-t-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-indigo-900 to-slate-800">
        {profile.banner && (<img src={profile.banner} alt="Banner" className="w-full h-full object-cover"/>)}
      </div>

      <div className="relative px-6 sm:px-10 -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-center sm:items-end gap-6 bg-slate-800/80 backdrop-blur-md border-x border-b border-slate-700/80 rounded-b-3xl pb-8 shadow-xl">
        
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-indigo-600 border-4 border-slate-800 flex items-center justify-center shadow-xl shrink-0 relative overflow-hidden">
          {profile.avatar ? (<img src={profile.avatar}  alt="Avatar" className="w-full h-full object-cover"/>) : (<span className="text-5xl sm:text-7xl font-bold text-white shadow-sm">{userInitial}</span>)}
        </div>

        <div className="flex-1 text-center sm:text-left mb-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {profile.name}
              </h1>
              <p className="text-indigo-400 font-medium text-lg mt-1 flex items-center justify-center sm:justify-start gap-2">
                <Briefcase size={18} />
                {profile.specialization || 'Спеціалізацію не вказано'}
              </p>
            </div>
            
            {isOwnProfile && (
              <Link 
                to="/settings" 
                className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl transition-all border border-slate-600 font-medium"
              >
                <Edit3 size={18} />
                Редагувати профіль
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Інформація */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ліва колонка (Про себе) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon size={24} className="text-indigo-500" />
              Про себе
            </h3>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {profile.bio || 'Користувач ще не додав інформацію про себе.'}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Code size={24} className="text-indigo-500" />
              Навички
            </h3>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Навички не вказані</p>
            )}
          </div>
        </div>

        {/* Права колонка (Контакти та Інфо) */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Деталі</h3>
            
            <div className="space-y-4">
              {profile.githubLink && (
                <a 
                  href={profile.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-indigo-500 transition-colors group"
                >
                  <Globe size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-slate-300 group-hover:text-white font-medium text-sm truncate">
                    GitHub Профіль
                  </span>
                </a>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700">
                <Calendar size={20} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">На платформі з</div>
                  <div className="text-sm text-slate-300 font-medium">
                    {new Date(profile.registrationDate).toLocaleDateString('uk-UA')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;