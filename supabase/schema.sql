-- =============================================
-- BANGPAN PRO — DB 스키마
-- =============================================

-- ▸ Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- 1. 회원 관련
-- =============================================

-- 직급 테이블
CREATE TABLE ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,         -- RANK_01, RANK_02 ...
  name VARCHAR(50) NOT NULL,                -- 일반회원, 실버, 골드 ...
  level INT NOT NULL,                       -- 숫자가 클수록 높은 직급
  min_pv INT DEFAULT 0,                     -- 직급 유지 최소 개인 PV
  min_gv INT DEFAULT 0,                     -- 직급 유지 최소 그룹 GV
  min_direct_referral INT DEFAULT 0,        -- 직접 추천인 최소 수
  color VARCHAR(20) DEFAULT '#C9A84C',      -- UI 표시 색상
  badge_icon VARCHAR(50),                   -- 배지 아이콘
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회원 테이블
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_code VARCHAR(20) UNIQUE NOT NULL,  -- 회원번호 M-000001
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  
  -- 조직 구조
  sponsor_id UUID REFERENCES members(id),  -- 추천인 (상위)
  placement_id UUID REFERENCES members(id),-- 배치 상위 (바이너리용)
  placement_side VARCHAR(5),               -- LEFT / RIGHT (바이너리용)
  
  -- 직급 & 실적
  rank_id UUID REFERENCES ranks(id),
  personal_pv INT DEFAULT 0,               -- 개인 PV (월 초기화)
  group_gv INT DEFAULT 0,                  -- 그룹 GV (누적)
  left_volume INT DEFAULT 0,               -- 좌측 볼륨 (바이너리)
  right_volume INT DEFAULT 0,              -- 우측 볼륨 (바이너리)
  
  -- 계좌 정보
  bank_name VARCHAR(30),
  bank_account VARCHAR(50),
  bank_holder VARCHAR(30),
  
  -- 상태
  status VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE / INACTIVE / SUSPENDED
  is_admin BOOLEAN DEFAULT FALSE,
  joined_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 회원 트리 경로 (재귀 없이 빠른 하위 조회용)
CREATE TABLE member_paths (
  ancestor_id UUID REFERENCES members(id),
  descendant_id UUID REFERENCES members(id),
  depth INT NOT NULL,
  PRIMARY KEY (ancestor_id, descendant_id)
);

-- =============================================
-- 2. 상품 & 주문
-- =============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,                       -- 소비자가 (원)
  member_price INT NOT NULL,                -- 회원가 (원)
  pv INT NOT NULL DEFAULT 0,               -- PV 포인트
  bv INT NOT NULL DEFAULT 0,               -- BV (수당 계산용)
  category VARCHAR(50),
  image_url TEXT,
  stock INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code VARCHAR(30) UNIQUE NOT NULL,   -- ORD-20240101-000001
  member_id UUID NOT NULL REFERENCES members(id),
  
  total_price INT NOT NULL,
  total_pv INT NOT NULL DEFAULT 0,
  total_bv INT NOT NULL DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'PENDING',     -- PENDING/PAID/SHIPPING/DELIVERED/CANCELLED
  payment_method VARCHAR(30),
  paid_at TIMESTAMPTZ,
  
  shipping_name VARCHAR(50),
  shipping_phone VARCHAR(20),
  shipping_address TEXT,
  shipping_memo TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  unit_price INT NOT NULL,
  unit_pv INT NOT NULL DEFAULT 0,
  unit_bv INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. 수당 플랜 설정 (핵심)
-- =============================================

-- 수당 플랜 마스터
CREATE TABLE commission_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,                -- UNILEVEL / BINARY / MATRIX / HYBRID / SHARED
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수당 룰 (플랜의 세부 규칙들)
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES commission_plans(id),
  name VARCHAR(100) NOT NULL,               -- 추천수당, 팀수당, 직급수당...
  rule_type VARCHAR(30) NOT NULL,           -- REFERRAL / TEAM / RANK_BONUS / MATCHING / VOLUME
  
  -- 대상 설정
  target_depth_from INT DEFAULT 1,          -- 몇 단계부터
  target_depth_to INT DEFAULT 1,            -- 몇 단계까지 (0=무제한)
  target_side VARCHAR(10),                  -- ALL / LEFT / RIGHT / WEAK (바이너리)
  
  -- 금액/비율 설정
  calc_type VARCHAR(20) NOT NULL,           -- PERCENT / FIXED / TIER
  value DECIMAL(10,4),                      -- % 또는 고정금액
  base VARCHAR(20) DEFAULT 'BV',            -- BV / PV / PRICE
  
  -- 자격 조건
  min_rank_level INT DEFAULT 0,
  min_personal_pv INT DEFAULT 0,
  min_direct_referral INT DEFAULT 0,
  
  -- 볼륨 여부 (공유수당형: 수당이 아닌 볼륨으로만)
  is_volume_only BOOLEAN DEFAULT FALSE,
  
  -- 한도
  max_amount INT,                           -- 회당 최대 수당
  max_monthly INT,                          -- 월 최대 수당
  
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 직급별 수당 비율 (TIER 타입용)
CREATE TABLE commission_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES commission_rules(id),
  rank_id UUID REFERENCES ranks(id),
  rank_level INT,
  rate DECIMAL(10,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. 수당 계산 & 정산
-- =============================================

-- 정산 기간
CREATE TABLE settlement_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INT NOT NULL,
  month INT NOT NULL,
  status VARCHAR(20) DEFAULT 'OPEN',        -- OPEN / CALCULATING / CLOSED / PAID
  total_bv INT DEFAULT 0,
  total_commission BIGINT DEFAULT 0,
  calculated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- 수당 내역 (계산 결과)
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id UUID NOT NULL REFERENCES settlement_periods(id),
  member_id UUID NOT NULL REFERENCES members(id),
  rule_id UUID NOT NULL REFERENCES commission_rules(id),
  
  -- 발생 원인
  source_member_id UUID REFERENCES members(id),  -- 수당 발생시킨 회원
  source_order_id UUID REFERENCES orders(id),     -- 수당 발생시킨 주문
  
  depth INT,                                -- 몇 단계 하위
  side VARCHAR(10),                         -- LEFT / RIGHT
  
  base_amount BIGINT NOT NULL,              -- 계산 기준 금액
  rate DECIMAL(10,4),
  amount BIGINT NOT NULL,                   -- 수당액 (원)
  
  status VARCHAR(20) DEFAULT 'CALCULATED',  -- CALCULATED / CONFIRMED / PAID / CANCELLED
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 실지급 내역
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id UUID NOT NULL REFERENCES settlement_periods(id),
  member_id UUID NOT NULL REFERENCES members(id),
  
  gross_amount BIGINT NOT NULL,             -- 총 수당
  tax_rate DECIMAL(5,4) DEFAULT 0.033,     -- 세율 (3.3%)
  tax_amount BIGINT NOT NULL,
  net_amount BIGINT NOT NULL,               -- 실지급액
  
  bank_name VARCHAR(30),
  bank_account VARCHAR(50),
  bank_holder VARCHAR(30),
  
  status VARCHAR(20) DEFAULT 'PENDING',     -- PENDING / COMPLETED / FAILED
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. 시스템 설정
-- =============================================

CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 시스템 설정 삽입
INSERT INTO system_settings (key, value, description) VALUES
  ('company_name', '회사명', '회사명'),
  ('active_plan_id', '', '현재 활성 수당 플랜 ID'),
  ('settlement_day', '25', '정산 기준일'),
  ('payout_day', '10', '지급일'),
  ('tax_rate', '0.033', '원천징수 세율'),
  ('min_payout', '10000', '최소 지급액 (원)'),
  ('sponsor_depth_limit', '2', '수당 지급 최대 단계 (공유수당형)'),
  ('currency', 'KRW', '통화');

-- =============================================
-- 6. 인덱스
-- =============================================

CREATE INDEX idx_members_sponsor ON members(sponsor_id);
CREATE INDEX idx_members_placement ON members(placement_id);
CREATE INDEX idx_members_rank ON members(rank_id);
CREATE INDEX idx_member_paths_ancestor ON member_paths(ancestor_id);
CREATE INDEX idx_member_paths_descendant ON member_paths(descendant_id);
CREATE INDEX idx_orders_member ON orders(member_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_commissions_period ON commissions(period_id);
CREATE INDEX idx_commissions_member ON commissions(member_id);
CREATE INDEX idx_payouts_period ON payouts(period_id);
CREATE INDEX idx_payouts_member ON payouts(member_id);

-- =============================================
-- 7. RLS (Row Level Security)
-- =============================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- 관리자 정책 (service role은 모두 접근 가능)
-- 회원은 본인 데이터만 조회
CREATE POLICY "members_self" ON members FOR SELECT
  USING (auth.uid()::text = id::text OR 
    EXISTS (SELECT 1 FROM members WHERE id::text = auth.uid()::text AND is_admin = true));
