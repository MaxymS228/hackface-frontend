import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, Users, Mail, Code2, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded._id;
    } catch {
      return null;
    }
  };

  const userId = getUserId();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 text-slate-400">

      {/* Основний контент */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Колонка 1 — Бренд */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl">Hackathon Face</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Платформа для організації та участі у хакатонах. Об'єднуємо розробників, дизайнерів та підприємців.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Globe size={18} />, href: '#', label: 'GitHub' },
                { icon: <Share2 size={18} />, href: '#', label: 'Twitter' },
                { icon: <Users size={18} />, href: '#', label: 'LinkedIn' },
                { icon: <Mail size={18} />, href: '#', label: 'Email' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-500 hover:text-white transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Колонка 2 — Платформа */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Платформа</h4>
            <ul className="space-y-3">
              {[
                { label: 'Всі хакатони', to: '/hackathons' },
                { label: 'Мої хакатони', to: '/my-hackathons' },
                { label: 'Створити хакатон', to: '/create-hackathon' },
                { label: 'Дашборд', to: '/dashboard' },
                userId ? { label: 'Профіль', to: `/profile/${userId}` } : { label: 'Увійти', to: '/login' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 3 — Компанія */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Компанія</h4>
            <ul className="space-y-3">
              {[
                { label: 'Про нас', to: '/about' },
                { label: 'Блог', to: '/blog' },
                { label: "Кар'єра", to: '/careers' },
                { label: 'Партнерство', to: '/partners' },
                { label: 'Контакти', to: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 4 — Підписка */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Будь в курсі</h4>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Отримуй сповіщення про нові хакатони та важливі оновлення платформи.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Підписатись
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              Без спаму. Відписатись можна будь-коли.
            </p>
          </div>
        </div>
      </div>

      {/* Розділювач */}
      <div className="border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {currentYear} Hackathon Face. Всі права захищені.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            Зроблено з <Heart size={12} className="text-rose-500 mx-1" /> в Україні
          </div>
          <div className="flex gap-6">
            {[
              { label: 'Конфіденційність', to: '/privacy' },
              { label: 'Умови використання', to: '/terms' },
              { label: 'Cookie', to: '/cookies' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;