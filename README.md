# BangpanPRO — 방문판매 수당 관리 플랫폼

> 고성능 다용도 방판 수당전산. 유니레벨 · 바이너리 · 매트릭스 · 공유수당형 모두 지원.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Fonts**: Syne (Display) + Pretendard (Korean)

## 주요 기능

- ✅ 다양한 수당 플랜 지원 (유니레벨 / 바이너리 / 매트릭스 / 혼합 / 공유수당형)
- ✅ 유연한 수당 룰 엔진 (단계, 비율, 자격조건, 볼륨/수당 분리)
- ✅ 회원 트리 관리 (추천 계보, 배치 구조)
- ✅ 월별 정산 관리 및 지급 처리
- ✅ 원천징수 3.3% 자동 계산
- ✅ 관리자 대시보드
- ✅ 회원 포털 (내 수당, 내 조직, 쇼핑몰)
- 🔲 수당 시뮬레이터
- 🔲 조직도 시각화
- 🔲 지급명세서 PDF 출력

## 시작하기

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 편집

# 개발 서버
npm run dev
```

## 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_COMPANY_NAME=
```

## DB 설정

Supabase에서 `supabase/schema.sql` 실행

## 고객사 배포 체크리스트

- [ ] 레포 복사 (fork or clone)
- [ ] `.env.local` 회사 정보 입력
- [ ] Supabase 프로젝트 생성 + schema.sql 실행
- [ ] 직급 설정 (ranks 테이블)
- [ ] 수당 플랜 입력 (관리자 패널 > 수당 플랜)
- [ ] Vercel 배포
- [ ] 도메인 연결
