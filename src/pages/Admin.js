import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [hackathons, setHackathons] = useState([]);
  const [newHackathon, setNewHackathon] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  // Завантажити хакатони організатора
  useEffect(() => {
    if (user?.id) {
      fetch(`${apiUrl}/api/hackathons?organizerId=${user.id}`)
        .then(res => res.json())
        .then(data => setHackathons(data))
        .catch(err => console.error('Помилка завантаження хакатонів:', err));
    }
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newHackathon.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/api/hackathons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHackathon,
          description: '',
          startDate,
          endDate,
          organizerId: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('+ Хакатон створено!');
        setNewHackathon('');
        setStartDate('');
        setEndDate('');
        // Оновити список
        setHackathons(prev => [...prev, {
          _id: data._id,
          name: newHackathon,
          startDate,
          endDate
        }]);
      } else {
        alert(data.message || '- Помилка створення');
      }
    } catch (err) {
      console.error(err);
      alert('- Сервер недоступний');
    }
  };

  return (
    <div className="admin-page">
      <h2>Адмін-панель організатора</h2>

      <section className="admin-section">
        <h3>Ваші хакатони</h3>
        <ul className="hackathon-list">
          {hackathons.length > 0 ? hackathons.map((hack) => (
            <li key={hack._id}>
              {hack.name} — <span>{new Date(hack.startDate).toLocaleDateString()}</span> [🔧 Керувати]
            </li>
          )) : <li>Хакатонів ще немає</li>}
        </ul>
      </section>

      <section className="admin-section">
        <h3>Створити новий хакатон</h3>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Назва хакатону"
            value={newHackathon}
            onChange={(e) => setNewHackathon(e.target.value)}
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <button type="submit">Створити</button>
        </form>
      </section>
    </div>
  );
};

export default Admin;
