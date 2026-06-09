-- =============================================
-- 수당 플랜 업데이트 — 판권/관리비용 구조
-- 기존 seed_plan.sql 실행 후 이 파일 실행
-- =============================================

-- ① 직급 승급 조건 업데이트
UPDATE ranks SET
  min_gv = 10000000,  -- 멤버→매니저: 누적 창업비 1,000만원
  min_direct_referral = 0,
  color = '#6B7280'
WHERE code = 'MEMBER';

UPDATE ranks SET
  min_gv = 20000000,  -- 매니저→디렉터: 산하 누적 2,000만원
  min_direct_referral = 3,
  color = '#378ADD'
WHERE code = 'MANAGER';

UPDATE ranks SET
  min_gv = 0,
  min_direct_referral = 0,
  color = '#E8599A'
WHERE code = 'DIRECTOR';

-- ② 수당 플랜명 업데이트
UPDATE commission_plans
  SET name = '온종일 프로젝트 방판 플랜',
      description = '판권(소개수수료) + 관리비용(오버라이드) 구조 | 멤버54% / 관리자55%'
WHERE id = 'bb000001-0000-0000-0000-000000000001';

-- ③ 판권 (소개수수료) — 직급별 차등
--    멤버 5% / 매니저 25% / 디렉터 32%
UPDATE commission_rules
  SET name = '판권 (소개수수료)', value = NULL
WHERE id = 'cc000001-0000-0000-0000-000000000001';
-- depth 0 (본인 수당) → 0%로 초기화 (판권은 추천자가 받으므로)
-- 기존 tiers 삭제 후 재삽입
DELETE FROM commission_tiers WHERE rule_id = 'cc000001-0000-0000-0000-000000000001';

-- depth 1 (추천자 판권) 업데이트
UPDATE commission_rules
  SET name = '판권 (소개수수료)', calc_type = 'TIER'
WHERE id = 'cc000001-0000-0000-0000-000000000002';

-- 기존 tiers 업데이트
UPDATE commission_tiers SET rate = 5.0000
  WHERE rule_id = 'cc000001-0000-0000-0000-000000000002' AND rank_level = 1;  -- 멤버 5%

UPDATE commission_tiers SET rate = 25.0000
  WHERE rule_id = 'cc000001-0000-0000-0000-000000000002' AND rank_level = 2;  -- 매니저 25%

UPDATE commission_tiers SET rate = 32.0000
  WHERE rule_id = 'cc000001-0000-0000-0000-000000000002' AND rank_level = 3;  -- 디렉터 32%

-- ④ 관리비용 (오버라이드) — 팀원 판권 수익의 10%
--    기존 MATCHING rule 재활용 또는 신규 추가
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000008',
   'bb000001-0000-0000-0000-000000000001',
   '관리비용 (오버라이드)', 'MATCHING', 1, 1, 'PERCENT', 10.0000, 'PRICE', 2, 25)
ON CONFLICT (id) DO UPDATE SET
  name = '관리비용 (오버라이드)', value = 10.0000;

-- ⑤ 패스트 스타트 — 직급별 차등 (매니저 3% / 디렉터 5%)
UPDATE commission_rules
  SET name = '패스트 스타트 보너스', calc_type = 'TIER', value = NULL
WHERE id = 'cc000001-0000-0000-0000-000000000003';

DELETE FROM commission_tiers WHERE rule_id = 'cc000001-0000-0000-0000-000000000003';
INSERT INTO commission_tiers (rule_id, rank_id, rank_level, rate) VALUES
  ('cc000001-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000001', 1, 0.0000),   -- 멤버 0%
  ('cc000001-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000002', 2, 3.0000),   -- 매니저 3%
  ('cc000001-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000003', 3, 5.0000);   -- 디렉터 5%

-- ⑥ 팀원 첫모집 보너스 — 직급별 차등 (매니저 2% / 디렉터 3%)
UPDATE commission_rules
  SET name = '팀원 첫모집 보너스', calc_type = 'TIER', value = NULL
WHERE id = 'cc000001-0000-0000-0000-000000000004';

DELETE FROM commission_tiers WHERE rule_id = 'cc000001-0000-0000-0000-000000000004';
INSERT INTO commission_tiers (rule_id, rank_id, rank_level, rate) VALUES
  ('cc000001-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000001', 1, 0.0000),   -- 멤버 0%
  ('cc000001-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000002', 2, 2.0000),   -- 매니저 2%
  ('cc000001-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000003', 3, 3.0000);   -- 디렉터 3%

-- ⑦ 수당 재원 설명 업데이트
UPDATE system_settings SET value = '1' WHERE key = 'sponsor_depth_limit';

-- =============================================
-- 최종 수당 구조 확인
-- =============================================
-- 멤버 (5만원+)
--   소개 수당: 어떤 창업자든 창업비 × 5%
--
-- 매니저 (330만원, 실 300만)
--   판권:        창업비 × 25% = 75만원/건 (1회)
--   관리비용:    팀원 판권 수익 × 10% (지속)
--   패스트스타트: 창업비 × 3%  =  9만원 (90일 조건)
--   팀원첫모집:  창업비 × 2%  =  6만원/건
--   개인 수당 합계: 40%
--
-- 디렉터 (550만원, 실 500만)
--   판권:        창업비 × 32% = 160만원/건 (1회)
--   관리비용:    팀원 판권 수익 × 10% (지속)
--   패스트스타트: 창업비 × 5%  = 25만원 (90일 조건)
--   팀원첫모집:  창업비 × 3%  = 15만원/건
--   개인 수당 합계: 50%
--
-- 공동 풀 (월 전체 창업비 기준)
--   매니저 풀:   2% ÷ 매니저 수 (N분의1)
--   디렉터 풀:   2% ÷ 디렉터 수 (N분의1)
--   회사 재량:   1% (관리자 지정)
--
-- 총 수당 재원: 관리자 55% / 회원 표시 54%
-- =============================================
