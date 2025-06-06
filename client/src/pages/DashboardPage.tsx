import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Zap,
  Star,
  BarChart3,
} from 'lucide-react';
import { useLearningStore } from '@/stores/learningStore';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const { dayProgress, userStats, currentDay } = useLearningStore();

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
    staleTime: 30000, // 30초 캐시
  });

  // Chart data preparation
  const weeklyData = useMemo(() => {
    const last7Days = dayProgress.slice(-7).map((day) => ({
      day: `Day ${day.day}`,
      words: day.wordsLearned,
      sentences: day.sentencesLearned,
      coins: day.coinsEarned,
      date: day.date,
    }));
    return last7Days;
  }, [dayProgress]);

  const progressData = useMemo(() => {
    const totalDays = dayProgress.length;
    const activeDays = dayProgress.filter(d => d.coinsEarned > 0).length;
    const completionRate = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;
    
    return [
      { name: '완료', value: completionRate, fill: '#10B981' },
      { name: '미완료', value: 100 - completionRate, fill: '#E5E7EB' },
    ];
  }, [dayProgress]);

  const levelProgressData = useMemo(() => {
    const currentLevelProgress = (userStats.totalCoins % 100);
    return [
      {
        name: 'Level Progress',
        value: currentLevelProgress,
        fill: '#3B82F6',
      }
    ];
  }, [userStats.totalCoins]);

  const currentDayData = dayProgress.find(d => d.day === currentDay) || 
    { day: currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };
  const earnedBadges = userStats.badges.filter(badge => badge.earned);
  const totalBadges = userStats.badges.length;

  const stats = [
    {
      title: '총 학습 단어',
      value: userStats.totalWordsLearned,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: '총 학습 문장',
      value: userStats.totalSentencesLearned,
      icon: Target,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: '총 획득 코인',
      value: userStats.totalCoins,
      icon: Zap,
      color: 'bg-yellow-500',
      change: '+15%',
    },
    {
      title: '연속 학습일',
      value: userStats.streak,
      icon: Calendar,
      color: 'bg-purple-500',
      change: userStats.streak > 0 ? `${userStats.streak}일` : '0일',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-korean">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">학습 대시보드</h1>
        <p className="text-gray-600">당신의 학습 여정을 한눈에 확인하세요</p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Learning Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar size={20} />
          월간 학습 달력
          <span className="text-sm text-gray-500 ml-auto">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span>
            30코인 이상: 목표 달성!
          </span>
        </h3>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, index) => {
            const day = index + 1;
            const dayData = dayProgress.find(d => d.day === day);
            const coins = dayData?.coinsEarned || 0;
            const bonusCoins = dayData?.bonusCoins || 0;
            const totalCoins = coins + bonusCoins;
            const isGoalAchieved = coins >= 30;
            const hasBonus = bonusCoins > 0;
            const isToday = day === currentDay;
            const hasActivity = coins > 0;
            
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className={`
                  p-3 rounded-lg border-2 text-center cursor-pointer transition-all relative
                  ${isToday 
                    ? 'border-blue-500 bg-blue-50' 
                    : hasBonus
                      ? 'border-amber-500 bg-gradient-to-br from-yellow-100 to-amber-100'
                      : isGoalAchieved 
                        ? 'border-yellow-400 bg-yellow-100' 
                        : hasActivity 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                  }
                `}
              >
                {/* Crown icon for bonus achieved */}
                {hasBonus && (
                  <div className="absolute -top-1 -right-1 text-amber-500 text-sm">
                    👑
                  </div>
                )}
                
                <div className={`text-sm font-bold ${
                  isToday ? 'text-blue-600' : 
                  hasBonus ? 'text-amber-700' :
                  isGoalAchieved ? 'text-yellow-700' : 
                  hasActivity ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {day}
                </div>
                
                {hasActivity && (
                  <div className="mt-1">
                    <div className={`text-xs font-semibold ${
                      hasBonus ? 'text-amber-600' :
                      isGoalAchieved ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {totalCoins}코인
                    </div>
                    
                    {hasBonus && (
                      <div className="text-amber-500 text-xs mt-1">
                        +{bonusCoins} 보너스
                      </div>
                    )}
                    
                    {isGoalAchieved && !hasBonus && (
                      <div className="text-yellow-500 text-xs mt-1">
                        ⭐
                      </div>
                    )}
                  </div>
                )}
                
                {isToday && (
                  <div className="text-blue-500 text-xs mt-1">
                    오늘
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-gray-200 bg-gray-50 rounded"></div>
            학습 안함
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-green-200 bg-green-50 rounded"></div>
            학습 완료 (30코인 미만)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-yellow-400 bg-yellow-100 rounded"></div>
            목표 달성 (30코인 이상)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-amber-500 bg-gradient-to-br from-yellow-100 to-amber-100 rounded relative">
              <div className="absolute -top-1 -right-1 text-amber-500 text-xs">👑</div>
            </div>
            보너스 달성 (30코인 + 10보너스)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 bg-blue-50 rounded"></div>
            오늘
          </div>
        </div>
      </motion.div>

      {/* Level Progress and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={20} />
            레벨 진행도
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              Level {userStats.currentLevel}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={levelProgressData}>
                <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">
              다음 레벨까지 {100 - (userStats.totalCoins % 100)}코인
            </p>
          </div>
        </motion.div>

        {/* Learning Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={20} />
            학습 완료율
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <p className="text-2xl font-bold text-green-600">
              {progressData[0]?.value.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">완료율</p>
          </div>
        </motion.div>

        {/* Badge Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={20} />
            뱃지 컬렉션
          </h3>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-purple-600">
              {earnedBadges.length}/{totalBadges}
            </div>
            <p className="text-sm text-gray-600">획득한 뱃지</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {userStats.badges.slice(0, 6).map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1 }}
                className={`p-3 rounded-lg text-center transition-all ${
                  badge.earned
                    ? 'bg-yellow-100 border-2 border-yellow-300'
                    : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium text-gray-700">
                  {badge.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Today's Achievement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-xl p-6 text-white shadow-lg mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy size={24} />
          오늘의 성과 (Day {currentDay})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{currentDayData.wordsLearned}</div>
            <div className="text-sm opacity-90">학습한 단어</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentDayData.sentencesLearned}</div>
            <div className="text-sm opacity-90">학습한 문장</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentDayData.coinsEarned}</div>
            <div className="text-sm opacity-90">획득한 코인</div>
          </div>
        </div>
      </motion.div>

      {/* 노력왕 전체 랭킹 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg mb-8"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Trophy size={24} className="text-yellow-500" />
          노력왕 전체 랭킹
        </h3>
        
        {isLeaderboardLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {(leaderboard as any[])?.map((user: any, index: number) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  index < 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {user.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-600">
                      단어 {user.totalWordsLearned}개 · 문장 {user.totalSentencesLearned}개
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-yellow-600">{user.totalCoins}코인</div>
                  {index < 3 && (
                    <div className="text-xs text-gray-500">
                      {index === 0 ? '🥇 1등' : index === 1 ? '🥈 2등' : '🥉 3등'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {(!leaderboard || (leaderboard as any[]).length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
                <p>아직 랭킹 데이터가 없습니다.</p>
                <p className="text-sm">학습을 시작해보세요!</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Learning Goals and Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Learning Goals */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={20} />
            이번 주 목표
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">단어 학습</span>
              <span className="font-semibold">
                {weeklyData.reduce((sum, day) => sum + day.words, 0)}/50
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((weeklyData.reduce((sum, day) => sum + day.words, 0) / 50) * 100, 100)}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">문장 학습</span>
              <span className="font-semibold">
                {weeklyData.reduce((sum, day) => sum + day.sentences, 0)}/25
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((weeklyData.reduce((sum, day) => sum + day.sentences, 0) / 25) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Motivation Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">동기부여</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🎯 오늘의 목표</h4>
              <p className="text-purple-700 text-sm">새로운 단어 5개와 문장 2개를 학습해보세요!</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">💪 격려의 말</h4>
              <p className="text-green-700 text-sm">꾸준한 학습이 성공의 열쇠입니다. 화이팅!</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Day by Day Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar size={20} />
          Day별 학습 진행 상황
        </h3>
        
        {dayProgress.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">아직 학습 기록이 없습니다.</p>
            <p className="text-sm mt-2">학습을 시작하면 Day별 진행 상황을 확인할 수 있습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dayProgress
              .sort((a, b) => b.day - a.day)
              .slice(0, 12)
              .map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    day.day === currentDay
                      ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-lg font-bold text-gray-800">DAY {day.day}</div>
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-sm font-semibold">
                      <Zap size={14} />
                      {day.coinsEarned} 코인
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">단어</span>
                      <span className="font-semibold text-blue-600">{day.wordsLearned}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">문장</span>
                      <span className="font-semibold text-orange-600">{day.sentencesLearned}개</span>
                    </div>
                  </div>
                  
                  {day.day === currentDay && (
                    <div className="mt-2 text-xs text-green-600 font-semibold">
                      오늘의 학습
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}
        
        {dayProgress.length > 12 && (
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
              더 많은 기록 보기 ({dayProgress.length - 12}개 더)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
