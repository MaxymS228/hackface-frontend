import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const OrganizerProtectedRoute = ({ children }) => {
  const { id } = useParams(); 
  const [hasAccess, setHasAccess] = useState(null); 
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setHasAccess(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/hackathons/${id}/my-role`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Пускаємо тільки організаторів та співорганізаторів
          if (data.role === 'Organizer' || data.role === 'Co-organizer') {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Помилка перевірки доступу", error);
        setHasAccess(false);
      }
    };

    verifyAccess();
  }, [id, apiUrl]);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen bg-[#020617] flex justify-center items-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  if (hasAccess === true) {
    return children;
  }

  return <Navigate to={`/hackathons/${id}`} replace />;
};

export default OrganizerProtectedRoute;