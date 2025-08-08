import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert } from './ui/alert';
import { User, Shield, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const { login, API } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred');
      }

      if (isLogin) {
        login(data.user, data.access_token);
      } else {
        // After successful registration, automatically log them in
        const loginResponse = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          login(loginData.user, loginData.access_token);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData({
      ...formData,
      role: role
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_vaaltic-crm/artifacts/nqh6u21d_backgroundcrm.jpeg')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl mb-4 shadow-2xl">
              <span className="text-3xl font-bold text-white">V</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              VAALTIC
            </h1>
            <p className="text-cyan-200 text-lg font-medium">
              Customer Relationship Management System
            </p>
          </div>

          {/* Login Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <div className="p-8">
              {/* Role Selection Tabs */}
              <div className="flex bg-white/5 rounded-xl p-1 mb-8">
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </button>
                <button
                  onClick={() => handleRoleChange('customer')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    selectedRole === 'customer'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  Salesman
                </button>
              </div>

              {/* Form Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedRole === 'admin' ? 'Admin Login' : 'Salesman Login'}
                </h2>
                <p className="text-cyan-200">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>

              {error && (
                <Alert className="mb-6 bg-red-500/20 border-red-400/50 text-red-200">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    {selectedRole === 'admin' ? 'Username' : 'Email'}
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                    placeholder={selectedRole === 'admin' ? 'Enter admin username' : 'Enter your email'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                    placeholder={selectedRole === 'admin' ? 'Enter admin password' : 'Enter your password'}
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {isLogin ? <LogIn className="h-5 w-5 mr-2" /> : <UserPlus className="h-5 w-5 mr-2" />}
                      {isLogin ? `Sign In as ${selectedRole === 'admin' ? 'Admin' : 'Salesman'}` : 'Create Account'}
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({
                      email: '',
                      password: '',
                      full_name: '',
                      role: selectedRole
                    });
                  }}
                  className="text-cyan-300 hover:text-cyan-100 font-semibold transition-colors duration-300"
                >
                  {isLogin 
                    ? "Don't have an account? Create one" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3 text-center">Demo Credentials:</h4>
                <div className="text-sm text-cyan-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-300">Admin:</span>
                    <span>admin@vaaltic.com / password</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-300">Salesman:</span>
                    <span>user@vaaltic.com / password</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;