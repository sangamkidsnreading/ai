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
    userStats,
    currentDay,
    selectedLevel,
    selectedDay,
    learnWord,
    learnSentence,
    toggleFavorite,
    loadUserData,
    getFilteredWords,
    getFilteredSentences,
    addCoinsImmediately,
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
  const [playbackController, setPlaybackController] = useState<{ stop: () => void } | null>(null);

  // Get progress for the selected day, or current day if no specific day is selected
  const displayDay = selectedDay > 0 ? selectedDay : currentDay;
  const currentDayProgress = dayProgress.find(d => d.day === displayDay) || 
    { day: displayDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0, date: new Date().toISOString() };

  // Coin sound effect
  const playCoinSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 동전 소리 효과 (높은 음에서 낮은 음으로)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('오디오 컨텍스트 생성 실패:', error);
    }
  };

  // Speech synthesis function
  const speakText = (text: string, times: number = 3, wordId?: number) => {
    if ('speechSynthesis' in window) {
      let count = 0;
      const speak = () => {
        if (count < times) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.8;
          utterance.lang = 'en-US';
          utterance.onend = () => {
            count++;
            
            // 1번째 읽기 완료 시 코인과 소리 (개별 클릭)
            if (count === 1 && wordId) {
              playCoinSound();
              addCoinsImmediately(1);
              
              toast({
                title: "학습 완료!",
                description: `"${text}" 단어를 학습했습니다. +1 코인`,
              });
              
              // 백그라운드에서 서버 처리
              setTimeout(() => {
                learnWord(wordId).then(() => {
                  loadUserData();
                  console.log(`단어 학습 처리 완료: ${text}`);
                }).catch(error => {
                  console.error('단어 학습 처리 오류:', error);
                });
              }, 0);
            }
            
            if (count < times) {
              setTimeout(speak, 300);
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
    speakText(word.text, 3, word.id);
  };

  // Sentence click handler
  const handleSentenceClick = async (sentence: any) => {
    if (currentPlayingId === sentence.id.toString()) return;
    
    setCurrentPlayingId(sentence.id.toString());
    
    if ('speechSynthesis' in window) {
      let count = 0;
      const speak = () => {
        if (count < 3) {
          const utterance = new SpeechSynthesisUtterance(sentence.text);
          utterance.rate = 0.8;
          utterance.lang = 'en-US';
          utterance.onend = () => {
            count++;
            
            // 1번째 읽기 완료 시 코인과 소리 (개별 클릭)
            if (count === 1) {
              playCoinSound();
              addCoinsImmediately(3);
              
              toast({
                title: "학습 완료!",
                description: `"${sentence.text}" 문장을 학습했습니다. +3 코인`,
              });
              
              // 백그라운드에서 서버 처리
              setTimeout(() => {
                learnSentence(sentence.id).then(() => {
                  loadUserData();
                  console.log(`문장 학습 처리 완료: ${sentence.text}`);
                }).catch(error => {
                  console.error('문장 학습 처리 오류:', error);
                });
              }, 0);
            }
            
            if (count < 3) {
              setTimeout(speak, 300);
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

  // Play all function - 10개 단어를 각각 3번씩 읽기
  const handlePlayAll = () => {
    console.log('Start 버튼 클릭됨');
    
    if (isPlaying) {
      console.log('재생 중단');
      if (playbackController) {
        playbackController.stop();
      } else {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }
      toast({
        title: "재생 중단",
        description: "음성 재생이 중단되었습니다.",
      });
      return;
    }

    console.log('재생 시작');
    const items = activeSection === 'words' ? words.slice(0, 10) : sentences.slice(0, 10); // 10개만 선택
    console.log('재생할 아이템들:', items);
    
    if (items.length === 0) {
      console.log('재생할 단어가 없음');
      toast({
        title: "알림",
        description: "재생할 단어가 없습니다.",
      });
      return;
    }

    // 상태를 먼저 설정하고 약간의 지연 후에 재생 시작
    setIsPlaying(true);
    
    // React 상태 업데이트 완료를 위한 지연
    setTimeout(() => {
      let currentIndex = 0;
      let repeatCount = 0;
      let playingState = true; // 로컬 상태로 관리
      const maxRepeats = 3; // 각 단어를 3번씩 읽기

      // 정지 함수
      const stopPlaying = () => {
        playingState = false;
        speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentPlayingId(null);
        setPlaybackController(null);
      };

      // 컨트롤러 설정
      setPlaybackController({ stop: stopPlaying });

      const playNext = async () => {
        console.log(`playNext 호출됨 - currentIndex: ${currentIndex}, playingState: ${playingState}, items.length: ${items.length}`);
        
        if (currentIndex < items.length && playingState) {
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
          
          const utterance = new SpeechSynthesisUtterance(item.text);
          utterance.rate = 0.8;
          utterance.lang = 'en-US';
          
          utterance.onstart = () => {
            console.log(`음성 시작: ${item.text}`);
          };
          
          utterance.onend = () => {
            console.log(`음성 재생 완료: ${item.text}`);
            repeatCount++;
            
            // 1번 읽기 완료 후 학습 처리 및 코인 획득 (즉시 소리와 포인트)
            if (repeatCount === 1 && activeSection === 'words') {
              // 동시에 실행 - 지연 없음
              playCoinSound();
              addCoinsImmediately(1);
              
              toast({
                title: "학습 완료!",
                description: `"${item.text}" 단어를 학습했습니다. +1 코인`,
              });
              
              // 백그라운드에서 서버 처리
              setTimeout(() => {
                learnWord(item.id).then(() => {
                  loadUserData();
                  console.log(`단어 학습 처리 완료: ${item.text}`);
                }).catch(error => {
                  console.error('단어 학습 처리 오류:', error);
                });
              }, 0);
            }
            
            // 문장 학습 처리 (1번 읽기 완료 후 즉시 소리와 포인트)
            if (repeatCount === 1 && activeSection === 'sentences') {
              // 동시에 실행 - 지연 없음
              playCoinSound();
              addCoinsImmediately(3);
              
              toast({
                title: "학습 완료!",
                description: `"${item.text}" 문장을 학습했습니다. +3 코인`,
              });
              
              // 백그라운드에서 서버 처리
              setTimeout(() => {
                learnSentence(item.id).then(() => {
                  loadUserData();
                  console.log(`문장 학습 처리 완료: ${item.text}`);
                }).catch(error => {
                  console.error('문장 학습 처리 오류:', error);
                });
              }, 0);
            }
            
            if (repeatCount < maxRepeats && playingState) {
              // 같은 단어를 다시 읽기 (300ms 간격)
              setTimeout(() => {
                if (playingState) {
                  playNext();
                }
              }, 300);
            } else {
              // 다음 단어로 이동
              repeatCount = 0;
              currentIndex++;
              setTimeout(() => {
                if (currentIndex < items.length && playingState) {
                  playNext();
                } else {
                  console.log('모든 단어 재생 완료');
                  playingState = false;
                  setIsPlaying(false);
                  setCurrentPlayingId(null);
                  toast({
                    title: "학습 완료!",
                    description: `${items.length}개의 ${activeSection === 'words' ? '단어' : '문장'}를 모두 학습했습니다.`,
                  });
                }
              }, 500);
            }
          };
          
          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            // 에러 발생 시 자동으로 다음으로 넘어가기
            if (playingState) {
              repeatCount = 0;
              currentIndex++;
              setTimeout(() => {
                if (currentIndex < items.length && playingState) {
                  playNext();
                } else {
                  playingState = false;
                  setIsPlaying(false);
                  setCurrentPlayingId(null);
                }
              }, 500);
            }
          };
          
          console.log('speechSynthesis.speak 호출');
          speechSynthesis.speak(utterance);
        } else {
          console.log('playNext 조건 실패 - 재생 종료');
          playingState = false;
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      };

      console.log('playNext 함수 호출 시작');
      playNext();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 font-korean">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">LEVEL 1 - Day {currentDay}</h1>
            <p className="text-sm text-gray-600 mt-1">오늘 학습: 단어 {currentDayProgress.wordsLearned}개, 문장 {currentDayProgress.sentencesLearned}개</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">오늘 적립 코인</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{currentDayProgress.coinsEarned}</h2>
              <p className="text-sm text-green-600 font-medium">+15%</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section Toggle */}
      <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('words')}
            className={`p-6 rounded-xl transition-all ${
              activeSection === 'words'
                ? 'bg-purple-100'
                : 'bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-purple-700">Words</h3>
                <p className="text-sm text-purple-600">새로운 단어 5개와 문장 2개를 학습해보세요!</p>
              </div>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('sentences')}
            className={`p-6 rounded-xl transition-all ${
              activeSection === 'sentences'
                ? 'bg-green-100'
                : 'bg-green-50 hover:bg-green-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-green-700">Sentences</h3>
                <p className="text-sm text-green-600">구조한 학습이 성공의 열쇠입니다. 화이팅!</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>



      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeSection === 'words' && (
          <motion.div
            key="words"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Start Button */}
            <div className="mb-6 flex justify-end">
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAll}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isPlaying
                      ? 'bg-red-500 text-white'
                      : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      ⏹️ Stop
                    </>
                  ) : (
                    <>
                      ▶️ Start
                    </>
                  )}
                </motion.button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    {activeSection === 'words' 
                      ? '각 단어를 3번씩 읽어주며 단어당 10코인이 자동 적립됩니다'
                      : '각 문장을 3번씩 읽어주며 문장당 3코인이 자동 적립됩니다'
                    }
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>

            {getFilteredWords().length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">선택한 조건에 해당하는 단어가 없습니다.</p>
                <p className="text-sm mt-2">다른 레벨이나 Day를 선택해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {getFilteredWords().map((word) => (
                  <motion.div
                    key={word.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWordClick(word)}
                    className={`relative p-6 rounded-xl cursor-pointer transition-all card-hover bg-yellow-50 ${
                      currentPlayingId === word.id.toString() ? 'ring-4 ring-yellow-300' : ''
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



                    {/* Word */}
                    <div className="flex items-center justify-center h-full min-h-[80px]">
                      <div className="text-2xl font-bold text-gray-800 text-center">{word.text}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeSection === 'sentences' && (
          <motion.div
            key="sentences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-center mb-6">

              <div className="text-sm text-gray-600">
                {selectedLevel > 0 && `Level ${selectedLevel}`}
                {selectedLevel > 0 && selectedDay > 0 && ' - '}
                {selectedDay > 0 && `Day ${selectedDay}`}
                {selectedLevel === 0 && selectedDay === 0 && '모든 문장'}
              </div>
            </div>
            
            {getFilteredSentences().length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">선택한 조건에 해당하는 문장이 없습니다.</p>
                <p className="text-sm mt-2">다른 레벨이나 Day를 선택해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredSentences().map((sentence) => (
                  <motion.div
                    key={sentence.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSentenceClick(sentence)}
                    className={`relative p-6 rounded-xl cursor-pointer transition-all card-hover ${
                      sentence.isLearned
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100'
                        : 'bg-gradient-to-br from-orange-50 to-orange-100'
                    } ${
                      currentPlayingId === sentence.id.toString() ? 'ring-4 ring-orange-200' : ''
                    }`}
                  >


                    {/* Sentence */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-xl font-semibold text-gray-800">{sentence.text}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedDay > 0 ? `DAY ${selectedDay}` : `DAY ${currentDay}`} 학습 진도
        </h3>
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
