import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  User, 
  Search, 
  Moon, 
  Sun,
  Settings,
  LogOut,
  Shield,
  Zap
} from 'lucide-react';
import { useLearningStore } from '../stores/learningStore';
import { useAuthStore } from '../stores/authStore';

const Sidebar = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  const { 
    dayProgress, 
    userStats, 
    currentDay, 
    theme, 
    setTheme,
    loadUserData 
  } = useLearningStore();
  
  const { currentUser, logout } = useAuthStore();

  // 사용자 데이터 로드
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const currentDayProgress = dayProgress.find(d => d.day === currentDay) || 
    { day: currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };

  const menuItems = [
    { 
      path: '/', 
      icon: Home, 
      label: '학습하기', 
      color: 'bg-purple-500 hover:bg-purple-600' 
    },
    { 
      path: '/dashboard', 
      icon: BarChart3, 
      label: '대시보드', 
      color: 'bg-teal-500 hover:bg-teal-600' 
    },
    { 
      path: '/profile', 
      icon: User, 
      label: '프로필', 
      color: 'bg-pink-500 hover:bg-pink-600' 
    },
  ];

  // 관리자 메뉴 추가
  if (currentUser?.role === 'admin') {
    menuItems.push({
      path: '/admin',
      icon: Shield,
      label: '관리자',
      color: 'bg-red-500 hover:bg-red-600'
    });
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">키</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">키리보카</h1>
            <p className="text-sm text-gray-600">{currentUser?.name}</p>
          </div>
        </div>
        
        {/* 테마 토글 */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex items-center gap-2 w-full p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {theme === 'light' ? (
            <>
              <Moon size={18} />
              <span className="text-sm">다크모드</span>
            </>
          ) : (
            <>
              <Sun size={18} />
              <span className="text-sm">라이트모드</span>
            </>
          )}
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
        </div>
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
        >
          <option value="">Select Level</option>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Level {i + 1}</option>
          ))}
        </select>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isActive 
                    ? `${item.color} text-white shadow-lg` 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Day Kiri Coin */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Day Kiri Coin</h3>
        <div className="space-y-2">
          {dayProgress.slice(0, 4).map((day) => (
            <div
              key={day.day}
              className={`flex items-center justify-between p-2 rounded-lg ${
                day.day === currentDay ? 'bg-green-500 text-white' : 'bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium">Day {day.day}</span>
              <span className="text-sm font-bold">{day.coinsEarned}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total KiriCoin */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Total KiriCoin</h3>
            <Zap className="text-yellow-300" size={20} />
          </div>
          <div className="text-3xl font-bold">{userStats.totalCoins}</div>
          <div className="text-sm opacity-90">Level {userStats.currentLevel}</div>
        </div>
      </div>

      {/* 연속 학습 */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-orange-100 rounded-lg p-3 text-center">
          <div className="text-orange-600 font-semibold">🏆 {userStats.streak}일 연속 학습</div>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

