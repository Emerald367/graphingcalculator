import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/login', {
                username, 
                password,
            });
        const { token } = response.data;
        localStorage.setItem('token', token);
        setSuccess('Login successful');
        setError('');
        onLogin();
        } catch (error) {
            setError('Login failed. Please check your username and password.');
            console.error(error.response || error.message);
        }
    };

   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-2xl font-bold text-center mb-8 text-green-600">Login</h2>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            {success && <div className="mb-4 text-green-500">{success}</div>}
                <div className="mb-4">
                    <label className="block text-gray-700">Username</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                     />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input 
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                     />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                 >
                    Login
                 </button>
            </form>
        </div>
   );
};

export default LoginForm;