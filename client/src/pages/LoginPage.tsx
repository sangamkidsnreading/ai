import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          toast({
            title: "로그인 성공",
            description: "키리보카에 오신 것을 환영합니다!",
          });
        } else {
          toast({
            title: "로그인 실패",
            description: "이메일 또는 비밀번호가 올바르지 않습니다.",
            variant: "destructive",
          });
        }
      } else {
        const success = await register({
          ...formData,
          role: 'student',
        });
        if (success) {
          toast({
            title: "회원가입 성공",
            description: "이제 로그인하실 수 있습니다.",
          });
          setIsLogin(true);
        } else {
          toast({
            title: "회원가입 실패",
            description: "이미 존재하는 사용자이거나 잘못된 정보입니다.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4 font-korean">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">키</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              키리보카에 오신 것을 환영합니다
            </CardTitle>
            <CardDescription>
              영어 단어와 문장을 재미있게 학습하세요
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">사용자명</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="username"
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full gradient-bg hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
              </Button>
            </form>
            
            <p className="text-center text-gray-600 mt-4">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 font-semibold hover:underline ml-1"
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
            
            {/* Demo accounts info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">데모 계정</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>학생:</strong> student@kiriboka.com / student123</p>
                <p><strong>관리자:</strong> admin@kiriboka.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
