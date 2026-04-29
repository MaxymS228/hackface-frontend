import React, { useState } from 'react';
import './Evaluation.css';

const Evaluation = () => {
  // Фейкові проєкти (пізніше прийдуть з API)
  const [projects] = useState([
    { id: 1, title: 'Smart Traffic', description: 'Розумне управління світлофорами', team: 'TechVision' },
    { id: 2, title: 'GreenBot', description: 'Екологічний бот для моніторингу повітря', team: 'EcoForce' }
  ]);

  const [evaluations, setEvaluations] = useState({});

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
    console.log('Оцінено проєкт:', projectId, evaluation);
    // TODO: Надіслати POST-запит на /api/evaluation
  };

  return (
    <div className="evaluation-page">
      <h2>Оцінювання проєктів</h2>
      {projects.map(project => (
        <div key={project.id} className="project-card">
          <h3>{project.title}</h3>
          <p><strong>Команда:</strong> {project.team}</p>
          <p>{project.description}</p>

          <label>Оцінка (1–10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={evaluations[project.id]?.score || ''}
            onChange={(e) => handleChange(project.id, 'score', e.target.value)}
          />

          <label>Коментар:</label>
          <textarea
            placeholder="Ваш відгук"
            value={evaluations[project.id]?.comment || ''}
            onChange={(e) => handleChange(project.id, 'comment', e.target.value)}
          ></textarea>

          <button onClick={() => handleSubmit(project.id)}>Оцінити</button>
        </div>
      ))}
    </div>
  );
};

export default Evaluation;
