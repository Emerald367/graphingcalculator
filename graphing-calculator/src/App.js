import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import UserCalculator from './UserCalculator';
import HomePageGraph from './HomePageGraph';
import SignUpForm from './SignUpForm';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };
   
  return (
    <Router>
      <nav className="bg-green-600 p-4">
        <ul className="flex justify-end">
          {isAuthenticated ? (
            <>
              <li className="mr-6">
                <Link to="/usercalculator" className="text-white hover:text-gray-200">UserCalculator</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-white hover:text-gray-200">Logout</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
            </li>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/login" 
               element={<LoginForm onLogin={handleLogin}/>}
         />
        <Route path="/usercalculator"
               element={isAuthenticated ? <UserCalculator onLogout={handleLogout} /> : <Navigate to="/login" />}
         />
        <Route path="/" element={<HomePageGraph />} />
      </Routes>
    </Router>
  );
}

export default App;
