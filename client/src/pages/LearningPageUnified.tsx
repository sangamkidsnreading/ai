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
  const [recordingWordId, setRecordingWordId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudios, setRecordedAudios] = useState<{[key: string]: string}>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const totalCoins = userStats.totalCoins;
  const currentDayProgress = dayProgress.find(d => d.day === (selectedDay || currentDay)) || 
    { day: selectedDay || currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };

  // 일차별 동기부여 메시지
  const getMotivationalMessage = (day: number) => {
    const messages = [
      "오늘 첫날 시작이 반!! 화이팅 김학습자 💪",
      "오호 오늘도 들어왔네요. 30코인 이상이면 10코인이 더 적립되요 ✨",
      "벌써 3일째! 연속 학습 습관이 만들어지고 있어요 🔥",
      "4일째 접속! 꾸준함이 실력을 만듭니다 📈",
      "5일 연속 학습! 이제 진짜 학습자다운 모습이네요 🎯",
      "일주일의 시작! 이번 주도 열심히 해봐요 🌟",
      "일주일 완주 임박! 마지막 스퍼트 해봅시다 🚀",
      "와! 일주일 완주했어요. 정말 대단해요 🏆",
      "9일째 학습! 벌써 습관이 되었을 거예요 💎",
      "10일 돌파! 이제 진짜 영어 고수 되는 중 🎓",
      "11일째! 포기하지 않는 당신이 멋져요 👏",
      "12일 연속! 꾸준함의 힘을 보여주고 있어요 ⭐",
      "13일째! 불행의 숫자라도 학습은 계속 🍀",
      "2주 완주! 정말 놀라운 의지력이에요 🎊",
      "15일 돌파! 이제 학습이 생활의 일부가 됐네요 🌈"
    ];
    
    if (day <= messages.length) {
      return messages[day - 1];
    } else {
      const randomMessages = [
        `${day}일째 학습! 정말 대단한 끈기네요 🏅`,
        `벌써 ${day}일! 당신의 꾸준함에 박수를 👏`,
        `${day}일 연속! 영어 실력이 쑥쑥 늘고 있어요 📚`,
        `${day}일째 도전! 포기하지 않는 모습이 멋져요 💪`,
        `${day}일 달성! 이제 진짜 영어 마스터 되는 중 🌟`
      ];
      return randomMessages[day % randomMessages.length];
    }
  };

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

  const handleWordRecording = async (word: any) => {
    if (isRecording && recordingWordId === word.id.toString()) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setRecordingWordId(null);
        setMediaRecorder(null);
      }
      return;
    }

    if (isRecording) {
      toast({
        title: "이미 녹음 중",
        description: "다른 항목을 녹음하고 있습니다.",
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

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordedAudios(prev => ({
          ...prev,
          [`word_${word.id.toString()}`]: audioUrl
        }));

        toast({
          title: "녹음 완료",
          description: `"${word.text}" 녹음이 완료되었습니다.`,
        });

        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingWordId(word.id.toString());
      recorder.start();
      
      toast({
        title: "녹음 시작",
        description: `"${word.text}" 녹음을 시작합니다.`,
      });

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "녹음 오류",
        description: "마이크 접근 권한을 확인해주세요.",
      });
    }
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
        description: "다른 항목을 녹음하고 있습니다.",
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

      recorder.onstop = async () => {
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

  const handleStartWords = () => {
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
    
    if (wordsToPlay.length === 0) {
      toast({
        title: "알림",
        description: "재생할 단어가 없습니다.",
      });
      return;
    }

    setIsPlaying(true);
    let currentIndex = 0;

    const playNextWord = () => {
      if (currentIndex >= wordsToPlay.length) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        toast({
          title: "재생 완료",
          description: "모든 단어 재생이 완료되었습니다.",
        });
        return;
      }

      const currentWord = wordsToPlay[currentIndex];
      setCurrentPlayingId(currentWord.id.toString());
      
      const utterance = new SpeechSynthesisUtterance(currentWord.text);
      utterance.rate = 0.8;
      utterance.lang = 'en-US';
      utterance.onend = () => {
        currentIndex++;
        setTimeout(playNextWord, 1000); // 1초 간격
      };
      
      speechSynthesis.speak(utterance);
    };

    playNextWord();
  };

  const handleStartSentences = () => {
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

    const sentencesToPlay = sentences.slice(0, 3);
    
    if (sentencesToPlay.length === 0) {
      toast({
        title: "알림",
        description: "재생할 문장이 없습니다.",
      });
      return;
    }

    setIsPlaying(true);
    let currentIndex = 0;

    const playNextSentence = () => {
      if (currentIndex >= sentencesToPlay.length) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        toast({
          title: "재생 완료",
          description: "모든 문장 재생이 완료되었습니다.",
        });
        return;
      }

      const currentSentence = sentencesToPlay[currentIndex];
      setCurrentPlayingId(currentSentence.id.toString());
      
      const utterance = new SpeechSynthesisUtterance(currentSentence.text);
      utterance.rate = 0.8;
      utterance.lang = 'en-US';
      utterance.onend = () => {
        currentIndex++;
        setTimeout(playNextSentence, 1500); // 1.5초 간격
      };
      
      speechSynthesis.speak(utterance);
    };

    playNextSentence();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Top Stats Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Level {selectedLevel || 1} - Day {selectedDay || currentDay}
              </h1>
              <p className="text-gray-600">
                오늘 학습: 단어 {currentDayProgress.wordsLearned}개, 문장 {currentDayProgress.sentencesLearned}개
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">오늘 획득한 코인</div>
                <div className="text-2xl font-bold text-yellow-600">
                  🪙 {totalCoins}
                </div>
              </div>
            </div>
          </div>
          
          {/* 동기부여 메시지 */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="text-center text-gray-700 font-medium">
              {getMotivationalMessage(selectedDay || currentDay)}
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
              onClick={handleStartWords}
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
                      {word.isFavorite ? <Heart className="w-4 h-4 fill-red-500 text-red-500" /> : <Heart className="w-4 h-4 text-gray-400" />}
                    </button>

                    {/* Learned Check */}
                    {word.isLearned && (
                      <div className="absolute top-1 left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}

                    {/* Recording Indicator */}
                    {recordedAudios[`word_${word.id.toString()}`] && (
                      <div className="absolute top-8 left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🎤</span>
                      </div>
                    )}

                    {/* Word Content */}
                    <div className="text-center mt-3">
                      <div className="text-lg font-bold text-gray-800 mb-1">{word.text}</div>
                      <div className="text-xs text-gray-600">{word.meaning}</div>
                    </div>

                    {/* Word Recording Button */}
                    <div className="absolute bottom-1 right-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          if (recordedAudios[`word_${word.id.toString()}`] && !isRecording) {
                            const audio = new Audio(recordedAudios[`word_${word.id.toString()}`]);
                            audio.play();
                            toast({
                              title: "내 녹음 재생",
                              description: "녹음된 음성을 재생합니다.",
                            });
                          } else {
                            handleWordRecording(word);
                          }
                        }}
                        className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors shadow-md text-xs ${
                          isRecording && recordingWordId === word.id.toString()
                            ? 'bg-red-600 animate-pulse'
                            : recordedAudios[`word_${word.id.toString()}`]
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white`}
                        title={
                          isRecording && recordingWordId === word.id.toString()
                            ? "녹음 중단"
                            : recordedAudios[`word_${word.id.toString()}`]
                            ? "내 녹음 듣기"
                            : "녹음하기"
                        }
                      >
                        {isRecording && recordingWordId === word.id.toString()
                          ? "⏹️"
                          : recordedAudios[`word_${word.id.toString()}`]
                          ? "▶️"
                          : "🎤"
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sentences Section */}
          <div className="mt-8 border-t-2 border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-700 flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                Sentences
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartSentences}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isPlaying
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
                }`}
              >
                {isPlaying ? '⏹️ Stop' : '🎯 Start'}
              </motion.button>
            </div>
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
                          setPlayingAudioId(sentence.id.toString());
                          
                          audio.onended = () => {
                            setPlayingAudioId(null);
                            toast({
                              title: "재생 완료",
                              description: "녹음 재생이 완료되었습니다.",
                            });
                          };
                          
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
                          : playingAudioId === sentence.id.toString()
                          ? 'bg-blue-500 animate-pulse'
                          : recordedAudios[sentence.id.toString()]
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                      } text-white`}
                      title={
                        isRecording && recordingSentenceId === sentence.id.toString()
                          ? "녹음 중단"
                          : playingAudioId === sentence.id.toString()
                          ? "재생 중..."
                          : recordedAudios[sentence.id.toString()]
                          ? "내 녹음 듣기"
                          : "녹음하기"
                      }
                    >
                      <span className="text-xs">
                        {isRecording && recordingSentenceId === sentence.id.toString()
                          ? '⏹️'
                          : playingAudioId === sentence.id.toString()
                          ? '🔊'
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