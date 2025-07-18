import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Users, 
  Book, 
  MessageSquare, 
  Activity,
  Edit,
  Trash2,
  Plus,
  Search,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
}

interface Word {
  id: number;
  text: string;
  level: number;
  day: number;
  audioUrl?: string;
}

interface Sentence {
  id: number;
  text: string;
  level: number;
  day: number;
  audioUrl?: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);
  const [isAddSentenceOpen, setIsAddSentenceOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'student'
  });

  const [newWord, setNewWord] = useState({
    text: '',
    level: 1,
    day: 1,
    audioUrl: ''
  });

  const [newSentence, setNewSentence] = useState({
    text: '',
    level: 1,
    day: 1,
    audioUrl: ''
  });

  // Fetch users
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch words
  const { data: words = [], refetch: refetchWords } = useQuery({
    queryKey: ['/api/words'],
    queryFn: async () => {
      const response = await fetch('/api/words');
      if (!response.ok) throw new Error('Failed to fetch words');
      return response.json();
    }
  });

  // Fetch sentences
  const { data: sentences = [], refetch: refetchSentences } = useQuery({
    queryKey: ['/api/sentences'],
    queryFn: async () => {
      const response = await fetch('/api/sentences');
      if (!response.ok) throw new Error('Failed to fetch sentences');
      return response.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "사용자 생성 완료",
        description: "새 사용자가 성공적으로 생성되었습니다.",
      });
      setNewUser({ name: '', email: '', username: '', password: '', role: 'student' });
      setIsAddUserOpen(false);
      refetchUsers();
    },
    onError: () => {
      toast({
        title: "사용자 생성 실패",
        description: "사용자 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "사용자 삭제 완료",
        description: "사용자가 성공적으로 삭제되었습니다.",
      });
      refetchUsers();
    },
    onError: () => {
      toast({
        title: "사용자 삭제 실패",
        description: "사용자 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // Create word mutation
  const createWordMutation = useMutation({
    mutationFn: async (wordData: typeof newWord) => {
      const response = await apiRequest('POST', '/api/words', wordData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "단어 추가 완료",
        description: "새 단어가 성공적으로 추가되었습니다.",
      });
      setNewWord({ text: '', level: 1, day: 1, audioUrl: '' });
      setIsAddWordOpen(false);
      refetchWords();
    },
    onError: () => {
      toast({
        title: "단어 추가 실패",
        description: "단어 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // Delete word mutation
  const deleteWordMutation = useMutation({
    mutationFn: async (wordId: number) => {
      await apiRequest('DELETE', `/api/words/${wordId}`);
    },
    onSuccess: () => {
      toast({
        title: "단어 삭제 완료",
        description: "단어가 성공적으로 삭제되었습니다.",
      });
      refetchWords();
    },
    onError: () => {
      toast({
        title: "단어 삭제 실패",
        description: "단어 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // Create sentence mutation
  const createSentenceMutation = useMutation({
    mutationFn: async (sentenceData: typeof newSentence) => {
      const response = await apiRequest('POST', '/api/sentences', sentenceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "문장 추가 완료",
        description: "새 문장이 성공적으로 추가되었습니다.",
      });
      setNewSentence({ text: '', level: 1, day: 1, audioUrl: '' });
      setIsAddSentenceOpen(false);
      refetchSentences();
    },
    onError: () => {
      toast({
        title: "문장 추가 실패",
        description: "문장 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  // Delete sentence mutation
  const deleteSentenceMutation = useMutation({
    mutationFn: async (sentenceId: number) => {
      await apiRequest('DELETE', `/api/sentences/${sentenceId}`);
    },
    onSuccess: () => {
      toast({
        title: "문장 삭제 완료",
        description: "문장이 성공적으로 삭제되었습니다.",
      });
      refetchSentences();
    },
    onError: () => {
      toast({
        title: "문장 삭제 실패",
        description: "문장 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWords = words.filter((word: Word) =>
    word.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSentences = sentences.filter((sentence: Sentence) =>
    sentence.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: '총 사용자',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: '총 단어',
      value: words.length,
      icon: Book,
      color: 'bg-green-500',
    },
    {
      title: '총 문장',
      value: sentences.length,
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
    {
      title: '활성 사용자',
      value: users.filter((user: User) => user.role === 'student').length,
      icon: Activity,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6 font-korean">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">사용자 및 콘텐츠를 관리하세요</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Management Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg"
      >
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="words">단어 관리</TabsTrigger>
            <TabsTrigger value="sentences">문장 관리</TabsTrigger>
            <TabsTrigger value="settings">학습 설정</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">사용자 관리</h3>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    새 사용자 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 사용자 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userName">이름</Label>
                      <Input
                        id="userName"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="사용자 이름"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">이메일</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">사용자명</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userPassword">비밀번호</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="비밀번호"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userRole">역할</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">학생</SelectItem>
                          <SelectItem value="admin">관리자</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => createUserMutation.mutate(newUser)}
                      disabled={createUserMutation.isPending}
                      className="w-full"
                    >
                      {createUserMutation.isPending ? '생성 중...' : '사용자 생성'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((user: User) => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.role === 'admin' ? '관리자' : '학생'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                      disabled={deleteUserMutation.isPending}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Words Tab */}
          <TabsContent value="words" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">단어 관리</h3>
              <Dialog open={isAddWordOpen} onOpenChange={setIsAddWordOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    단어 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 단어 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="wordText">단어</Label>
                      <Input
                        id="wordText"
                        value={newWord.text}
                        onChange={(e) => setNewWord(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="영어 단어"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wordLevel">레벨</Label>
                      <Select value={newWord.level.toString()} onValueChange={(value) => setNewWord(prev => ({ ...prev, level: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
                          <SelectItem value="3">Level 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="wordDay">Day</Label>
                      <Select value={newWord.day.toString()} onValueChange={(value) => setNewWord(prev => ({ ...prev, day: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 50 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>Day {day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="wordAudio">음성 파일</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-gray-600">파일 업로드</Label>
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Create a URL for the uploaded file
                                const audioUrl = URL.createObjectURL(file);
                                setNewWord(prev => ({ ...prev, audioUrl }));
                              }
                            }}
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">또는</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">URL 입력</Label>
                          <Input
                            id="wordAudio"
                            value={newWord.audioUrl}
                            onChange={(e) => setNewWord(prev => ({ ...prev, audioUrl: e.target.value }))}
                            placeholder="https://example.com/audio.mp3"
                          />
                        </div>
                        {newWord.audioUrl && (
                          <div className="mt-2">
                            <Label className="text-sm text-gray-600">미리보기</Label>
                            <audio controls className="w-full mt-1">
                              <source src={newWord.audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => createWordMutation.mutate(newWord)}
                      disabled={createWordMutation.isPending}
                      className="w-full"
                    >
                      {createWordMutation.isPending ? '추가 중...' : '단어 추가'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {filteredWords.map((word: Word) => (
                <div key={word.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">{word.text}</div>
                    <div className="text-sm text-gray-600">Level {word.level}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWordMutation.mutate(word.id)}
                      disabled={deleteWordMutation.isPending}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sentences Tab */}
          <TabsContent value="sentences" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">문장 관리</h3>
              <Dialog open={isAddSentenceOpen} onOpenChange={setIsAddSentenceOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    문장 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 문장 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sentenceText">문장</Label>
                      <Input
                        id="sentenceText"
                        value={newSentence.text}
                        onChange={(e) => setNewSentence(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="영어 문장"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sentenceLevel">레벨</Label>
                      <Select value={newSentence.level.toString()} onValueChange={(value) => setNewSentence(prev => ({ ...prev, level: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Level 1</SelectItem>
                          <SelectItem value="2">Level 2</SelectItem>
                          <SelectItem value="3">Level 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sentenceDay">Day</Label>
                      <Select value={newSentence.day.toString()} onValueChange={(value) => setNewSentence(prev => ({ ...prev, day: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 50 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>Day {day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sentenceAudio">음성 파일</Label>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-gray-600">파일 업로드</Label>
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Create a URL for the uploaded file
                                const audioUrl = URL.createObjectURL(file);
                                setNewSentence(prev => ({ ...prev, audioUrl }));
                              }
                            }}
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">또는</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">URL 입력</Label>
                          <Input
                            id="sentenceAudio"
                            value={newSentence.audioUrl}
                            onChange={(e) => setNewSentence(prev => ({ ...prev, audioUrl: e.target.value }))}
                            placeholder="https://example.com/audio.mp3"
                          />
                        </div>
                        {newSentence.audioUrl && (
                          <div className="mt-2">
                            <Label className="text-sm text-gray-600">미리보기</Label>
                            <audio controls className="w-full mt-1">
                              <source src={newSentence.audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => createSentenceMutation.mutate(newSentence)}
                      disabled={createSentenceMutation.isPending}
                      className="w-full"
                    >
                      {createSentenceMutation.isPending ? '추가 중...' : '문장 추가'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {filteredSentences.map((sentence: Sentence) => (
                <div key={sentence.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">{sentence.text}</div>
                    <div className="text-sm text-gray-600">Level {sentence.level}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSentenceMutation.mutate(sentence.id)}
                      disabled={deleteSentenceMutation.isPending}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Learning Settings Tab */}
          <TabsContent value="settings" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">학습 설정</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Speech Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>음성 설정</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>기본 음성 속도</Label>
                      <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                        <option value="0.5">0.5x (느리게)</option>
                        <option value="0.8" selected>0.8x (권장)</option>
                        <option value="1.0">1.0x (보통)</option>
                        <option value="1.2">1.2x (빠르게)</option>
                      </select>
                    </div>
                    <div>
                      <Label>기본 반복 횟수</Label>
                      <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                        <option value="1">1회</option>
                        <option value="2">2회</option>
                        <option value="3" selected>3회 (권장)</option>
                        <option value="5">5회</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Reward Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>보상 설정</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>단어 학습 코인</Label>
                      <Input type="number" defaultValue="1" className="mt-1" />
                    </div>
                    <div>
                      <Label>문장 학습 코인</Label>
                      <Input type="number" defaultValue="3" className="mt-1" />
                    </div>
                    <div>
                      <Label>연속 학습 보너스</Label>
                      <Input type="number" defaultValue="5" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">7일 연속 학습 시 추가 코인</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Level Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>레벨 설정</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>레벨 업 필요 코인</Label>
                      <Input type="number" defaultValue="100" className="mt-1" />
                    </div>
                    <div>
                      <Label>최대 레벨</Label>
                      <Input type="number" defaultValue="10" className="mt-1" />
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle>일일 목표</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>일일 단어 목표</Label>
                      <Input type="number" defaultValue="10" className="mt-1" />
                    </div>
                    <div>
                      <Label>일일 문장 목표</Label>
                      <Input type="number" defaultValue="5" className="mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button className="bg-green-500 hover:bg-green-600">
                  설정 저장
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
