import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = ({ onLogout }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              setError('No token found');
              navigate('/login');
              return;
            }
            const response = await axios.get('http://localhost:5000/users', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setUser(response.data.user);
          } catch (err) {
            setError('Error fetching user data');
            console.error(err.response || err.message);
            navigate('/login');
          }
        };
    
        fetchUser();
      }, [navigate]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
              setError('No token found');
              return;
            }
            await axios.post('http://localhost:5000/logout', {}, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            localStorage.removeItem('token');
            onLogout();
            navigate('/login');
        } catch (err) {
            setError('Error logging out');
            console.error(err.response || err.message);
        }
    };

    if (error) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl font-bold text-center mb-8 text-green-600">User Profile</h2>
                {user && (
                <div>
                   <p className="text-lg"><strong>ID:</strong> {user.id}</p>
                   <p className="text-lg"><strong>Username:</strong> {user.username}</p>
                   <p className="text-lg"><strong>Created At:</strong> {user.created_at}</p>
                </div>
               )}
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
             >
                Logout
             </button>
            </div>
        </div>
    );
};

export default UserProfile;