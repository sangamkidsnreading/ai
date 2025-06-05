import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronRight, Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LevelSelectPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const levels = [
    { id: 1, name: 'Level 1', description: '기초 단어 및 문장', isUnlocked: true },
    { id: 2, name: 'Level 2', description: '초급 단어 및 문장', isUnlocked: true },
    { id: 3, name: 'Level 3', description: '중급 단어 및 문장', isUnlocked: true },
    { id: 4, name: 'Level 4', description: '중상급 단어 및 문장', isUnlocked: false },
    { id: 5, name: 'Level 5', description: '고급 단어 및 문장', isUnlocked: false },
    { id: 6, name: 'Level 6', description: '상급 단어 및 문장', isUnlocked: false },
    { id: 7, name: 'Level 7', description: '최상급 단어 및 문장', isUnlocked: false },
    { id: 8, name: 'Level 8', description: '전문가 단어 및 문장', isUnlocked: false },
    { id: 9, name: 'Level 9', description: '마스터 단어 및 문장', isUnlocked: false },
    { id: 10, name: 'Level 10', description: '엑스퍼트 단어 및 문장', isUnlocked: false },
  ];

  const getDaysForLevel = (levelId: number) => {
    const days = [];
    for (let i = 1; i <= 50; i++) {
      days.push({
        day: i,
        isCompleted: Math.random() > 0.7, // 임시로 랜덤하게 완료 상태 설정
        isUnlocked: i === 1 || Math.random() > 0.5,
      });
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6 font-korean">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-2xl p-6 text-white mb-6"
      >
        <h1 className="text-3xl font-bold text-center">키리보카 레벨 선택</h1>
        <p className="text-center opacity-90 mt-2">학습하고 싶은 레벨을 선택하세요</p>
      </motion.div>

      {selectedLevel ? (
        /* Day Selection */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedLevel(null)}
              className="flex items-center gap-2"
            >
              ← 뒤로가기
            </Button>
            <h2 className="text-2xl font-bold">Level {selectedLevel} - Day 선택</h2>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {getDaysForLevel(selectedLevel).map(({ day, isCompleted, isUnlocked }) => (
              <Link
                key={day}
                href={`/learning?level=${selectedLevel}&day=${day}`}
              >
                <Card
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    isCompleted
                      ? 'bg-green-100 border-green-500'
                      : isUnlocked
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {isCompleted ? (
                        <Star className="text-yellow-500" size={20} fill="currentColor" />
                      ) : isUnlocked ? (
                        <span className="text-blue-500 font-bold">DAY</span>
                      ) : (
                        <Lock className="text-gray-400" size={20} />
                      )}
                    </div>
                    <div className={`font-bold ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                      {day}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Level Selection */
        <div className="grid gap-6 max-w-2xl mx-auto">
          {levels.map((level) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: level.id * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:scale-102 ${
                  level.isUnlocked
                    ? 'hover:shadow-lg'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => level.isUnlocked && setSelectedLevel(level.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{level.name}</h3>
                      <p className="text-gray-600">{level.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {level.isUnlocked ? (
                        <ChevronRight className="text-green-500" size={24} />
                      ) : (
                        <Lock className="text-gray-400" size={24} />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}