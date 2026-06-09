-- =============================================
-- 농축수산물 방판 플랜 시드 데이터
-- =============================================

-- ① 직급
INSERT INTO ranks (id, code, name, level, min_pv, min_gv, min_direct_referral, color, badge_icon) VALUES
  ('aa000001-0000-0000-0000-000000000001', 'MEMBER',   '멤버',   1,  50000,        0, 0, '#6B7280', 'user'),
  ('aa000001-0000-0000-0000-000000000002', 'MANAGER',  '매니저', 2,       0, 10000000, 0, '#378ADD', 'star'),
  ('aa000001-0000-0000-0000-000000000003', 'DIRECTOR', '디렉터', 3,       0, 20000000, 3, '#E8599A', 'crown');

-- ② 수당 플랜 마스터
INSERT INTO commission_plans (id, name, type, description, is_active) VALUES
  ('bb000001-0000-0000-0000-000000000001',
   '농축수산물 1대 방판 플랜',
   'UNILEVEL',
   '1대 오버라이드 구조 | 창업비 기준 55% 수당',
   true);

-- 활성 플랜 & 수당 깊이 설정
UPDATE system_settings SET value = 'bb000001-0000-0000-0000-000000000001' WHERE key = 'active_plan_id';
UPDATE system_settings SET value = '1' WHERE key = 'sponsor_depth_limit';

-- ③ 수당 룰

-- [룰1] 직판 수당 — 창업자 본인이 받는 수당 32%
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000001',
   'bb000001-0000-0000-0000-000000000001',
   '직판 수당', 'REFERRAL', 0, 0, 'PERCENT', 32.0000, 'PRICE', 1, 10);

-- [룰2] 추천 오버라이드 — 직추천자(상위) 1대만 수령 / 멤버 5% / 매니저·디렉터 10%
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, base, min_rank_level, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000002',
   'bb000001-0000-0000-0000-000000000001',
   '추천 오버라이드', 'REFERRAL', 1, 1, 'TIER', 'PRICE', 1, 20);

INSERT INTO commission_tiers (rule_id, rank_id, rank_level, rate) VALUES
  ('cc000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000001', 1,  5.0000), -- 멤버   5%
  ('cc000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000002', 2, 10.0000), -- 매니저 10%
  ('cc000001-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000003', 3, 10.0000); -- 디렉터 10%

-- [룰3] 패스트 스타트 — 가입 후 90일 내 달성 시 추가 5%
--   (시스템에서 joined_at + 90일 조건 체크 후 수동 또는 자동 지급)
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000003',
   'bb000001-0000-0000-0000-000000000001',
   '패스트 스타트 보너스', 'RANK_BONUS', 0, 0, 'PERCENT', 5.0000, 'PRICE', 2, 30);

-- [룰4] 팀원 첫모집 보너스 — 내 직추천 팀원이 첫 모집 성공 시 3%
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000004',
   'bb000001-0000-0000-0000-000000000001',
   '팀원 첫모집 보너스', 'MATCHING', 1, 1, 'PERCENT', 3.0000, 'PRICE', 2, 40);

-- [룰5] 매니저 풀 — 전체 창업비의 2% / 매니저 인원수 N분의 1 균등 배분
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, is_volume_only, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000005',
   'bb000001-0000-0000-0000-000000000001',
   '매니저 풀', 'VOLUME', 0, 0, 'PERCENT', 2.0000, 'PRICE', 2, false, 50);

-- [룰6] 디렉터 풀 — 전체 창업비의 2% / 디렉터 인원수 N분의 1 균등 배분
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, is_volume_only, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000006',
   'bb000001-0000-0000-0000-000000000001',
   '디렉터 풀', 'VOLUME', 0, 0, 'PERCENT', 2.0000, 'PRICE', 3, false, 60);

-- [룰7] 회사 재량 풀 — 전체 창업비의 1% / 회사 임의 지급
INSERT INTO commission_rules
  (id, plan_id, name, rule_type, target_depth_from, target_depth_to, calc_type, value, base, min_rank_level, is_volume_only, sort_order)
VALUES
  ('cc000001-0000-0000-0000-000000000007',
   'bb000001-0000-0000-0000-000000000001',
   '회사 재량 풀', 'VOLUME', 0, 0, 'PERCENT', 1.0000, 'PRICE', 1, false, 70);

-- =============================================
-- 수당 구조 요약
-- =============================================
-- 창업비 300만원(매니저) / 500만원(디렉터) 기준
--
-- 직판 수당       32%  본인
-- 추천 오버라이드 10%  직추천 상위 1대 (멤버는 5%)
-- 패스트 스타트    5%  본인 (가입 후 90일 조건)
-- 팀원 첫모집      3%  직추천 상위 (팀원 첫모집 성공 시)
-- 매니저 풀        2%  매니저 전체 N분의 1
-- 디렉터 풀        2%  디렉터 전체 N분의 1
-- 회사 재량        1%  회사 지정
-- 회사 수익       45%
-- ─────────────────────────────────────────
-- 합계           100%
--
-- 승급 조건
-- 멤버  → 매니저: 직추천 창업비 누적 1,000만원
-- 매니저 → 디렉터: 직추천 매니저 3명 + 산하 전체 누적매출 2,000만원
-- =============================================
