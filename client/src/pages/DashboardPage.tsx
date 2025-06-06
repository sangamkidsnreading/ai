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



      {/* Learning Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-xl border border-blue-100 mb-8"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Calendar size={24} className="text-white" />
            </div>
            월간 학습 달력
          </h3>
          <p className="text-gray-600 mb-4">매일의 학습 여정을 확인하세요</p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 rounded-full border border-yellow-200">
            <span className="inline-block w-3 h-3 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-amber-700">30코인 이상: 목표 달성!</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-6">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div key={day} className={`p-3 text-center text-sm font-bold rounded-lg ${
              index === 0 ? 'text-red-500 bg-red-50' : 
              index === 6 ? 'text-blue-500 bg-blue-50' : 
              'text-gray-600 bg-gray-50'
            }`}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3">
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ 
                  scale: 1.08, 
                  y: -4,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className={`
                  p-4 rounded-xl text-center cursor-pointer transition-all duration-300 relative overflow-hidden shadow-md hover:shadow-lg
                  ${isToday 
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-2 border-blue-300 ring-2 ring-blue-200' 
                    : hasBonus
                      ? 'bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300 text-amber-900 border-2 border-amber-400 shadow-amber-200'
                      : isGoalAchieved 
                        ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-yellow-800 border-2 border-yellow-300 shadow-yellow-200' 
                        : hasActivity 
                          ? 'bg-gradient-to-br from-green-200 to-emerald-300 text-green-800 border-2 border-green-300 shadow-green-100' 
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-200 hover:from-gray-200 hover:to-gray-300'
                  }
                `}
              >
                {/* Sparkle animation for bonus */}
                {hasBonus && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-ping opacity-30"></div>
                    <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full animate-ping opacity-40 animation-delay-200"></div>
                    <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping opacity-50 animation-delay-400"></div>
                  </div>
                )}
                
                {/* Crown icon for bonus achieved */}
                {hasBonus && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-3 -right-3 text-amber-600 text-xl z-10 drop-shadow-lg"
                  >
                    👑
                  </motion.div>
                )}
                
                {/* Star icon for goal achieved */}
                {isGoalAchieved && !hasBonus && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 text-yellow-600 text-lg z-10 drop-shadow-lg"
                  >
                    ⭐
                  </motion.div>
                )}
                
                <div className={`text-lg font-bold mb-1 ${
                  isToday ? 'text-white' : 
                  hasBonus ? 'text-amber-800' :
                  isGoalAchieved ? 'text-yellow-800' : 
                  hasActivity ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {day}
                </div>
                
                {hasActivity && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                  >
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      hasBonus ? 'bg-amber-700 text-amber-100' :
                      isGoalAchieved ? 'bg-yellow-700 text-yellow-100' : 
                      'bg-green-700 text-green-100'
                    }`}>
                      {totalCoins}코인
                    </div>
                    
                    {hasBonus && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-amber-800 text-xs font-semibold bg-amber-100 px-2 py-1 rounded-full border border-amber-300"
                      >
                        +{bonusCoins} 보너스
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {isToday && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-blue-100 text-xs font-semibold mt-1 bg-blue-500 px-2 py-1 rounded-full"
                  >
                    오늘
                  </motion.div>
                )}
                
                {!hasActivity && !isToday && (
                  <div className="text-xs text-gray-400 mt-1">
                    미학습
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">달력 범례</h4>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border">
              <div className="w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 rounded-lg"></div>
              <span className="text-gray-600 font-medium">미학습</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border">
              <div className="w-4 h-4 bg-gradient-to-br from-green-200 to-emerald-300 border border-green-300 rounded-lg"></div>
              <span className="text-gray-600 font-medium">학습 완료</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-400 border border-yellow-300 rounded-lg relative">
                <div className="absolute -top-1 -right-1 text-yellow-600 text-xs">⭐</div>
              </div>
              <span className="text-gray-600 font-medium">목표 달성</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300 border border-amber-400 rounded-lg relative">
                <div className="absolute -top-2 -right-2 text-amber-600 text-sm">👑</div>
              </div>
              <span className="text-gray-600 font-medium">보너스 달성</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-blue-200">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-300 rounded-lg ring-1 ring-blue-200"></div>
              <span className="text-blue-600 font-medium">오늘</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level Progress and Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow-lg border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={20} className="text-blue-500" />
            레벨 진행도
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Level {userStats.currentLevel}
            </div>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gray-200"></div>
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{
                  background: `conic-gradient(from 0deg, #3B82F6 0deg, #8B5CF6 ${(userStats.totalCoins % 100) * 3.6}deg, #E5E7EB ${(userStats.totalCoins % 100) * 3.6}deg)`
                }}
              ></div>
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700">
                  {userStats.totalCoins % 100}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              다음 레벨까지 {100 - (userStats.totalCoins % 100)}코인
            </p>
          </div>
        </motion.div>

        {/* Badge Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-6 shadow-lg border border-yellow-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" />
            뱃지 컬렉션
          </h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {earnedBadges.length}/{totalBadges}
            </div>
            <p className="text-sm text-gray-600">획득한 뱃지</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {userStats.badges.slice(0, 6).map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1 }}
                className={`p-3 rounded-xl text-center transition-all shadow-sm ${
                  badge.earned
                    ? 'bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400'
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
