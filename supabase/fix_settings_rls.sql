-- =============================================
-- system_settings RLS 정책 수정
-- 증상: 저장 시 "new row violates row-level security policy" 에러
-- Supabase SQL Editor에서 실행. 중복 실행 안전.
-- =============================================
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_settings_all" ON system_settings;
CREATE POLICY "system_settings_all" ON system_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
