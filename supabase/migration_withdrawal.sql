-- =============================================
-- 출금 신청 관련 컬럼 & 테이블 추가
-- schema.sql 이후 실행
-- =============================================

-- members 테이블에 출금 관련 컬럼 추가
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS resident_number_enc  TEXT,
  ADD COLUMN IF NOT EXISTS resident_verified    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS withdrawal_available BIGINT  DEFAULT 0;

-- 출금 신청 테이블
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id         UUID NOT NULL REFERENCES members(id),
  amount            BIGINT NOT NULL,
  tax_amount        BIGINT NOT NULL,
  net_amount        BIGINT NOT NULL,
  bank_name         VARCHAR(30),
  bank_account      VARCHAR(50),
  bank_holder       VARCHAR(30),
  resident_number_enc TEXT,
  status            VARCHAR(20) DEFAULT 'PENDING', -- PENDING / APPROVED / PAID / REJECTED
  week_start        DATE,
  week_end          DATE,
  payment_date      DATE,
  approved_at       TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  rejected_reason   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_member ON withdrawal_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
