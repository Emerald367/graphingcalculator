import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import axios from 'axios';
import GraphComponent from './GraphComponent';
import UserSettings from './UserSettings';

const UserProfile = ({ onLogout }) => {
    const [user, setUser] = useState(null);
    const [equations, setEquations] = useState([]);
    const [newEquation, setNewEquation] = useState('');
    const [color, setColor] = useState('#ff0000');
    const [thickness, setThickness] = useState(1);
    const [selectedEquation, setSelectedEquation] = useState(null);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
      theme: '',
      grid_lines: false,
      axis_settings: { x_axis: { min: 0, max: 0}, y_axis: { min: 0, max: 0}}
    })
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

     const handleUpdateEquation = async (id) => {
        const token = localStorage.getItem('token')
        try {
            const response = await axios.put(`http://localhost:5000/graphs/equations/${id}`, {
              equation: selectedEquation.equation,
              color: selectedEquation.color,
              thickness: selectedEquation.thickness
            }, {
              headers: {Authorization: `Bearer ${token}`}
            });
            setEquations(equations.map(eq => eq.id === id ? response.data.equation : eq));
            setSelectedEquation(null);
        } catch (err) {
            setError('Error updating equation');
            console.error(err.response || err.message);
        }
     }


    const handleDeleteEquation = async (id) => {
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`http://localhost:5000/graphs/equations/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEquations(equations.filter(eq => eq.id !== id));
      } catch (err) {
          setError('Error deleting equation');
          console.error(err.response || err.message);
      }
  }

    const handleUpdateSettings = (newSettings) => {
      setSettings(newSettings);
    };

    if (error) {
        return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">{error}</div>;
    }

    return (
      <div className="flex flex-row min-h-screen bg-gray-100 p-8 space-x-8">
          <div className="flex flex-col w-4/5 space-y-8">
              <div className="bg-white p-6 rounded shadow-md w-full">
                  <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Graphing Calculator</h2>
                  <GraphComponent equations={equations} settings={settings}/>
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
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
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
                  <div className="mt-4">
                      {equations.map(eq => (
                          <div key={eq.id} className="flex items-center justify-between p-2 border-b">
                              <span>{eq.equation}</span>
                              <div className="flex items-center space-x-2">
                                  <button
                                      onClick={() => setSelectedEquation(eq)}
                                      className="text-blue-500 hover:underline"
                                  >
                                      Edit
                                  </button>
                                  <button
                                      onClick={() => handleDeleteEquation(eq.id)}
                                      className="text-red-500 hover:underline"
                                  >
                                      Delete
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                  {selectedEquation && (
                      <div className="mt-4">
                          <h3 className="text-lg font-bold text-green-600">Update Equation</h3>
                          <input
                              type="text"
                              value={selectedEquation.equation}
                              onChange={(e) => setSelectedEquation({ ...selectedEquation, equation: e.target.value })}
                              placeholder="Enter equation"
                              className="border p-2 w-full rounded mt-2"
                          />
                          <input
                              type="color"
                              value={selectedEquation.color}
                              onChange={(e) => setSelectedEquation({ ...selectedEquation, color: e.target.value })}
                              className="border p-2 w-full rounded mt-2"
                          />
                          <input
                              type="number"
                              value={selectedEquation.thickness}
                              onChange={(e) => setSelectedEquation({ ...selectedEquation, thickness: parseInt(e.target.value) })}
                              placeholder="Thickness"
                              className="border p-2 w-full rounded mt-2"
                          />
                          <button
                              onClick={() => handleUpdateEquation(selectedEquation.id)}
                              className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                          >
                              Update Equation
                          </button>
                      </div>
                  )}
                  <UserSettings onUpdateSettings={handleUpdateSettings} />
              </div>
          </div>
          <div className="bg-white p-6 rounded shadow-md w-1/5">
              <h2 className="text-2xl font-bold text-center mb-8 text-green-600">User Profile</h2>
              {user && (
                  <div className="space-y-4">
                      <p className="text-lg font-semibold text-gray-700"><strong>ID:</strong> <span className="text-gray-500">{user.id}</span></p>
                      <p className="text-lg font-semibold text-gray-700"><strong>Username:</strong> <span className="text-gray-500"> {user.username}</span></p>
                      <p className="text-lg font-semibold text-gray-700"><strong>Created At:</strong> <span className="text-gray-500"> {new Date(user.created_at).toLocaleString()}</span></p>
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