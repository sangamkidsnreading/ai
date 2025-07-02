# 키리보카 Railway 배포 가이드

## 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 새 저장소 생성 (Public 또는 Private)
3. 저장소 이름: `kiriboca-app`

## 2. 코드 업로드

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/[사용자명]/kiriboca-app.git
git push -u origin main
```

## 3. Railway 배포

1. Railway.app 방문
2. GitHub로 로그인
3. "New Project" → "Deploy from GitHub repo"
4. 키리보카 저장소 선택
5. 자동 배포 시작

## 4. 환경변수 설정

Railway 대시보드에서 Variables 탭:

```
NODE_ENV=production
SESSION_SECRET=랜덤한-긴-문자열-생성
```

## 5. 데이터베이스 추가

1. Railway 프로젝트에서 "Add Service"
2. "PostgreSQL" 선택
3. 자동으로 DATABASE_URL 환경변수 생성됨

## 6. 배포 완료

- 약 5-10분 후 배포 완료
- Railway에서 제공하는 URL로 접속 가능
- 예: `https://kiriboca-app-production.up.railway.app`

## 비용

- 시작: $5/월
- 사용자 증가 시: 사용량에 따라 증가
- 무료 크레딧: $5 제공 (첫 달 무료)

## 문제 해결

**배포 실패 시:**
1. Railway 로그 확인
2. package.json의 start 스크립트 확인
3. 환경변수 설정 확인

**데이터베이스 연결 실패 시:**
1. DATABASE_URL 환경변수 확인
2. PostgreSQL 서비스 상태 확인