import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useLearningStore } from '@/stores/learningStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { currentUser } = useAuthStore();
  const { userStats, loadUserData } = useLearningStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [preferences, setPreferences] = useState({
    speechRate: '0.8',
    repeatCount: '3',
    notifications: true,
  });

  const [avatarImage, setAvatarImage] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setAvatarImage(currentUser.avatar || '');
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/users/${currentUser?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: avatarImage,
        }),
      });

      if (response.ok) {
        toast({
          title: "프로필 업데이트 완료",
          description: "프로필 정보가 성공적으로 업데이트되었습니다.",
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "업데이트 실패",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real app, this would call an API to change the password
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast({
        title: "비밀번호 변경 실패",
        description: "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const recentBadges = userStats.badges.filter(badge => badge.earned).slice(-3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 font-korean">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">프로필 관리</h1>
        <p className="text-gray-600">내 정보를 확인하고 설정을 변경하세요</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="space-y-2">
                    <Label>프로필 사진</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                        {avatarImage ? (
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          currentUser?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="w-full"
                        >
                          사진 변경
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">역할</Label>
                    <Input
                      id="role"
                      value={currentUser?.role === 'admin' ? '관리자' : '학생'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                    정보 업데이트
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">현재 비밀번호</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
                    비밀번호 변경
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>학습 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speechRate">음성 재생 속도</Label>
                  <Select value={preferences.speechRate} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, speechRate: value }))
                  }>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.8">0.8x</SelectItem>
                      <SelectItem value="1.0">1.0x</SelectItem>
                      <SelectItem value="1.2">1.2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="repeatCount">단어 반복 횟수</Label>
                  <Select value={preferences.repeatCount} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, repeatCount: value }))
                  }>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1회</SelectItem>
                      <SelectItem value="2">2회</SelectItem>
                      <SelectItem value="3">3회</SelectItem>
                      <SelectItem value="5">5회</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">알림 설정</Label>
                  <Switch
                    id="notifications"
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardContent className="text-center pt-6">
                <div className="w-24 h-24 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-3xl">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{currentUser?.name}</h3>
                <p className="text-gray-600 mb-4">Level {userStats.currentLevel} 학습자</p>
                <Button variant="outline" className="text-purple-600">
                  아바타 변경
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>학습 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 학습 일수</span>
                  <span className="font-semibold">{userStats.streak}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">연속 학습</span>
                  <span className="font-semibold">{userStats.streak}일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 단어</span>
                  <span className="font-semibold">{userStats.totalWordsLearned}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 문장</span>
                  <span className="font-semibold">{userStats.totalSentencesLearned}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 코인</span>
                  <span className="font-semibold text-yellow-600">{userStats.totalCoins}개</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>최근 획득 뱃지</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentBadges.length > 0 ? (
                  recentBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">아직 획득한 뱃지가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
