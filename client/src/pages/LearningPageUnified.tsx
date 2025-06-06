import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLearningStore } from '@/stores/learningStore';
import { useAuthStore } from '@/stores/authStore';
import { Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LearningPageUnified() {
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
    getFilteredWords,
    getFilteredSentences,
    addCoinsImmediately
  } = useLearningStore();

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
    if (currentPlayingId === word.id.toString()) return;
    
    setCurrentPlayingId(word.id.toString());
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    utterance.onend = () => {
      setCurrentPlayingId(null);
      addCoinsImmediately(1);
      learnWord(word.id);
      toast({
        title: "학습 완료!",
        description: `"${word.text}" 단어를 학습했습니다. +1 코인`,
      });
    };
    speechSynthesis.speak(utterance);
  };

  const handleSentenceClick = async (sentence: any) => {
    if (currentPlayingId === sentence.id.toString()) return;
    
    setCurrentPlayingId(sentence.id.toString());
    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    utterance.onend = () => {
      setCurrentPlayingId(null);
      addCoinsImmediately(3);
      learnSentence(sentence.id);
      toast({
        title: "학습 완료!",
        description: `"${sentence.text}" 문장을 학습했습니다. +3 코인`,
      });
    };
    speechSynthesis.speak(utterance);
  };

  const handleSentenceRecording = async (sentence: any) => {
    if (isRecording && recordingSentenceId === sentence.id.toString()) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setRecordingSentenceId(null);
        setMediaRecorder(null);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

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

  const handleStartLearning = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentPlayingId(null);
      toast({
        title: "재생 중단",
        description: "음성 재생이 중단되었습니다.",
      });
      return;
    }

    const wordsToPlay = words.slice(0, 10);
    const sentencesToPlay = sentences.slice(0, 3);
    const allItems = [...wordsToPlay, ...sentencesToPlay];
    
    if (allItems.length === 0) {
      toast({
        title: "알림",
        description: "재생할 학습 콘텐츠가 없습니다.",
      });
      return;
    }

    setIsPlaying(true);
    
    let currentIndex = 0;
    const playNext = () => {
      if (currentIndex < allItems.length) {
        const item = allItems[currentIndex];
        const isWord = currentIndex < wordsToPlay.length;
        
        setCurrentPlayingId(item.id.toString());
        
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.rate = 0.8;
        utterance.lang = 'en-US';
        
        utterance.onend = () => {
          if (isWord) {
            addCoinsImmediately(1);
            learnWord(item.id);
            toast({
              title: "학습 완료!",
              description: `"${item.text}" 단어를 학습했습니다. +1 코인`,
            });
          } else {
            addCoinsImmediately(3);
            learnSentence(item.id);
            toast({
              title: "학습 완료!",
              description: `"${item.text}" 문장을 학습했습니다. +3 코인`,
            });
          }
          
          currentIndex++;
          setTimeout(() => {
            if (currentIndex < allItems.length) {
              playNext();
            } else {
              setIsPlaying(false);
              setCurrentPlayingId(null);
              toast({
                title: "학습 완료!",
                description: "모든 학습 콘텐츠를 완료했습니다.",
              });
            }
          }, 500);
        };
        
        speechSynthesis.speak(utterance);
      }
    };

    playNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                LEVEL {selectedLevel || 1} - Day {selectedDay || currentDay}
              </h1>
              <p className="text-gray-600">
                오늘 학습: 단어 8개, 문장 3개
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



        {/* Content Section */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Start Button */}
          <div className="flex justify-end items-center mb-6">
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {words.slice(0, 10).map((word) => (
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
                    {word.isFavorite ? <Heart className="w-4 h-4 fill-red-500 text-red-500" /> : <Heart className="w-4 h-4 text-gray-400" />}
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
          </div>

          {/* Sentences Section */}
          <div className="mt-8 border-t-2 border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              Sentences
            </h3>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}