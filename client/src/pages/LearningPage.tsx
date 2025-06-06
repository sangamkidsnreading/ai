import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [playbackController, setPlaybackController] = useState<{ stop: () => void } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSentenceId, setRecordingSentenceId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudios, setRecordedAudios] = useState<{[key: string]: string}>({});

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

  // Recording functionality
  const handleSentenceRecording = async (sentence: any) => {
    if (isRecording && recordingSentenceId === sentence.id.toString()) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setRecordingSentenceId(null);
        setMediaRecorder(null);
        
        toast({
          title: "녹음 중단",
          description: "녹음이 중단되었습니다.",
        });
      }
      return;
    }

    if (isRecording) {
      toast({
        title: "이미 녹음 중",
        description: "다른 문장을 녹음하고 있습니다.",
      });
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Save the recorded audio for this sentence
        setRecordedAudios(prev => ({
          ...prev,
          [sentence.id.toString()]: audioUrl
        }));

        toast({
          title: "녹음 완료",
          description: `"${sentence.text}" 녹음이 완료되었습니다.`,
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingSentenceId(sentence.id.toString());
      
      recorder.start();
      
      toast({
        title: "녹음 시작",
        description: `"${sentence.text}" 녹음을 시작합니다.`,
      });

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "녹음 오류",
        description: "마이크 접근 권한을 확인해주세요.",
      });
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
            
            // 1번째 읽기 완료 시 코인과 소리 (개별 클릭) - 이미 학습된 단어도 포함
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
            
            // 1번째 읽기 완료 시 코인과 소리 (개별 클릭) - 이미 학습된 문장도 포함
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

  // Start learning handler
  const handleStartLearning = () => {
    if (isPlaying) {
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

    // Combine words and sentences for unified playback
    const wordsToPlay = getFilteredWords().slice(0, 10);
    const sentencesToPlay = getFilteredSentences().slice(0, 3);
    const allItems = [...wordsToPlay, ...sentencesToPlay];
    
    if (allItems.length === 0) {
      toast({
        title: "알림",
        description: "재생할 학습 콘텐츠가 없습니다.",
      });
      return;
    }

    setIsPlaying(true);
    
    setTimeout(() => {
      let currentIndex = 0;
      let repeatCount = 0;
      let playingState = true;
      const maxRepeats = 3;

      const stopPlaying = () => {
        playingState = false;
        speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentPlayingId(null);
        setPlaybackController(null);
      };

      setPlaybackController({ stop: stopPlaying });

      const playNext = async () => {
        if (currentIndex < allItems.length && playingState) {
          const item = allItems[currentIndex];
          const isWord = currentIndex < wordsToPlay.length;
          
          setCurrentPlayingId(item.id.toString());
          
          const utterance = new SpeechSynthesisUtterance(item.text);
          utterance.rate = 0.8;
          utterance.lang = 'en-US';
          
          utterance.onend = () => {
            repeatCount++;
            
            if (repeatCount < maxRepeats && playingState) {
              setTimeout(() => {
                if (playingState) {
                  playNext();
                }
              }, 300);
            } else {
              // 3번 읽기 완료 - 코인과 소리 적립
              if (isWord) {
                playCoinSound();
                addCoinsImmediately(1);
                
                toast({
                  title: "학습 완료!",
                  description: `"${item.text}" 단어를 학습했습니다. +1 코인`,
                });
                
                setTimeout(() => {
                  learnWord(item.id).then(() => {
                    loadUserData();
                  }).catch(console.error);
                }, 0);
              } else {
                playCoinSound();
                addCoinsImmediately(3);
                
                toast({
                  title: "학습 완료!",
                  description: `"${item.text}" 문장을 학습했습니다. +3 코인`,
                });
                
                setTimeout(() => {
                  learnSentence(item.id).then(() => {
                    loadUserData();
                  }).catch(console.error);
                }, 0);
              }
              
              repeatCount = 0;
              currentIndex++;
              setTimeout(() => {
                if (currentIndex < allItems.length && playingState) {
                  playNext();
                } else {
                  playingState = false;
                  setIsPlaying(false);
                  setCurrentPlayingId(null);
                  toast({
                    title: "학습 완료!",
                    description: `모든 학습 콘텐츠를 완료했습니다.`,
                  });
                }
              }, 500);
            }
          };
          
          speechSynthesis.speak(utterance);
        }
      };

      playNext();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Compact Header */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-sm mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                키리보카 학습
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Level {selectedLevel || 1} - Day {displayDay}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">오늘 획득한 코인</div>
                <div className="text-2xl font-bold text-yellow-600">
                  🪙 {userStats.totalCoins}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Combined Section Headers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h3 className="font-bold text-purple-700">Words</h3>
                <p className="text-xs text-purple-600">오늘의 단어 10개를 학습해보세요!</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h3 className="font-bold text-green-700">Sentences</h3>
                <p className="text-xs text-green-600">오늘의 문장 3개를 학습해보세요!</p>
              </div>
            </div>
          </div>
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

          {/* Words Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              Words
            </h3>
            {getFilteredWords().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>선택한 조건에 해당하는 단어가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {getFilteredWords().slice(0, 10).map((word) => (
                  <motion.div
                    key={word.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWordClick(word)}
                    className={`relative p-3 rounded-xl cursor-pointer transition-all bg-yellow-50 border-2 ${
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
                      className="absolute top-1 right-1 text-sm"
                    >
                      {word.isFavorite ? '❤️' : '🤍'}
                    </button>

                    {/* Learned Check */}
                    {word.isLearned && (
                      <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}

                    {/* Word Content */}
                    <div className="text-center mt-3">
                      <div className="text-lg font-bold text-gray-800 mb-1">{word.text}</div>
                      <div className="text-xs text-gray-600">{word.meaning}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sentences Section */}
          <div className="mt-8 border-t-2 border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              Sentences (문장 섹션이 여기 있습니다!)
            </h3>
            {sentences.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>문장이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sentences.slice(0, 3).map((sentence) => (
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
                        <div className="text-base font-semibold text-gray-800">{sentence.text}</div>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}