import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
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
    localStorage.removeItem('token'); // Ensure token is removed on logout
  };

  const NavBar = () => {
    const location = useLocation();

    return (
      <nav className="bg-green-600 p-4">
        <ul className="flex justify-end">
          <li className="mr-6">
            <Link to="/" className="text-white hover:text-gray-200">Home</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="mr-6">
                <Link to="/usercalculator" className="text-white hover:text-gray-200">UserCalculator</Link>
              </li>
              {location.pathname === '/usercalculator' && (
                <li>
                  <button onClick={handleLogout} className="text-white hover:text-gray-200">Logout</button>
                </li>
              )}
            </>
          ) : (
            <>
              <li className="mr-6">
                <Link to="/signup" className="text-white hover:text-gray-200">Sign Up</Link>
              </li>
              <li>
                <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    );
  };

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/usercalculator" element={isAuthenticated ? <UserCalculator onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/" element={<HomePageGraph />} />
      </Routes>
    </Router>
  );
}

export default App;