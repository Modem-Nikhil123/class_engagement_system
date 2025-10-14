import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import DepartmentManager from '../components/admin/DepartmentManager';
import TeacherManager from '../components/admin/TeacherManager';
import StudentManager from '../components/admin/StudentManager';
import {
  Users,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('departments');

  const tabs = [
    { id: 'departments', label: 'Departments', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: UserCheck },
    { id: 'students', label: 'Students', icon: Users }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'departments':
        return <DepartmentManager />;
      case 'teachers':
        return <TeacherManager />;
      case 'students':
        return <StudentManager />;
      default:
        return <DepartmentManager />;
    }
  };


  return (
    <Layout title="Admin Dashboard">
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
