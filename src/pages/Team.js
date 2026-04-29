import React, { useState, useEffect } from 'react';
import './Team.css';

const Team = () => {
  const [teamName, setTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const [teamCreated, setTeamCreated] = useState(false);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [team, setTeam] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  // Завантажити доступні хакатони
  useEffect(() => {
    fetch('http://localhost:5000/api/hackathons')
      .then(res => res.json())
      .then(data => setHackathons(data))
      .catch(err => console.error('Помилка отримання хакатонів:', err));
  }, []);

  // + Створити команду
  const handleCreateTeam = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          hackathonId: selectedHackathon,
          userId: user.id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('+ Команду створено!');
        setTeamCreated(true);
        setTeam(data.team);
      } else {
        alert(data.message || 'Помилка створення команди');
      }
    } catch (err) {
      console.error(err);
      alert('Сервер недоступний');
    }
  };

  // + Приєднатись до команди
  const handleJoinTeam = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: joinTeamId,
          userId: user.id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Ви приєдналися до команди!');
        setTeamCreated(true);
        setTeam({ _id: joinTeamId, name: 'Ваша команда', members: [user.name] });
      } else {
        alert(data.message || 'Не вдалося приєднатися');
      }
    } catch (err) {
      console.error(err);
      alert('Сервер недоступний');
    }
  };

  return (
    <div className="team-page">
      <h2>Командна робота</h2>

      {!teamCreated ? (
        <div className="team-forms">
          <div className="form-block">
            <h3>Створити команду</h3>
            <form onSubmit={handleCreateTeam}>
              <input
                type="text"
                placeholder="Назва команди"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <select
                value={selectedHackathon}
                onChange={(e) => setSelectedHackathon(e.target.value)}
                required
              >
                <option value="">Оберіть хакатон</option>
                {hackathons.map((hack) => (
                  <option key={hack._id} value={hack._id}>
                    {hack.name}
                  </option>
                ))}
              </select>
              <button type="submit">Створити</button>
            </form>
          </div>

          <div className="form-block">
            <h3>Приєднатися до команди</h3>
            <form onSubmit={handleJoinTeam}>
              <input
                type="text"
                placeholder="ID команди (вручну)"
                value={joinTeamId}
                onChange={(e) => setJoinTeamId(e.target.value)}
                required
              />
              <button type="submit">Приєднатися</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="team-info">
          <h3>Ваша команда: {team?.name}</h3>
          <p>Team ID: <strong>{team?._id}</strong></p>
          <h4>Учасники:</h4>
          <ul>
            {team?.members?.map((member, idx) => (
              <li key={idx}>{member.name || user.name}</li>
            )) || <li>Ви</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Team;
