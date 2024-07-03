import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginForm from './LoginForm';
import UserProfile from './UserProfile';
import UserSettings from './UserSettings';

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
                <Link to="/profile" className="text-white hover:text-gray-200">Profile</Link>
              </li>
              <li className="mr-6">
                <Link to="/settings" className="text-white hover:text-gray-200">Settings</Link>
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
               element={isAuthenticated ? <Navigate to="/profile" /> : <LoginForm onLogin={handleLogin}/>}
         />
        <Route path="/profile"
               element={isAuthenticated ? <UserProfile onLogout={handleLogout} /> : <Navigate to="/login" />}
         />
        <Route path="/settings" element={isAuthenticated ? <UserSettings /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
