import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';

function App() {
  return (
    <Router>
    <div className="App">
      <nav className="bg-green-600 p-4">
        <ul className="flex space-x-4 justify-center">
          <li>
            <Link to="/login" className="text-white">Login</Link>
          </li>
          <li>
            <Link to="/signup" className="text-white">Sign Up</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<LoginForm />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
