import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Calendar, MapPin, Trophy, Users, ArrowRight, Code } from 'lucide-react';

const Home = () => {

  const apiUrl = process.env.REACT_APP_API_URL;
  // Тестові дані для прототипу
  const mockHackathons = [
    {
      id: 1,
      title: "AI & Web3 Innovators Hackathon",
      date: "15–17 червня 2026",
      format: "Online",
      prize: "$5,000",
      participants: 124,
      themes: ["AI", "Web3", "Blockchain"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=400"
    },
    {
      id: 2,
      title: "FinTech Future Challenge",
      date: "1–3 липня 2026",
      format: "Hybrid",
      location: "Київ, Unit.City",
      prize: "100,000 ₴",
      participants: 89,
      themes: ["FinTech", "Mobile App", "Security"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400"
    },
    {
      id: 3,
      title: "EcoTech Save The Planet",
      date: "20–22 серпня 2026",
      format: "Offline",
      location: "Львів, SoftServe HQ",
      prize: "Гаджети та Інтернатура",
      participants: 210,
      themes: ["Eco", "IoT", "Data Science"],
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=800&h=400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans">
      
      {/* Головний екран (Hero Section) */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Декоративні елементи фону */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-sm font-medium mb-8">
            <Rocket size={16} />
            <span>Платформа нового покоління</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
            Організовуй та перемагай у <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              найкращих хакатонах
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Шукай команду, подавай інноваційні проєкти, змагайся за призові фонди та отримуй визнання від провідних IT-компаній.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              Розпочати зараз <ArrowRight size={20} />
            </Link>
            <Link 
              to="/hackathons" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2"
            >
              <Code size={20} /> Знайти хакатон
            </Link>
          </div>
        </div>
      </main>

      {/* Секція актуальних хакатонів */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Актуальні хакатони</h2>
              <p className="text-slate-400">Приєднуйся до подій, які змінять твоє життя</p>
            </div>
            <Link to="/hackathons" className="hidden md:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Всі хакатони <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockHackathons.map((hackathon) => (
              <div key={hackathon.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all group flex flex-col">
                
                {/* Картинка */}
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-emerald-400 z-10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Реєстрація відкрита
                  </div>
                  <img 
                    src={hackathon.image} 
                    alt={hackathon.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Інформація */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{hackathon.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={16} className="text-indigo-400" />
                      <span>{hackathon.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin size={16} className="text-indigo-400" />
                      <span>{hackathon.format === 'Online' ? 'Онлайн' : hackathon.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Trophy size={16} className="text-yellow-500" />
                      <span className="text-slate-300 font-medium">{hackathon.prize}</span>
                    </div>
                  </div>

                  {/* Теги */}
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {hackathon.themes.map((theme, index) => (
                      <span key={index} className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                        {theme}
                      </span>
                    ))}
                  </div>

                  <div className="pt-5 border-t border-slate-800 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users size={16} />
                      <span>{hackathon.participants} учасників</span>
                    </div>
                    <Link 
                      to={`/hackathons/${hackathon.id}`}
                      className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-sm font-bold transition-all"
                    >
                      Детальніше
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Кнопка для мобілки */}
          <Link to="/hackathons" className="md:hidden mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium">
            Всі хакатони <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Футер */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Hackathon Face. Всі права захищені.</p>
      </footer>
      
    </div>
  );
};

export default Home;