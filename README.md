# 🎵 Vibe Guys - Frontend

바이브가이즈 프로젝트의 프론트엔드 저장소입니다.  
사용자에게 세련된 UI와 매끄러운 경험을 제공하기 위해 최신 스택으로 구축되었습니다.

## 🚀 주요 기술 스택

- **Core**: React 19, TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Network**: Axios
- **Routing**: React Router Dom 7

## 🛠️ 시작하기 (Installation)

이 프로젝트는 패키지 매니저로 `pnpm`을 사용합니다. 프로젝트가 설치되어 있지 않다면 먼저 `pnpm`을 설치해 주세요 (`npm i -g pnpm`).

1. **저장소 클론**
   ```bash
   git clone https://github.com/Legend-Vibe-Guys/Frontend
   ```

2. **패키지 설치**
   ```bash
   pnpm install
   ```

3. **환경 변수 설정 (.env)**
   프로젝트 루트에 위치한 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
   ```bash
   cp .env.example .env
   ```
   생성된 `.env` 파일에 Firebase 연동 키 값 등 필요한 환경 변수를 채워 넣어주세요.

4. **로컬 개발 서버 실행**
   ```bash
   pnpm dev
   ```
   - 서버가 실행되면 터미널에 표시된 `Local` 주소(보통 `http://localhost:5173`)로 접속하세요.

## 📁 프로젝트 구조

핵심 개발 코드는 `src` 폴더 내부에서 관리됩니다.

```text
src/
├── 📁 api/          # API 서버 통신 로직 (Axios 등)
├── 📁 components/   # 공통 UI 및 재사용 컴포넌트
├── 📁 constants/    # 상수 값 및 Mock 데이터 관리
├── 📁 hooks/        # 전역 커스텀 훅
├── 📁 pages/        # 라우트별 페이지 컴포넌트
│   ├── 📁 auth/     # 인증 (로그인 등)
│   ├── 📁 parent/   # 학부모용 기능
│   └── 📁 teacher/  # 교사용 기능 (출석, 알림장 등)
├── 📁 router/       # 라우터 설정 및 경로(Path) 정의
├── 📁 store/        # 전역 상태 관리 (Context API)
├── 📁 types/        # TypeScript 타입 정의
├── 📁 utils/        # 공통 유틸리티 함수 (날짜 포맷팅 등)
└── 📄 App.tsx       # 애플리케이션 최상위 컴포넌트
```
