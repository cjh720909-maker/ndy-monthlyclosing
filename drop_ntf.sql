-- NTF 테이블 삭제 (prj_monthly_closing 스키마)
-- 이 프로젝트에서 사용하지 않는 테이블 정리
-- 외래키 의존성 순서 고려하여 삭제

DROP TABLE IF EXISTS "prj_monthly_closing"."NTF_YongchaRateDetail" CASCADE;
DROP TABLE IF EXISTS "prj_monthly_closing"."NTF_YongchaContract" CASCADE;
DROP TABLE IF EXISTS "prj_monthly_closing"."NTF_SettlementHistory" CASCADE;
DROP TABLE IF EXISTS "prj_monthly_closing"."NTF_Driver" CASCADE;
DROP TABLE IF EXISTS "prj_monthly_closing"."NTF_Affiliation" CASCADE;
DROP TABLE IF EXISTS "prj_monthly_closing"."NTF_User" CASCADE;
