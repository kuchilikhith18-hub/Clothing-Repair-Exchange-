import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import BrowseRequests from './pages/BrowseRequests';
import RequestDetail from './pages/RequestDetail';
import Volunteers from './pages/Volunteers';
import Profile from './pages/Profile';
import MyMatches from './pages/MyMatches';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/requests" element={<BrowseRequests />} />
              <Route path="/requests/:id" element={<RequestDetail />} />
              <Route path="/volunteers" element={<Volunteers />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute><Dashboard /></PrivateRoute>
              } />
              <Route path="/requests/create" element={
                <PrivateRoute><CreateRequest /></PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute><Profile /></PrivateRoute>
              } />
              <Route path="/my-matches" element={
                <PrivateRoute><MyMatches /></PrivateRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

