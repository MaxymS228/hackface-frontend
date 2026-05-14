import React, { useState } from 'react';
import { Trophy, Medal, Award, DownloadCloud, Star } from 'lucide-react';

const Results = () => {
  // Фейкові результати (пізніше — з API)
  // Відсортовані за спаданням балу для зручності
  const [results] = useState([
    { team: 'TechVision', project: 'Smart Traffic', score: 9.8 },
    { team: 'EcoForce', project: 'GreenBot', score: 9.2 },
    { team: 'CodeSquad', project: 'EduTool', score: 8.7 },
    { team: 'Innovators', project: 'AI Assistant', score: 7.9 },
    { team: 'CyberDefenders', project: 'SecureNet', score: 7.5 },
  ]);

  const userHasCertificate = true; // Пізніше: буде перевірка з бекенду

  // Функція для визначення іконки/кольору місця
  const getPlaceBadge = (index) => {
    switch (index) {
      case 0:
        return <div className="flex items-center gap-1 text-yellow-400 font-bold"><Medal size={20} /> 1</div>;
      case 1:
        return <div className="flex items-center gap-1 text-slate-300 font-bold"><Medal size={20} /> 2</div>;
      case 2:
        return <div className="flex items-center gap-1 text-amber-600 font-bold"><Medal size={20} /> 3</div>;
      default:
        return <div className="text-slate-500 font-medium px-2">{index + 1}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Заголовок */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 mb-4">
            <Trophy size={36} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Результати хакатону</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Змагання завершено! Дякуємо всім командам за участь. Ознайомтеся з фінальними оцінками журі та рейтингом проєктів.
          </p>
        </div>

        {/* Секція сертифікату (якщо є) */}
        {userHasCertificate && (
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-900/10 relative overflow-hidden">
            {/* Декоративний елемент фону */}
            <div className="absolute -right-10 -top-10 text-indigo-500/10 pointer-events-none">
              <Award size={150} />
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Award size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ваш сертифікат учасника</h3>
                <p className="text-indigo-200/70 text-sm">
                  Ви успішно завершили хакатон. Ваш сертифікат згенеровано та готовий до завантаження.
                </p>
              </div>
            </div>

            <a 
              href="/certificates/certificate-example.pdf" 
              download 
              className="w-full md:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 relative z-10 whitespace-nowrap"
            >
              <DownloadCloud size={20} />
              Завантажити PDF
            </a>
          </div>
        )}

        {/* Таблиця результатів */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="text-indigo-400" size={20} />
              Фінальна таблиця лідерів
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold w-24">Місце</th>
                  <th className="px-6 py-4 font-semibold">Команда</th>
                  <th className="px-6 py-4 font-semibold">Проєкт</th>
                  <th className="px-6 py-4 font-semibold text-right">Середній бал</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {results.map((res, index) => {
                  const isTop3 = index < 3;
                  
                  return (
                    <tr 
                      key={index} 
                      className={`group transition-colors hover:bg-slate-800/30 ${isTop3 ? 'bg-slate-800/10' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlaceBadge(index)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          {res.team}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {res.project}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg group-hover:border-indigo-500/50 transition-colors">
                          <span className="font-bold text-white">{res.score}</span>
                          <span className="text-slate-500 text-sm">/ 10</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Футер таблиці */}
          <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center md:text-left text-sm text-slate-500">
            Показано {results.length} найкращих результатів
          </div>
        </div>

      </div>
    </div>
  );
};

export default Results;


// import React, { useState } from 'react';
// import './Results.css';

// const Results = () => {
//   // Фейкові результати (пізніше — з API)
//   const [results] = useState([
//     { team: 'TechVision', project: 'Smart Traffic', score: 9.2 },
//     { team: 'EcoForce', project: 'GreenBot', score: 8.7 },
//     { team: 'CodeSquad', project: 'EduTool', score: 8.4 },
//   ]);

//   const userHasCertificate = true; // Пізніше: буде перевірка з бекенду

//   return (
//     <div className="results-page">
//       <h2>Результати хакатону</h2>

//       <table className="results-table">
//         <thead>
//           <tr>
//             <th>Місце</th>
//             <th>Команда</th>
//             <th>Проєкт</th>
//             <th>Середній бал</th>
//           </tr>
//         </thead>
//         <tbody>
//           {results.map((res, index) => (
//             <tr key={index}>
//               <td>{index + 1}</td>
//               <td>{res.team}</td>
//               <td>{res.project}</td>
//               <td>{res.score}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {userHasCertificate && (
//         <div className="certificate-section">
//           <h3>Ваш сертифікат</h3>
//           <a href="/certificates/certificate-example.pdf" download className="download-btn">
//             Завантажити сертифікат
//           </a>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Results;
