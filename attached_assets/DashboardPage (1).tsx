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
import { useLearningStore } from '../stores/learningStore';

const DashboardPage = () => {
  const { dayProgress, userStats, currentDay } = useLearningStore();

  // 차트 데이터 준비
  const weeklyData = useMemo(() => {
    const last7Days = dayProgress.slice(-7).map((day, index) => ({
      day: `Day ${day.day}`,
      words: day.wordsLearned,
      sentences: day.sentencesLearned,
      coins: day.coins,
      date: day.date,
    }));
    return last7Days;
  }, [dayProgress]);

  const progressData = useMemo(() => {
    const totalDays = dayProgress.length;
    const activeDays = dayProgress.filter(d => d.coins > 0).length;
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

  const currentDayData = dayProgress.find(d => d.day === currentDay) || dayProgress[0];
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">학습 대시보드</h1>
        <p className="text-gray-600">당신의 학습 여정을 한눈에 확인하세요</p>
      </motion.div>

      {/* 통계 카드 */}
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

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 주간 학습 현황 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            주간 학습 현황
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="words" fill="#3B82F6" name="단어" />
              <Bar dataKey="sentences" fill="#10B981" name="문장" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 코인 획득 추이 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            코인 획득 추이
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="coins"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                name="코인"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 레벨 진행도와 뱃지 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 레벨 진행도 */}
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

        {/* 학습 완료율 */}
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

        {/* 뱃지 컬렉션 */}
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

      {/* 오늘의 성과 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white shadow-lg"
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
            <div className="text-3xl font-bold">{currentDayData.coins}</div>
            <div className="text-sm opacity-90">획득한 코인</div>
          </div>
        </div>
      </motion.div>

      {/* 학습 목표 및 동기부여 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* 학습 목표 */}
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

        {/* 동기부여 메시지 */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} />
            오늘의 격려
          </h3>
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-medium mb-2">
              {userStats.streak > 0 
                ? `${userStats.streak}일 연속 학습 중이에요!`
                : '새로운 학습을 시작해보세요!'
              }
            </p>
            <p className="text-sm opacity-90">
              꾸준한 학습이 실력 향상의 비결입니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;

