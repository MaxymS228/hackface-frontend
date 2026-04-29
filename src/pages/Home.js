import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      {/* <header className="home-header">
        <h1>Hackathon Face</h1>
        <nav className="nav-links">
          <Link to="/">Головна</Link>
          <Link to="/login">Увійти</Link>
          <Link to="/register">Зареєструватися</Link>
        </nav>
      </header> */}

      <main className="home-main">
        <section className="hero">
          <h2>Онлайн-платформа для організації хакатонів</h2>
          <p>Подавайся, формуй команду, подавай проєкти, отримуй сертифікат!</p>
          <Link className="btn" to="/register">Розпочати</Link>
        </section>

        <section className="hackathons">
          <h3>Актуальні хакатони</h3>
          <div className="hackathon-list">
            <div className="hack-card">
              <h4>AI Hackathon</h4>
              <p>15–17 червня 2025</p>
              <Link to="/hackathon/1">Детальніше</Link>
            </div>
            <div className="hack-card">
              <h4>Web Dev Challenge</h4>
              <p>1–3 липня 2025</p>
              <Link to="/hackathon/2">Детальніше</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 Hackathon Face</p>
      </footer>
    </div>
  );
};

export default Home;
