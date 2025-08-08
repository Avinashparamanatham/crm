import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { 
  Users, 
  UserCheck, 
  BarChart3, 
  TrendingUp, 
  LogOut,
  Home,
  Menu,
  X,
  Shield,
  User
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { name: 'Leads', href: '/leads', icon: UserCheck, color: 'from-purple-500 to-pink-500' },
    { name: 'Contacts', href: '/contacts', icon: Users, color: 'from-green-500 to-teal-500' },
    { name: 'Pipeline', href: '/pipeline', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="glass-card border-b border-white/10 shadow-2xl relative z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white text-shadow">VAALTIC</span>
                  <p className="text-xs text-cyan-300 -mt-1">CRM SYSTEM</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 group ${
                      active
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-blue-500/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-colors duration-300 ${
                      active ? 'text-cyan-400' : 'group-hover:text-cyan-400'
                    }`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{user.full_name}</span>
                    {user.role === 'admin' ? (
                      <Shield className="h-4 w-4 text-purple-400" />
                    ) : (
                      <User className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <span className="text-xs text-cyan-300 capitalize">
                    {user.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                  </span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${
                        active ? 'text-cyan-400' : ''
                      }`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile User Info */}
                <div className="px-4 py-3 border-t border-white/10 mt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">{user.full_name}</span>
                        {user.role === 'admin' ? (
                          <Shield className="h-4 w-4 text-purple-400" />
                        ) : (
                          <User className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <span className="text-xs text-cyan-300 capitalize">
                        {user.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;