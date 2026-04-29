import React, { useEffect, useState } from 'react';
import './Submit.css';

const Submit = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [file, setFile] = useState(null);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      fetch(`http://localhost:5000/api/my-team?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data?._id) {
            setTeamId(data._id);
          }
        })
        .catch(err => console.error('Помилка завантаження команди:', err));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert('Ви не авторизовані!');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('repositoryLink', repoLink);
    formData.append('hackathonName', 'Hackathon Face');
    formData.append('userId', user.id);
    if (teamId) formData.append('teamId', teamId);
    if (file) formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('+ Проєкт з файлом подано!');
        setTitle('');
        setDescription('');
        setRepoLink('');
        setFile(null);
      } else {
        alert(data.message || '- Помилка при подачі');
      }
    } catch (err) {
      console.error('Помилка:', err);
      alert('- Сервер недоступний');
    }
  };

  return (
    <div className="submit-page">
      <h2>Подача проєкту</h2>
      <form onSubmit={handleSubmit}>
        <label>Назва проєкту:</label>
        <input
          type="text"
          placeholder="Введіть назву"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Опис:</label>
        <textarea
          placeholder="Короткий опис проєкту"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Посилання на GitHub / сайт:</label>
        <input
          type="url"
          placeholder="https://github.com/..."
          value={repoLink}
          onChange={(e) => setRepoLink(e.target.value)}
          required
        />

        <label>Прикріпити файл (опціонально):</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit">Подати проєкт</button>
      </form>
    </div>
  );
};

export default Submit;
