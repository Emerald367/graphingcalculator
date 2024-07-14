import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserSettings = ({ onLogout, onUpdateSettings }) => {
    const [settings, setSettings] = useState({
        theme: '',
        grid_lines: false,
        axis_settings: {x_axis: { min: 0, max: 0}, y_axis: { min: 0, max: 0}}
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/users/settings', {
                    headers: { Authorization: `Bearer ${token}`}
                });
                setSettings(response.data.settings);
                onUpdateSettings(response.data.settings);
            } catch (err) {
                setError('Error fetching settings');
                console.error(err);
            }
        };

        fetchSettings();
    }, [onUpdateSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedSettings = {
            ...settings, 
            [name]: type === 'checkbox' ? checked : value
        };
        setSettings(updatedSettings);
        onUpdateSettings(updatedSettings);
    };

    const handleAxisChange = (e, axis) => {
        const {name, value} = e.target;
        const updatedSettings = {
            ...settings,
            axis_settings: {
                ...settings.axis_settings,
                [axis]: {
                    ...settings.axis_settings[axis],
                    [name]: parseInt(value, 10)
                }
            }
        }
        setSettings(updatedSettings);
        onUpdateSettings(updatedSettings);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://localhost:5000/users/settings', settings, {
                headers: { Authorization: `Bearer ${token}`}
            })
            alert('Settings updated successfully');
        } catch (err) {
            setError('Error updating settings');
            console.error(err);
        }
    }


    return (
        <div className="settings-container bg-white p-8 rounded-lg shadow-lg mt-10 w-full">
            <h2 className="text-2xl font-bold text-green-600 mb-6">User Settings</h2>
            {error && <p className="error text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700">Theme:</label>
                    <select name="theme" value={settings.theme} onChange={handleChange}
                     className="p-2 border border-gray-300 rounded mt-2 w-full">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <label className="block text-gray-700">Show Grid Lines:</label>
                    <input
                      type="checkbox"
                      name="grid_lines"
                      checked={settings.grid_lines}
                      onChange={handleChange}
                      className="mt-2"
                    />
                </div>
                <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-green-600 mt-4">Axis Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700">X-Axis Min:</label>
                        <input
                          type="number"
                          name="min"
                          value={settings.axis_settings.x_axis.min}
                          onChange={(e) => handleAxisChange(e, 'x_axis')}
                          className="p-2 border border-gray-300 rounded mt-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">X-Axis Max:</label>
                        <input
                          type="number"
                          name="max"
                          value={settings.axis_settings.x_axis.max}
                          onChange={(e) => handleAxisChange(e, 'x_axis')}
                          className="p-2 border border-gray-300 rounded mt-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Y-Axis Min:</label>
                        <input
                          type="number"
                          name="min"
                          value={settings.axis_settings.y_axis.min}
                          onChange={(e) => handleAxisChange(e, 'y_axis')}
                          className="p-2 border border-gray-300 rounded mt-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Y-Axis Max:</label>
                        <input
                          type="number"
                          name="max"
                          value={settings.axis_settings.y_axis.max}
                          onChange={(e) => handleAxisChange(e, 'y_axis')}
                          className="p-2 border border-gray-300 rounded mt-2 w-full"
                         />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="bg-green-600 text-white p-2 rounded hover:bg-green-700 col-span-2"
                >
                 Save Settings
                 </button>
            </form>
            <button onClick={onLogout} className="w-full bg-red-600 text-white p-2 rounded mt-4 hover:bg-red-700">Logout</button>
        </div>
    );
};

export default UserSettings;