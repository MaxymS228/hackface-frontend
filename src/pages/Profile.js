// import React, { useState, useRef } from 'react';
// import { Camera, Mail, User as UserIcon, Shield, Loader2 } from 'lucide-react';

// const Profile = ({ user, setUser }) => {
//   // Локальні стани для UI
//   const [isUploading, setIsUploading] = useState(false);
  
//   // Якщо в юзера ще немає заставки, показуємо дефолтний градієнт або картинку
//   const [banner, setBanner] = useState(
//     user?.banner || 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop'
//   );

//   // Реф для прихованого інпуту файлів
//   const fileInputRef = useRef(null);

//   // Отримуємо першу літеру імені для аватарки
//   const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

//   const handleBannerClick = () => {
//     fileInputRef.current.click(); // Відкриваємо вікно вибору файлу
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsUploading(true);

//     try {
//       /* ТУТ БУДЕ РЕАЛЬНИЙ ЗАПИТ НА БЕКЕНД:
//         const formData = new FormData();
//         formData.append('banner', file);
        
//         const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/banner`, {
//           method: 'POST',
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//           body: formData
//         });
//         const data = await response.json();
//         const newBannerUrl = data.bannerUrl; // URL збереженої картинки
//       */

//       // Тимчасове рішення для візуалу (поки немає бекенду для збереження файлів)
//       const localImageUrl = URL.createObjectURL(file);
//       setBanner(localImageUrl);

//       // Оновлюємо глобальний стан юзера, щоб заставка змінилася всюди
//       const updatedUser = { ...user, banner: localImageUrl };
//       setUser(updatedUser);
//       localStorage.setItem('user', JSON.stringify(updatedUser));

//     } catch (error) {
//       console.error('Помилка завантаження:', error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
//       {/* Секція Заставки (Banner) */}
//       <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 group">
//         <img 
//           src={banner} 
//           alt="Profile Banner" 
//           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//         />
        
//         {/* Оверлей та кнопка зміни заставки */}
//         <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//           <button 
//             onClick={handleBannerClick}
//             disabled={isUploading}
//             className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-white px-5 py-3 rounded-xl backdrop-blur-md border border-slate-600 transition-all font-medium"
//           >
//             {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
//             {isUploading ? 'Завантаження...' : 'Змінити заставку'}
//           </button>
          
//           <input 
//             type="file" 
//             ref={fileInputRef} 
//             onChange={handleFileChange} 
//             accept="image/*" 
//             className="hidden" 
//           />
//         </div>
//       </div>

//       {/* Секція Інформації (зсунута вгору на заставку) */}
//       <div className="relative px-6 sm:px-12 -mt-16 sm:-mt-24 flex flex-col sm:flex-row items-center sm:items-end gap-6">
        
//         {/* Аватар */}
//         <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-indigo-600 border-4 border-slate-900 flex items-center justify-center shadow-xl shrink-0 relative overflow-hidden group cursor-pointer">
//           <span className="text-5xl sm:text-7xl font-bold text-white shadow-sm">{userInitial}</span>
//           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//             <Camera size={28} className="text-white" />
//           </div>
//         </div>

//         {/* Коротке інфо */}
//         <div className="flex-1 text-center sm:text-left mb-2">
//           <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
//             {user?.name || 'Ім\'я Користувача'}
//           </h1>
//           <p className="text-indigo-400 font-medium text-lg mt-1">
//             Учасник платформи
//           </p>
//         </div>
//       </div>

//       {/* Картки з детальними даними */}
//       <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
//         {/* Картка контактів */}
//         <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 shadow-lg">
//           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
//             <UserIcon size={24} className="text-indigo-500" />
//             Особисті дані
//           </h3>
          
//           <div className="space-y-5">
//             <div>
//               <label className="text-sm font-semibold text-slate-400">Повне ім'я</label>
//               <div className="text-lg text-slate-200 mt-1">{user?.name}</div>
//             </div>
//             <div>
//               <label className="text-sm font-semibold text-slate-400">Електронна пошта</label>
//               <div className="text-lg text-slate-200 mt-1 flex items-center gap-2">
//                 <Mail size={18} className="text-slate-500" />
//                 {user?.email}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Картка безпеки / статусу */}
//         <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 shadow-lg">
//           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
//             <Shield size={24} className="text-indigo-500" />
//             Статус акаунту
//           </h3>
          
//           <div className="space-y-5">
//             <div>
//               <label className="text-sm font-semibold text-slate-400">Статус верифікації</label>
//               <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-medium">
//                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
//                 {user?.status === 'Active' ? 'Акаунт активний' : 'Очікує підтвердження'}
//               </div>
//             </div>
//             <div>
//               <label className="text-sm font-semibold text-slate-400">Тип авторизації</label>
//               <div className="text-lg text-slate-200 mt-1">
//                  {/* Тут можна виводити тип, якщо ти зберігаєш, що вхід був через Google */}
//                  Стандартна / Google OAuth
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Profile;