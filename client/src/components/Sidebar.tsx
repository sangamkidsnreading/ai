import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  User, 
  Shield, 
  Search, 
  Moon, 
  LogOut, 
  Zap,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLearningStore } from '@/stores/learningStore';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { currentUser, logout } = useAuthStore();
  const { dayProgress, userStats, selectedLevel, selectedDay, setSelectedLevel, setSelectedDay } = useLearningStore();
  const [searchTerm, setSearchTerm] = useState('');

  const navigationItems = [
    { id: 'learning', label: '학습하기', icon: Home, number: '1' },
    { id: 'dashboard', label: '대시보드', icon: BarChart3, number: '2' },
    { id: 'profile', label: '프로필', icon: User, number: '3' },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: '관리자', icon: Shield, number: '4' }] : []),
    { id: 'logout', label: '로그아웃', icon: LogOut, number: currentUser?.role === 'admin' ? '5' : '4' },
  ];

  const handleLogout = () => {
    logout();
  };

  const recentDays = dayProgress.slice(-3).reverse();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 flex flex-col font-korean">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">키</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">키리보카</h1>
            <p className="text-sm text-gray-600">{currentUser?.name}</p>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <button className="flex items-center gap-2 w-full p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <Moon className="w-4 h-4" />
          <span className="text-sm">다크모드</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search words..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        <select 
          value={selectedLevel.toString()}
          onChange={(e) => setSelectedLevel(parseInt(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm mb-2"
        >
          <option value="0">모든 레벨</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
        <select 
          value={selectedDay.toString()}
          onChange={(e) => setSelectedDay(parseInt(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
        >
          <option value="0">모든 Day</option>
          {Array.from({ length: 50 }, (_, i) => i + 1).map(day => (
            <option key={day} value={day.toString()}>Day {day}</option>
          ))}
        </select>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isLogout = item.id === 'logout';
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isLogout) {
                    handleLogout();
                  } else {
                    onSectionChange(item.id);
                  }
                }}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all font-medium ${
                  isLogout
                    ? 'text-red-600 hover:bg-red-50'
                    : isActive
                    ? item.id === 'learning' 
                      ? 'bg-gradient-to-r from-green-200 to-green-300 text-gray-800 shadow-lg'
                      : 'bg-green-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  isLogout
                    ? 'bg-red-100 text-red-600'
                    : isActive 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-gray-200'
                }`}>
                  {item.number}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>


    </div>
  );
}
