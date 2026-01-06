import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddWorkout from './pages/AddWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import NewTemplate from './pages/NewTemplate';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
        }
      />
      <Route
        path="/"
        element={
          token ? (
            <Dashboard token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/add-workout"
        element={
          token ? (
            <AddWorkout token={token} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/workout/:id"
        element={
          token ? (
            <WorkoutDetail token={token} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/new-template"
        element={
          token ? (
            <NewTemplate token={token} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
