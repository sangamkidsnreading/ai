import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLearningStore } from '@/stores/learningStore';
import { useAuthStore } from '@/stores/authStore';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LearningPageNew() {
  const { toast } = useToast();
  const { currentUser } = useAuthStore();
  const {
    words,
    sentences,
    userStats,
    dayProgress,
    currentDay,
    selectedLevel,
    selectedDay,
    loadUserData,
    learnWord,
    learnSentence,
    toggleFavorite,
    setSelectedLevel,
    setSelectedDay,
    getFilteredWords,
    getFilteredSentences,
    addCoinsImmediately
  } = useLearningStore();

  const [activeSection, setActiveSection] = useState<'words' | 'sentences'>('words');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSentenceId, setRecordingSentenceId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudios, setRecordedAudios] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const totalCoins = userStats.totalCoins;
  const currentDayProgress = dayProgress.find(d => d.day === (selectedDay || currentDay)) || 
    { day: selectedDay || currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };

  // Audio functions
  const handleWordClick = async (word: any) => {
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);

    try {
      await learnWord(word.id);
      addCoinsImmediately(1);
      toast({
        title: "단어 학습 완료",
        description: `"${word.text}" 학습 완료! +1 코인`,
      });
    } catch (error) {
      console.error('단어 학습 오류:', error);
    }
  };

  const handleSentenceClick = (sentence: any) => {
    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const handleSentenceRecording = async (sentence: any) => {
    if (isRecording && recordingSentenceId === sentence.id.toString()) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setRecordingSentenceId(null);
        setMediaRecorder(null);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordedAudios(prev => ({
          ...prev,
          [sentence.id.toString()]: audioUrl
        }));

        toast({
          title: "녹음 완료",
          description: `"${sentence.text}" 녹음이 완료되었습니다.`,
        });

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSentenceId(sentence.id.toString());
    } catch (error) {
      console.error('녹음 시작 오류:', error);
      toast({
        title: "녹음 오류",
        description: "마이크 접근 권한을 확인해주세요.",
      });
    }
  };

  const handleStartLearning = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
      speechSynthesis.cancel();
      return;
    }

    const items = activeSection === 'words' ? getFilteredWords() : getFilteredSentences();
    if (items.length === 0) return;

    setIsPlaying(true);
    let currentIndex = 0;
    let repeatCount = 0;
    const maxRepeats = 3;

    const playNext = () => {
      if (currentIndex >= items.length) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        toast({
          title: "학습 완료!",
          description: `${items.length}개의 ${activeSection === 'words' ? '단어' : '문장'}를 모두 학습했습니다.`,
        });
        return;
      }

      const item = items[currentIndex];
      setCurrentPlayingId(item.id.toString());

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.rate = 0.8;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        repeatCount++;
        if (repeatCount < maxRepeats) {
          setTimeout(playNext, 300);
        } else {
          // Complete learning for this item
          if (activeSection === 'words') {
            learnWord(item.id);
            addCoinsImmediately(1);
          } else {
            learnSentence(item.id);
            addCoinsImmediately(3);
          }
          
          repeatCount = 0;
          currentIndex++;
          setTimeout(playNext, 500);
        }
      };

      speechSynthesis.speak(utterance);
    };

    playNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                LEVEL {selectedLevel || 1} - Day {selectedDay || currentDay}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                오늘 학습: 단어 {getFilteredWords().filter(w => w.isLearned).length}개, 문장 {getFilteredSentences().filter(s => s.isLearned).length}개
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">오늘 적립 코인</div>
              <div className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
                {totalCoins}
                <span className="text-yellow-500 text-2xl">⚡</span>
              </div>
              <div className="text-xs text-green-600">+15%</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.button
            onClick={() => setActiveSection('words')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl text-left transition-all ${
              activeSection === 'words'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300'
                : 'bg-white border-2 border-gray-200 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h3 className="font-bold text-purple-700">Words</h3>
                <p className="text-xs text-purple-600">새로운 단어 5개와 문장 2개를 학습해보세요!</p>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            onClick={() => setActiveSection('sentences')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl text-left transition-all ${
              activeSection === 'sentences'
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300'
                : 'bg-white border-2 border-gray-200 hover:border-green-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h3 className="font-bold text-green-700">Sentences</h3>
                <p className="text-xs text-green-600">구조한 학습이 성공의 열쇠입니다. 화이팅!</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Content Section */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Start Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Level {selectedLevel || 1} - Day {selectedDay || currentDay}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartLearning}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isPlaying
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
              }`}
            >
              {isPlaying ? (
                <>⏹️ Stop</>
              ) : (
                <>🎯 Start</>
              )}
            </motion.button>
          </div>

          {/* Content Grid */}
          <AnimatePresence mode="wait">
            {activeSection === 'words' ? (
              <motion.div
                key="words"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {getFilteredWords().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>선택한 조건에 해당하는 단어가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {getFilteredWords().map((word) => (
                      <motion.div
                        key={word.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleWordClick(word)}
                        className={`relative p-4 rounded-xl cursor-pointer transition-all bg-yellow-50 border-2 ${
                          currentPlayingId === word.id.toString() 
                            ? 'border-yellow-400 bg-yellow-100' 
                            : 'border-yellow-200 hover:border-yellow-300'
                        } ${word.isLearned ? 'bg-green-50 border-green-200' : ''}`}
                      >
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(word.id);
                          }}
                          className="absolute top-2 right-2 text-lg"
                        >
                          {word.isFavorite ? '❤️' : '🤍'}
                        </button>

                        {/* Learned Check */}
                        {word.isLearned && (
                          <div className="absolute top-2 left-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}

                        {/* Word Content */}
                        <div className="text-center mt-4">
                          <div className="text-xl font-bold text-gray-800 mb-1">{word.text}</div>
                          <div className="text-sm text-gray-600">{word.meaning}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="sentences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {getFilteredSentences().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>선택한 조건에 해당하는 문장이 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredSentences().map((sentence) => (
                      <motion.div
                        key={sentence.id}
                        whileHover={{ scale: 1.02 }}
                        className={`relative p-4 rounded-xl transition-all border-2 ${
                          sentence.isLearned
                            ? 'bg-green-50 border-green-200'
                            : 'bg-orange-50 border-orange-200'
                        } ${
                          currentPlayingId === sentence.id.toString() ? 'ring-2 ring-orange-300' : ''
                        }`}
                      >
                        {/* Status Indicators */}
                        {sentence.isLearned && (
                          <div className="absolute top-3 left-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}

                        {recordedAudios[sentence.id.toString()] && (
                          <div className="absolute top-3 right-12 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">🎤</span>
                          </div>
                        )}

                        {/* Sentence Content */}
                        <div 
                          className="cursor-pointer hover:bg-white hover:bg-opacity-50 rounded-lg p-3 transition-colors min-h-[80px] flex items-center"
                          onClick={() => handleSentenceClick(sentence)}
                        >
                          <div className="text-center w-full">
                            <div className="text-lg font-semibold text-gray-800">{sentence.text}</div>
                          </div>
                        </div>
                        
                        {/* Recording Button */}
                        <div className="absolute bottom-3 right-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              
                              if (recordedAudios[sentence.id.toString()] && !isRecording) {
                                const audio = new Audio(recordedAudios[sentence.id.toString()]);
                                audio.play();
                                toast({
                                  title: "내 녹음 재생",
                                  description: "녹음된 음성을 재생합니다.",
                                });
                              } else {
                                handleSentenceRecording(sentence);
                              }
                            }}
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors shadow-md ${
                              isRecording && recordingSentenceId === sentence.id.toString()
                                ? 'bg-red-600 animate-pulse'
                                : recordedAudios[sentence.id.toString()]
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-red-500 hover:bg-red-600'
                            } text-white`}
                            title={
                              isRecording && recordingSentenceId === sentence.id.toString()
                                ? "녹음 중단"
                                : recordedAudios[sentence.id.toString()]
                                ? "내 녹음 듣기"
                                : "녹음하기"
                            }
                          >
                            <span className="text-xs">
                              {isRecording && recordingSentenceId === sentence.id.toString()
                                ? '⏹️'
                                : recordedAudios[sentence.id.toString()]
                                ? '▶️'
                                : '🎤'
                              }
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}