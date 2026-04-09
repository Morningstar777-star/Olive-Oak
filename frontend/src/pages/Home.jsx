import React from 'react';
import { useNavigate } from 'react-router-dom';
import FluidBackground from '../components/FluidBackground';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <FluidBackground />

      <div className="glass-card p-10 relative overflow-hidden max-w-2xl w-full text-center">
        {/* Top Decorative bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-white/70 text-lg">
            You've successfully completed the quiz! This is your personalized homepage.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-white/50">
            Here you can explore design recommendations based on your preferences.
          </p>
          
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => navigate('/quiz')}
              className="btn-primary h-12 px-8"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;