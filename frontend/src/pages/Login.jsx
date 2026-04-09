import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import FluidBackground from '../components/FluidBackground';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });
  const [panelFx, setPanelFx] = useState({
    rotateX: 0,
    rotateY: 0,
    glowX: 50,
    glowY: 50
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', {
        identifier: formData.identifier,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Fetch full user data to check preferences
      try {
        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });
        const userData = userResponse.data.user;
        
        // Check if user has completed quiz (all preferences set)
        const hasCompletedQuiz = userData.aesthetic_style && userData.mood_feel && userData.budget;
        
        toast.success(`Welcome back, ${response.data.user.username}!`, {
          icon: '🚀',
          duration: 4000,
          style: {
            borderRadius: '15px',
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        });
        
        // Navigate based on quiz completion
        if (hasCompletedQuiz) {
          navigate('/home');
        } else {
          navigate('/quiz');
        }
      } catch (error) {
        // If fetching user data fails, default to quiz
        navigate('/quiz');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unauthorized access', {
        duration: 4000,
        style: {
          borderRadius: '15px',
          background: '#450a0a',
          color: '#fca5a5',
          border: '1px solid #7f1d1d'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePanelMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setPanelFx({
      rotateX: -y * 6,
      rotateY: x * 6,
      glowX: ((e.clientX - rect.left) / rect.width) * 100,
      glowY: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  const handlePanelMouseLeave = () => {
    setPanelFx({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative">
      <FluidBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[880px]"
      >
        <div className="glass-card login-card glass-landscape relative overflow-hidden">
          {/* Top Decorative bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>

          <motion.div
            className="hidden md:flex panel-left px-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, rotateX: panelFx.rotateX, rotateY: panelFx.rotateY }}
            transition={{ duration: 0.6, ease: 'easeOut', type: 'spring', stiffness: 110, damping: 16 }}
            whileHover={{ scale: 1.015 }}
            onMouseMove={handlePanelMouseMove}
            onMouseLeave={handlePanelMouseLeave}
            style={{
              transformStyle: 'preserve-3d',
              '--glow-x': `${panelFx.glowX}%`,
              '--glow-y': `${panelFx.glowY}%`
            }}
          >
            <div className="panel-left-grid" />
            <span className="panel-left-pulse panel-left-pulse-1" />
            <span className="panel-left-pulse panel-left-pulse-2" />
            <div className="panel-left-content">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="inline-block p-4 rounded-3xl icon-circle mb-6"
              >
                <Lock className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 text-center">
                Welcome Back
              </h1>
              <p className="text-white/85 text-sm font-medium text-center">Please enter your credentials to continue</p>
            </div>
          </motion.div>

          <div className="panel-right px-1 md:px-4">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest ml-1 label-strong">Identifier</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  required
                  placeholder="Username or email"
                  value={formData.identifier}
                  onChange={handleChange}
                  className="w-full h-14 rounded-2xl pl-12 pr-4 input-glow font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest ml-1 label-strong">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-14 rounded-2xl pl-12 pr-14 input-glow font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/20 hover:text-white transition-all overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={showPassword ? "open" : "closed"}
                    variants={{
                      open: { rotate: 0 },
                      closed: { rotate: 180 }
                    }}
                    className="relative"
                  >
                    {showPassword ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
                  </motion.div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${formData.rememberMe ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}`}>
                  {formData.rememberMe && (
                    <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-600 transition-colors">Stay active</span>
              </label>
              <Link to="/forgot-password" title="Recover Access" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Recovery?</Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-14 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
            </form>

            <div className="relative my-6 md:my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-tighter">
              <span className="divider-label">Or connect with</span>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
            <motion.button 
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              className="social-btn group cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Google</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.95 }}
              className="social-btn group cursor-pointer"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.841 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span>GitHub</span>
            </motion.button>
            </div>

            <p className="mt-5 text-center md:text-left text-white/50 font-medium">
              New here?{' '}
              <Link to="/register" className="text-white hover:text-primary transition-colors font-bold underline decoration-primary/30 underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
