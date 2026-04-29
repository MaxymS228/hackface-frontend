import React from 'react';
import './LogoutButton.css';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Вийти
    </button>
  );
};

export default LogoutButton;
