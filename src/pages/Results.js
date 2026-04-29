import React, { useState } from 'react';
import './Results.css';

const Results = () => {
  // Фейкові результати (пізніше — з API)
  const [results] = useState([
    { team: 'TechVision', project: 'Smart Traffic', score: 9.2 },
    { team: 'EcoForce', project: 'GreenBot', score: 8.7 },
    { team: 'CodeSquad', project: 'EduTool', score: 8.4 },
  ]);

  const userHasCertificate = true; // Пізніше: буде перевірка з бекенду

  return (
    <div className="results-page">
      <h2>Результати хакатону</h2>

      <table className="results-table">
        <thead>
          <tr>
            <th>Місце</th>
            <th>Команда</th>
            <th>Проєкт</th>
            <th>Середній бал</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{res.team}</td>
              <td>{res.project}</td>
              <td>{res.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {userHasCertificate && (
        <div className="certificate-section">
          <h3>Ваш сертифікат</h3>
          <a href="/certificates/certificate-example.pdf" download className="download-btn">
            Завантажити сертифікат
          </a>
        </div>
      )}
    </div>
  );
};

export default Results;
