-- [NMC 접두사 통일화 SQL 스크립트]
-- prj_monthly_closing 스키마 내의 테이블명을 변경합니다.

ALTER TABLE "prj_monthly_closing"."NDY_BillingItem" RENAME TO "NMC_BillingItem";
ALTER TABLE "prj_monthly_closing"."NDY_BillingRate" RENAME TO "NMC_BillingRate";
ALTER TABLE "prj_monthly_closing"."NDY_Config" RENAME TO "NMC_Config";
ALTER TABLE "prj_monthly_closing"."NDY_DailySummary" RENAME TO "NMC_DailySummary";
ALTER TABLE "prj_monthly_closing"."NDY_DailySummaryItem" RENAME TO "NMC_DailySummaryItem";
ALTER TABLE "prj_monthly_closing"."NDY_EmergencyRate" RENAME TO "NMC_EmergencyRate";
ALTER TABLE "prj_monthly_closing"."NDY_EmergencySettlement" RENAME TO "NMC_EmergencySettlement";
ALTER TABLE "prj_monthly_closing"."NDY_FixedSettlement" RENAME TO "NMC_FixedSettlement";
ALTER TABLE "prj_monthly_closing"."NDY_GSSettlement" RENAME TO "NMC_GSSettlement";
ALTER TABLE "prj_monthly_closing"."NDY_GSSummary" RENAME TO "NMC_GSSummary";
ALTER TABLE "prj_monthly_closing"."NDY_InquirySettlement" RENAME TO "NMC_InquirySettlement";
ALTER TABLE "prj_monthly_closing"."NDY_MonthlyClosing" RENAME TO "NMC_MonthlyClosing";

-- 이관 완료 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'prj_monthly_closing' 
AND table_name LIKE 'NMC_%';
