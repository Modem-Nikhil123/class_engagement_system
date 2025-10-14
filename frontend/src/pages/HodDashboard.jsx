import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import TimetableManager from '../components/admin/TimetableManager';
import ComplaintsList from '../components/admin/ComplaintsList';
import useAdminStore from '../stores/adminStore';
import useAuthStore from '../stores/authStore';
import {
  BarChart3,
  Calendar,
  MessageSquare
} from 'lucide-react';

export default function HodDashboard() {
  const { user } = useAuthStore();
  const {
    timetable,
    queries,
    fetchTimetable,
    fetchQueries
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState('overview');

  // Fetch timetable data only when timetable tab is active
  useEffect(() => {
    if (user && activeTab === 'timetable') {
      fetchTimetable();
    }
  }, [user, activeTab]);

  // Fetch queries data only when queries tab is active
  useEffect(() => {
    if (user && activeTab === 'queries') {
      fetchQueries();
    }
  }, [user, activeTab]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'timetable', label: 'Manage Timetable', icon: Calendar },
    { id: 'queries', label: 'Queries', icon: MessageSquare }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'timetable':
        return <TimetableManager />;
      case 'queries':
        return <ComplaintsList />;
      default:
        return <OverviewTab />;
    }
  };

  const OverviewTab = () => {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="opacity-90">HOD Dashboard - Manage your department's timetable</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('timetable')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Calendar className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Timetable</h4>
              <p className="text-sm text-gray-600">Create and update class schedules</p>
            </button>

            <button
              onClick={() => setActiveTab('queries')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <MessageSquare className="h-6 w-6 text-orange-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Queries</h4>
              <p className="text-sm text-gray-600">Check student complaints and issues</p>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="HOD Dashboard">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
}