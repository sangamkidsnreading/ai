import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Volume2, Heart, Zap } from 'lucide-react';
import { useLearningStore } from '../stores/learningStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const LearningPage = () => {
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

  // 사용자 데이터 로드
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

  // 음성 재생 함수
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

  // 단어 클릭 핸들러
  const handleWordClick = (word: any) => {
    if (currentPlayingId === word.id) return;
    
    setCurrentPlayingId(word.id);
    speakText(word.text, 3);
    
    if (!word.isLearned) {
      learnWord(word.id);
      toast.success(`"${word.text}" 학습 완료! +1 코인`);
    }
  };

  // 문장 클릭 핸들러
  const handleSentenceClick = (sentence: any) => {
    if (currentPlayingId === sentence.id) return;
    
    setCurrentPlayingId(sentence.id);
    speakText(sentence.text, 1);
    
    if (!sentence.isLearned) {
      learnSentence(sentence.id);
      toast.success(`"${sentence.text}" 학습 완료! +1 코인`);
    }
  };

  // 전체 재생
  const handlePlayAll = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentPlayingId(null);
      return;
    }

    setIsPlaying(true);
    const items = activeSection === 'words' ? words : sentences;
    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex < items.length && isPlaying) {
        const item = items[currentIndex];
        setCurrentPlayingId(item.id);
        
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.rate = 0.8;
        utterance.lang = 'en-US';
        utterance.onend = () => {
          currentIndex++;
          setTimeout(() => {
            if (currentIndex < items.length && isPlaying) {
              playNext();
            } else {
              setIsPlaying(false);
              setCurrentPlayingId(null);
            }
          }, 1000);
        };
        speechSynthesis.speak(utterance);
      }
    };

    playNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white mb-6"
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

      {/* 섹션 선택 */}
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

      {/* 재생 컨트롤 */}
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

      {/* 콘텐츠 영역 */}
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
                  className={`relative p-6 rounded-xl cursor-pointer transition-all ${
                    word.isLearned
                      ? 'bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300'
                  } ${
                    currentPlayingId === word.id ? 'ring-4 ring-green-300 animate-pulse' : ''
                  }`}
                >
                  {/* 즐겨찾기 버튼 */}
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

                  {/* 레벨 표시 */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {word.level}
                  </div>

                  {/* 단어 */}
                  <div className="text-center mt-4">
                    <div className="text-2xl font-bold text-gray-800 mb-2">{word.text}</div>
                    {currentPlayingId === word.id && (
                      <Volume2 className="mx-auto text-green-500 animate-bounce" size={20} />
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
                  className={`relative p-6 rounded-xl cursor-pointer transition-all ${
                    sentence.isLearned
                      ? 'bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-300'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-orange-300'
                  } ${
                    currentPlayingId === sentence.id ? 'ring-4 ring-orange-300 animate-pulse' : ''
                  }`}
                >
                  {/* 레벨 표시 */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500 text-white text-sm rounded-full flex items-center justify-center font-bold">
                    {sentence.level}
                  </div>

                  {/* 문장 */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-gray-800">{sentence.text}</div>
                    </div>
                    {currentPlayingId === sentence.id && (
                      <Volume2 className="text-orange-500 animate-bounce" size={24} />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 오늘의 학습 진도 */}
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
};

export default LearningPage;

