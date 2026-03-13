-- 1. 신규 스키마 생성 (방 만들기)
CREATE SCHEMA IF NOT EXISTS prj_monthly_closing;

-- 💡 [주의] 데이터 보호 규칙에 따라 아래 과정은 수동으로 하나씩 검증하며 진행합니다.
-- 2. 기존 public 스키마의 테이블 구조를 prj_monthly_closing으로 복제하는 예시
-- (Prisma Client가 새로운 스키마를 바라보게 설정한 후, 
-- 신규 스키마에 테이블이 자동 생성되지 않도록 수동으로 제어합니다.)

-- 예: NMC_User 테이블을 새로운 방으로 이동 (필요 시)
-- ALTER TABLE public."NMC_User" SET SCHEMA prj_monthly_closing;

-- 3. 권한 설정 (방 입출입 제한)
-- prj_monthly_closing 스키마에 대한 모든 권한을 현재 유저에게 부여
GRANT ALL ON SCHEMA prj_monthly_closing TO neondb_owner;
