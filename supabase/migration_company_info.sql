-- =============================================
-- 회사 정보 설정 키 추가 (기존 운영 DB용)
-- Supabase SQL Editor에서 실행. 중복 실행 안전(ON CONFLICT)
-- =============================================
INSERT INTO system_settings (key, value, description) VALUES
  ('company_ceo',           '', '대표자'),
  ('company_biz_no',        '', '사업자등록번호'),
  ('company_mailorder_no',  '', '통신판매업 신고번호'),
  ('company_phone',         '', '대표 연락처'),
  ('company_email',         '', '이메일'),
  ('company_address',       '', '주소'),
  ('company_intro',         '', '회사 소개')
ON CONFLICT (key) DO NOTHING;
