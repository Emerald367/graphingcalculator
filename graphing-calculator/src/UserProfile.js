import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import axios from 'axios';
import GraphComponent from './GraphComponent';
import { evaluate, parse } from 'mathjs';

const UserProfile = ({ onLogout }) => {
    const [user, setUser] = useState(null);
    const [equations, setEquations] = useState([]);
    const [newEquation, setNewEquation] = useState('');
    const [color, setColor] = useState('#ff0000');
    const [thickness, setThickness] = useState(1);
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

    const handleAddEquation = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post('http://localhost:5000/graphs/equations', {
          equation: newEquation,
          color,
          thickness
        }, {
          headers: {Authorization: `Bearer ${token}`}
        });
        setEquations([...equations, response.data.equation]);
        setNewEquation('');
        setColor('#ff0000');
        setThickness(1);
      } catch (err) {
        setError('Error adding equation');
        console.error(err.response || err.message);
      }
    }

     const generateData = (equation) => {
       const data = [];
       try {
           const node = parse(equation);
           const compiled = node.compile();
           for (let x = -10; x <= 10; x += 0.1) {
                const scope = { x };
                const y = compiled.evaluate(scope);
                data.push({ x, y });
           } 
       } catch (error) {
           console.error('Invalid equation:', error);
       }
       return data;
     }

     const graphData = {
         datasets: equations.map(eq => ({
             label: eq.equation,
             data: generateData(eq.equation),
             borderColor: eq.color,
             borderWidth: eq.thickness,
             fill: false
         }))
     }

    if (error) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">{error}</div>;
    }

    return (
        <div className="flex flex-row items-start justify-center min-h-screen bg-gray-100 p-8 space-x-8">
            <div className="bg-white p-6 rounded shadow-md w-4/5">
                <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Graphing Calculator</h2>
                <GraphComponent equations={equations} />
                <div className="mt-4 flex flex-col space-y-2">
                    <input 
                        type="text"
                        value={newEquation}
                        onChange={(e) => setNewEquation(e.target.value)}
                        placeholder="Enter equation"
                        className="border p-2 w-full rounded"
                     />
                    <input
                        type="color"
                        value={newEquation}
                        onChange={(e) => setNewEquation(e.target.value)}
                        placeholder="Enter equation"
                        className="border p-2 w-full rounded"
                    />
                    <input
                        type="number"
                        value={thickness}
                        onChange={(e) => setThickness(parseInt(e.target.value))}
                        placeholder="Thickness"
                        className="border p-2 w-full rounded"
                    />
                    <button onClick={handleAddEquation} className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                        Add Equation
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 rounded shadow-md w-1/5">
              <h2 className="text-2xl font-bold text-center mb-8 text-green-600">User Profile</h2>
              {user && (
                <div className="space-y-4">
                   <p className="text-lg font-semibold text-gray-700"><strong>ID:</strong><span className="text-gray-500">{user.id}</span></p>
                   <p className="text-lg font-semibold text-gray-700"><strong>Username:</strong><span className="text-gray-500"> {user.username}</span></p>
                   <p className="text-lg font-semibold text-gray-700"><strong>Created At:</strong><span className="text-gray-500"> {new Date(user.created_at).toLocaleString()}</span></p>
                </div>
              )}
              {error && <div className="mb-4 text-red-500">{error}</div>}
              <div className="mt-4 flex flex-col space-y-2">
                  <button 
                      onClick={handleLogout}
                      className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                      Logout
                  </button>
                  <button onClick={() => navigate('/settings')}
                      className="bg-green-500 text-white w-full py-2 rounded flex items-center justify-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <FaCog className="mr-2" /> Settings
                  </button>
                  <button onClick={() => navigate('/graphs')}
                      className="bg-green-500 text-white w-full py-2 rounded flex items-center justify-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <FaCog className="mr-2" /> Graphs
                      </button>
              </div>
            </div>
        </div>
    );
};

export default UserProfile;