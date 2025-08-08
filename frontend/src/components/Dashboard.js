import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card } from './ui/card';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  BarChart,
  PieChart,
  Activity,
  Shield,
  User
} from 'lucide-react';

const Dashboard = () => {
  const { API, user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin loading-pulse"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: analytics?.total_leads || 0,
      icon: UserCheck,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-l-blue-500',
      change: '+12%',
      positive: true
    },
    {
      title: 'Active Contacts',
      value: analytics?.total_contacts || 0,
      icon: Users,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-l-green-500',
      change: '+8%',
      positive: true
    },
    {
      title: 'Total Deals',
      value: analytics?.total_deals || 0,
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-l-purple-500',
      change: '+15%',
      positive: true
    },
    {
      title: 'Pipeline Value',
      value: `$${(analytics?.pipeline_value || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-l-yellow-500',
      change: '+23%',
      positive: true
    },
    {
      title: 'Won Deals',
      value: analytics?.won_deals || 0,
      icon: Award,
      gradient: 'from-emerald-500 to-green-500',
      bgGradient: 'from-emerald-500/10 to-green-500/10',
      borderColor: 'border-l-emerald-500',
      change: '+18%',
      positive: true
    },
    {
      title: 'Conversion Rate',
      value: `${(analytics?.conversion_rate || 0).toFixed(1)}%`,
      icon: Target,
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-l-indigo-500',
      change: '+5%',
      positive: true
    }
  ];

  const leadStagesData = analytics?.lead_stages || {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header with Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-4xl font-bold text-white text-shadow-lg">
              {getGreeting()}, {user.full_name}
            </h1>
            <div className={`px-3 py-1 rounded-full flex items-center space-x-2 ${
              user.role === 'admin' 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' 
                : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30'
            }`}>
              {user.role === 'admin' ? (
                <Shield className="h-4 w-4 text-purple-400" />
              ) : (
                <User className="h-4 w-4 text-blue-400" />
              )}
              <span className="text-sm font-semibold text-white capitalize">
                {user.role === 'admin' ? 'Administrator' : 'Sales Rep'}
              </span>
            </div>
          </div>
          <p className="text-cyan-300 text-lg">
            Welcome to your CRM dashboard
            {user.role === 'admin' && (
              <span className="text-purple-300"> - You have full system access</span>
            )}
            {user.role === 'customer' && (
              <span className="text-blue-300"> - Your personal workspace</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-cyan-300">Last updated</p>
          <p className="text-xl font-bold text-white text-shadow">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card hover-lift ${stat.borderColor} ${stat.bgGradient} scale-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.positive ? (
                      <ArrowUpRight className="h-4 w-4 text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-xs font-bold ${
                      stat.positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Stages Chart */}
        <div className="lg:col-span-2">
          <div className="modern-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <PieChart className="h-6 w-6 text-cyan-400 mr-3" />
                Lead Pipeline Analysis
              </h3>
              {user.role === 'admin' && (
                <div className="flex items-center space-x-2 text-xs text-purple-300">
                  <Shield className="h-4 w-4" />
                  <span>Admin View: All Leads</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {Object.entries(leadStagesData).map(([stage, count]) => {
                const percentage = analytics?.total_leads > 0 ? (count / analytics.total_leads * 100) : 0;
                return (
                  <div key={stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          stage === 'new' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          stage === 'contacted' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          stage === 'qualified' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}></div>
                        <span className="text-white font-medium capitalize">{stage.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-cyan-300 text-sm">{percentage.toFixed(1)}%</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          stage === 'new' ? 'from-blue-500 to-cyan-500' :
                          stage === 'contacted' ? 'from-yellow-500 to-orange-500' :
                          stage === 'qualified' ? 'from-green-500 to-emerald-500' :
                          'from-purple-500 to-pink-500'
                        } transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="modern-card p-6 hover-lift">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Plus className="h-6 w-6 text-green-400 mr-3" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Add New Lead</h4>
                    <p className="text-cyan-300 text-sm">Create a new lead entry</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Add Contact</h4>
                    <p className="text-green-300 text-sm">Create a new contact</p>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">New Deal</h4>
                    <p className="text-purple-300 text-sm">Create a new deal</p>
                  </div>
                </div>
              </button>

              {user.role === 'admin' && (
                <button className="w-full text-left p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      <BarChart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Admin Reports</h4>
                      <p className="text-orange-300 text-sm">View detailed analytics</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="modern-card p-6 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Activity className="h-6 w-6 text-purple-400 mr-3" />
            Recent Activity
          </h3>
          {user.role === 'admin' ? (
            <div className="flex items-center space-x-2 text-xs text-purple-300">
              <Shield className="h-4 w-4" />
              <span>System-wide Activity</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-blue-300">
              <Eye className="h-4 w-4" />
              <span>Your Activity Only</span>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">New lead created</p>
              <p className="text-cyan-300 text-sm">John Doe from TechCorp</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400">2 hours ago</span>
              {user.role === 'admin' && (
                <p className="text-xs text-purple-300">by Sarah Wilson</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Deal moved to Proposal</p>
              <p className="text-green-300 text-sm">Enterprise Software Deal - $50,000</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400">4 hours ago</span>
              {user.role === 'admin' && (
                <p className="text-xs text-purple-300">by Mike Johnson</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">Contact updated</p>
              <p className="text-purple-300 text-sm">Sarah Johnson contact information</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400">6 hours ago</span>
              {user.role === 'customer' && (
                <p className="text-xs text-blue-300">by You</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;