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
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const { API } = useContext(AuthContext);
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
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: analytics?.total_leads || 0,
      icon: UserCheck,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      change: '+12%',
      positive: true
    },
    {
      title: 'Active Contacts',
      value: analytics?.total_contacts || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      change: '+8%',
      positive: true
    },
    {
      title: 'Total Deals',
      value: analytics?.total_deals || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      change: '+15%',
      positive: true
    },
    {
      title: 'Pipeline Value',
      value: `$${(analytics?.pipeline_value || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      change: '+23%',
      positive: true
    },
    {
      title: 'Won Deals',
      value: analytics?.won_deals || 0,
      icon: Award,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      change: '+18%',
      positive: true
    },
    {
      title: 'Conversion Rate',
      value: `${(analytics?.conversion_rate || 0).toFixed(1)}%`,
      icon: Target,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      change: '+5%',
      positive: true
    }
  ];

  const leadStagesData = analytics?.lead_stages || {};

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your CRM overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 card-hover bg-white border-0 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.positive ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 text-white ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Stages Breakdown */}
        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Stages</h3>
          <div className="space-y-4">
            {Object.entries(leadStagesData).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full badge-${stage}`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {stage.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Add New Lead</h4>
                  <p className="text-xs text-gray-600">Create a new lead entry</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Add Contact</h4>
                  <p className="text-xs text-gray-600">Create a new contact</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">New Deal</h4>
                  <p className="text-xs text-gray-600">Create a new deal</p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New lead created</p>
              <p className="text-xs text-gray-600">John Doe from TechCorp</p>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Deal moved to Proposal</p>
              <p className="text-xs text-gray-600">Enterprise Software Deal - $50,000</p>
            </div>
            <span className="text-xs text-gray-500">4 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Contact updated</p>
              <p className="text-xs text-gray-600">Sarah Johnson contact information</p>
            </div>
            <span className="text-xs text-gray-500">6 hours ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;