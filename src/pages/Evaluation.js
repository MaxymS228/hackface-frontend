import React, { useState } from 'react';
import { ClipboardCheck, Users, Star, MessageSquare, Send, CheckCircle2, AlignLeft } from 'lucide-react';

const Evaluation = () => {
  // Фейкові проєкти (пізніше прийдуть з API)
  const [projects] = useState([
    { id: 1, title: 'Smart Traffic', description: 'Система розумного управління міськими світлофорами на базі AI для зменшення заторів.', team: 'TechVision' },
    { id: 2, title: 'GreenBot', description: 'Telegram-бот для моніторингу якості повітря та радіаційного фону в реальному часі.', team: 'EcoForce' },
    { id: 3, title: 'EduVerse', description: 'Платформа для інтерактивного навчання у віртуальній реальності.', team: 'VR Innovators' }
  ]);

  const [evaluations, setEvaluations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [submittedIds, setSubmittedIds] = useState([]);

  const handleChange = (projectId, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (projectId) => {
    const evaluation = evaluations[projectId];
    
    // Перевірка, чи введена оцінка
    if (!evaluation?.score || evaluation.score < 1 || evaluation.score > 10) {
      alert('Будь ласка, введіть оцінку від 1 до 10');
      return;
    }

    // Симуляція відправки на сервер
    setIsSubmitting(prev => ({ ...prev, [projectId]: true }));
    
    setTimeout(() => {
      console.log('Оцінено проєкт:', projectId, evaluation);
      // TODO: Надіслати POST-запит на /api/evaluation
      
      setIsSubmitting(prev => ({ ...prev, [projectId]: false }));
      setSubmittedIds(prev => [...prev, projectId]); // Відмічаємо як оцінений
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Заголовок */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4">
            <ClipboardCheck size={36} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Оцінювання проєктів</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Ознайомтеся з рішеннями команд та виставте свої оцінки. Ваша експертиза допоможе визначити переможців хакатону.
          </p>
        </div>

        {/* Список проєктів */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {projects.map(project => {
            const isSubmitted = submittedIds.includes(project.id);
            const isLoading = isSubmitting[project.id];

            return (
              <div 
                key={project.id} 
                className={`bg-slate-900 border rounded-2xl p-6 md:p-8 flex flex-col relative transition-all duration-300 shadow-xl overflow-hidden
                  ${isSubmitted ? 'border-emerald-500/30 shadow-emerald-900/10' : 'border-slate-800'}`}
              >
                {/* Декоративна лінія зверху */}
                <div className={`absolute top-0 left-0 w-full h-1 ${isSubmitted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'}`}></div>

                {/* Блок інформації про проєкт */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                    {isSubmitted && (
                      <span className="bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                        <CheckCircle2 size={14} /> Оцінено
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-indigo-400 font-medium mb-4">
                    <Users size={18} />
                    <span>{project.team}</span>
                  </div>
                  
                  <p className="text-slate-400 leading-relaxed flex gap-3 items-start">
                    <AlignLeft size={20} className="text-slate-600 shrink-0 mt-1" />
                    <span>{project.description}</span>
                  </p>
                </div>

                {/* Форма оцінювання */}
                <div className="space-y-5 flex-1 flex flex-col">
                  {/* Оцінка */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Оцінка (від 1 до 10)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Star size={18} className={isSubmitted ? "text-emerald-500" : "text-yellow-500"} />
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Наприклад: 8"
                        disabled={isSubmitted}
                        value={evaluations[project.id]?.score || ''}
                        onChange={(e) => handleChange(project.id, 'score', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Коментар */}
                  <div className="mb-auto">
                    <label className="block text-sm font-semibold text-slate-400 mb-2">Коментар (опціонально)</label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-4 pointer-events-none">
                        <MessageSquare size={18} className="text-slate-500" />
                      </div>
                      <textarea
                        placeholder="Напишіть ваш фідбек для команди..."
                        rows="3"
                        disabled={isSubmitted}
                        value={evaluations[project.id]?.comment || ''}
                        onChange={(e) => handleChange(project.id, 'comment', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Кнопка відправки */}
                  {!isSubmitted ? (
                    <button 
                      onClick={() => handleSubmit(project.id)}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Збереження...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Зберегти оцінку
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-3.5 bg-emerald-500/10 text-emerald-400 font-bold rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2 mt-4">
                      <CheckCircle2 size={18} /> Оцінку враховано
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Evaluation;

// import React, { useState } from 'react';
// import './Evaluation.css';

// const Evaluation = () => {
//   // Фейкові проєкти (пізніше прийдуть з API)
//   const [projects] = useState([
//     { id: 1, title: 'Smart Traffic', description: 'Розумне управління світлофорами', team: 'TechVision' },
//     { id: 2, title: 'GreenBot', description: 'Екологічний бот для моніторингу повітря', team: 'EcoForce' }
//   ]);

//   const [evaluations, setEvaluations] = useState({});

//   const handleChange = (projectId, field, value) => {
//     setEvaluations(prev => ({
//       ...prev,
//       [projectId]: {
//         ...prev[projectId],
//         [field]: value
//       }
//     }));
//   };

//   const handleSubmit = (projectId) => {
//     const evaluation = evaluations[projectId];
//     console.log('Оцінено проєкт:', projectId, evaluation);
//     // TODO: Надіслати POST-запит на /api/evaluation
//   };

//   return (
//     <div className="evaluation-page">
//       <h2>Оцінювання проєктів</h2>
//       {projects.map(project => (
//         <div key={project.id} className="project-card">
//           <h3>{project.title}</h3>
//           <p><strong>Команда:</strong> {project.team}</p>
//           <p>{project.description}</p>

//           <label>Оцінка (1–10):</label>
//           <input
//             type="number"
//             min="1"
//             max="10"
//             value={evaluations[project.id]?.score || ''}
//             onChange={(e) => handleChange(project.id, 'score', e.target.value)}
//           />

//           <label>Коментар:</label>
//           <textarea
//             placeholder="Ваш відгук"
//             value={evaluations[project.id]?.comment || ''}
//             onChange={(e) => handleChange(project.id, 'comment', e.target.value)}
//           ></textarea>

//           <button onClick={() => handleSubmit(project.id)}>Оцінити</button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Evaluation;
