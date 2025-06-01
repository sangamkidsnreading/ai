import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Volume2, Heart, Zap } from 'lucide-react';
import { useLearningStore } from '@/stores/learningStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export default function LearningPage() {
  const {
    words,
    sentences,
    dayProgress,
    currentDay,
    learnWord,
    learnSentence,
    toggleFavorite,
    loadUserData,
  } = useLearningStore();
  
  const { currentUser } = useAuthStore();
  const { toast } = useToast();

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const [activeSection, setActiveSection] = useState<'words' | 'sentences'>('words');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const currentDayProgress = dayProgress.find(d => d.day === currentDay) || 
    { day: currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };

  // Speech synthesis function
  const speakText = (text: string, times: number = 1) => {
    if ('speechSynthesis' in window) {
      let count = 0;
      const speak = () => {
        if (count < times) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.lang = 'en-US';
          utterance.onend = () => {
            count++;
            if (count < times) {
              setTimeout(speak, 500);
            } else {
              setCurrentPlayingId(null);
            }
          };
          speechSynthesis.speak(utterance);
          count++;
        }
      };
      speak();
    }
  };

  // Word click handler
  const handleWordClick = async (word: any) => {
    if (currentPlayingId === word.id.toString()) return;
    
    setCurrentPlayingId(word.id.toString());
    speakText(word.text, 3);
    
    if (!word.isLearned) {
      await learnWord(word.id);
      toast({
        title: "학습 완료!",
        description: `"${word.text}" 단어를 학습했습니다. +1 코인`,
      });
    }
  };

  // Sentence click handler
  const handleSentenceClick = async (sentence: any) => {
    if (currentPlayingId === sentence.id.toString()) return;
    
    setCurrentPlayingId(sentence.id.toString());
    speakText(sentence.text, 1);
    
    if (!sentence.isLearned) {
      await learnSentence(sentence.id);
      toast({
        title: "학습 완료!",
        description: `"${sentence.text}" 문장을 학습했습니다. +1 코인`,
      });
    }
  };

  // Play all function - 10개 단어를 각각 3번씩 읽기
  const handlePlayAll = () => {
    console.log('Start 버튼 클릭됨');
    
    if (isPlaying) {
      console.log('재생 중단');
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentPlayingId(null);
      return;
    }

    console.log('재생 시작');
    setIsPlaying(true);
    const items = activeSection === 'words' ? words.slice(0, 10) : sentences.slice(0, 10); // 10개만 선택
    console.log('재생할 아이템들:', items);
    
    if (items.length === 0) {
      console.log('재생할 단어가 없음');
      setIsPlaying(false);
      toast({
        title: "알림",
        description: "재생할 단어가 없습니다.",
      });
      return;
    }

    let currentIndex = 0;
    let repeatCount = 0;
    const maxRepeats = 3; // 각 단어를 3번씩 읽기

    const playNext = () => {
      console.log(`playNext 호출됨 - currentIndex: ${currentIndex}, isPlaying: ${isPlaying}, items.length: ${items.length}`);
      
      if (currentIndex < items.length && isPlaying) {
        const item = items[currentIndex];
        console.log(`재생 중: ${item.text} (${repeatCount + 1}/${maxRepeats})`);
        setCurrentPlayingId(item.id.toString());
        
        // Speech synthesis 지원 확인
        if (!('speechSynthesis' in window)) {
          console.error('Speech synthesis not supported');
          toast({
            title: "오류",
            description: "음성 합성이 지원되지 않는 브라우저입니다.",
          });
          setIsPlaying(false);
          return;
        }
        
        // 음성이 준비될 때까지 잠시 대기
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(item.text);
          utterance.rate = 0.8;
          utterance.lang = 'en-US';
          
          utterance.onstart = () => {
            console.log(`음성 시작: ${item.text}`);
          };
          
          utterance.onend = () => {
            console.log(`음성 재생 완료: ${item.text}`);
            repeatCount++;
            
            if (repeatCount < maxRepeats) {
              // 같은 단어를 다시 읽기 (0.5초 간격)
              setTimeout(() => {
                if (isPlaying) {
                  playNext();
                }
              }, 500);
            } else {
              // 다음 단어로 이동
              repeatCount = 0;
              currentIndex++;
              setTimeout(() => {
                if (currentIndex < items.length && isPlaying) {
                  playNext();
                } else {
                  console.log('모든 단어 재생 완료');
                  setIsPlaying(false);
                  setCurrentPlayingId(null);
                  toast({
                    title: "학습 완료!",
                    description: `${items.length}개의 ${activeSection === 'words' ? '단어' : '문장'}를 모두 학습했습니다.`,
                  });
                }
              }, 1000);
            }
          };
          
          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            toast({
              title: "오류",
              description: "음성 재생 중 오류가 발생했습니다.",
            });
            setIsPlaying(false);
            setCurrentPlayingId(null);
          };
          
          console.log('speechSynthesis.speak 호출');
          speechSynthesis.speak(utterance);
        }, 100);
      } else {
        console.log('playNext 조건 실패 - 재생 종료');
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }
    };

    console.log('playNext 함수 호출 시작');
    playNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6 font-korean">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-bg rounded-2xl p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">DAY {currentDay}</h1>
            <p className="opacity-90">오늘 학습: 단어 {currentDayProgress.wordsLearned}개, 문장 {currentDayProgress.sentencesLearned}개</p>
          </div>
          <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
            <Zap className="text-yellow-300" size={20} />
            <span className="font-bold">{currentDayProgress.coinsEarned} 코인</span>
          </div>
        </div>
      </motion.div>

      {/* Section Toggle */}
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSection('words')}
          className={`flex-1 p-4 rounded-xl font-semibold transition-all ${
            activeSection === 'words'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Words In, Power On.
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveSection('sentences')}
          className={`flex-1 p-4 rounded-xl font-semibold transition-all ${
            activeSection === 'sentences'
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Create with Words.
        </motion.button>
      </div>

      {/* Play Controls */}
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayAll}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            isPlaying
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={20} />
              Stop
            </>
          ) : (
            <>
              <Play size={20} />
              Start
            </>
          )}
        </motion.button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeSection === 'words' && (
          <motion.div
            key="words"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-green-600 mb-6">Words In, Power On.</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {words.map((word) => (
                <motion.div
                  key={word.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleWordClick(word)}
                  className={`relative p-6 rounded-xl cursor-pointer transition-all card-hover ${
                    word.isLearned
                      ? 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300'
                  } ${
                    currentPlayingId === word.id.toString() ? 'ring-4 ring-green-300 animate-pulse' : ''
                  }`}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(word.id);
                    }}
                    className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
                      word.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart size={16} fill={word.isFavorite ? 'currentColor' : 'none'} />
                  </button>

                  {/* Level Badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {word.level}
                  </div>

                  {/* Word */}
                  <div className="text-center mt-4">
                    <div className="text-2xl font-bold text-gray-800 mb-2">{word.text}</div>
                    {currentPlayingId === word.id.toString() && (
                      <Volume2 className="mx-auto text-green-500 bounce-speech" size={20} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === 'sentences' && (
          <motion.div
            key="sentences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-orange-600 mb-6">Create with Words.</h2>
            
            <div className="space-y-4">
              {sentences.map((sentence) => (
                <motion.div
                  key={sentence.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSentenceClick(sentence)}
                  className={`relative p-6 rounded-xl cursor-pointer transition-all card-hover ${
                    sentence.isLearned
                      ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-orange-300'
                  } ${
                    currentPlayingId === sentence.id.toString() ? 'ring-4 ring-orange-300 animate-pulse' : ''
                  }`}
                >
                  {/* Level Badge */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                    {sentence.level}
                  </div>

                  {/* Sentence */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-gray-800">{sentence.text}</div>
                    </div>
                    {currentPlayingId === sentence.id.toString() && (
                      <Volume2 className="text-orange-500 bounce-speech" size={24} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">오늘의 학습 진도</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{currentDayProgress.wordsLearned}</div>
            <div className="text-sm text-blue-600">학습한 단어</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{currentDayProgress.sentencesLearned}</div>
            <div className="text-sm text-green-600">학습한 문장</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{currentDayProgress.coinsEarned}</div>
            <div className="text-sm text-yellow-600">획득한 코인</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
