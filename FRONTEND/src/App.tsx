import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login.tsx';
import Rating from './pages/Rating.tsx';
import { useState, useEffect } from 'react';

function App() {
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem('token')));

  // Sync state with localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
  }, []);

  // PrivateRoute for protected routes
  const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Redirect to Rating if logged in, otherwise show LoginPage */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/rating" /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        
        {/* Protected Route */}
        <Route path="/rating" element={<PrivateRoute><Rating /></PrivateRoute>} />
        
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to={isLoggedIn ? '/rating' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
