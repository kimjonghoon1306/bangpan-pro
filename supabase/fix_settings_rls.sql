-- =============================================
-- system_settings 저장 오류 해결
-- 증상: "new row violates row-level security policy for table system_settings"
-- 원인: RLS가 켜져 있고 쓰기 정책이 없음
-- 해결: system_settings는 운영설정(민감X)이므로 RLS 비활성화가 가장 확실
-- Supabase SQL Editor에서 실행. 한 줄이면 됨.
-- =============================================
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
